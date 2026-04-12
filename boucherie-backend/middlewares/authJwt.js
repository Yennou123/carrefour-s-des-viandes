const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

exports.verifyToken = async (req, res, next) => {
    let token = req.headers['authorization'] || req.headers['x-access-token'];

    if (!token) {
        return res.status(403).json({
            message: "Accès refusé. Aucun token fourni."
        });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Non autorisé. Token invalide ou expiré."
            });
        }

        try {
            // 🔒 Vérification utilisateur + blocage
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(401).json({
                    message: "Utilisateur introuvable."
                });
            }

            if (user.isBlocked) {
                return res.status(403).json({
                    message: "Votre compte est bloqué par un administrateur."
                });
            }

            // ✅ LOGIQUE INCHANGÉE
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            next();
        } catch (error) {
            return res.status(500).json({
                message: "Erreur serveur lors de la vérification du token."
            });
        }
    });
};
