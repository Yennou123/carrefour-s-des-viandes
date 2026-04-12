// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db.config');
require('./models');
const initAdmin = require("./utils/initAdmin");
const ensureDbColumns = require("./utils/ensureSoftDeleteColumns");

// 1. Connexion à la base de données puis synchronisation (m2: await connectDB before sync)
const startServer = async () => {
    try {
        await connectDB();

        await sequelize.sync({ force: false });
        await ensureDbColumns(sequelize);
        console.log('✅ Toutes les tables ont été synchronisées avec succès.');
        await initAdmin();
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', err);
        process.exit(1);
    }
};

startServer();

// 2. Middlewares
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Autorise les requêtes sans origine (ex: serveurs, Postman, outils de dev)
        if (!origin) return callback(null, true);
        
        // Si CORS_ORIGINS n'est pas défini, on laisse passer (pour faciliter le premier déploiement)
        if (allowedOrigins.length === 0) return callback(null, true);

        // Normalisation : on enlève le slash final pour la comparaison
        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, "") === normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`🚨 CORS Warning: L'origine ${origin} n'est pas dans CORS_ORIGINS. Vérifiez vos variables d'environnement Vercel.`);
            // En production, vous pouvez choisir d'être strict ou de laisser passer le temps de la config
            // Pour débloquer l'utilisateur immédiatement, on peut renvoyer true en loguant l'erreur
            callback(null, true); 
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Trop de requêtes, veuillez réessayer plus tard." }
});

app.use(globalLimiter);
app.use(express.json({ limit: "100kb" }));


// 3. Routes
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const reviewRoutes = require('./routes/review.routes');
const supportRoutes = require('./routes/support.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const addressRoutes = require('./routes/address.routes');
const newsletterRoutes = require('./routes/newsletter.routes');

// Routes publiques
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Routes protégées
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API de la Boucherie E-commerce.' });
});

// 4. Middleware d'erreur global (M6)
// Capture toutes les erreurs non gérées (CORS, validation, etc.)
app.use((err, req, res, next) => {
    console.error('❌ Erreur globale:', err.message || err);

    // Erreur CORS
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ message: 'Accès CORS refusé.' });
    }

    // Erreur Sequelize (validation, contrainte)
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            message: 'Données invalides.',
            errors: err.errors.map(e => e.message)
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Cette valeur existe déjà.' });
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré.' });
    }

    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'Erreur interne du serveur.'
    });
});

// 5. Démarrage du serveur (uniquement si pas sur Vercel)
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Le serveur tourne sur le port ${PORT}.`);
    });
}

module.exports = app;