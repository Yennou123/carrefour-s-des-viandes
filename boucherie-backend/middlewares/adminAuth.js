// boucherie-backend/middlewares/adminAuth.js

/**
 * Middleware de protection ADMIN
 * ⚠️ À utiliser APRÈS verifyToken
 * verifyToken doit définir : req.user = { id, role }
 */

const isAdmin = (req, res, next) => {
    // 🔐 Vérification que l'utilisateur est bien injecté par verifyToken
    if (!req.user) {
        return res.status(401).json({
            message: "Non autorisé : utilisateur non authentifié."
        });
    }

    // 👑 Vérification du rôle (⚠️ minuscule obligatoire)
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: "Accès interdit (403). Compte non autorisé."
        });
    }

    // ✅ OK → admin confirmé
    next();
};

module.exports = isAdmin;
