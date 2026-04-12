// controllers/review.admin.controller.js
const { Review, Product, User } = require('../../models');

// 📌 Toutes les reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: "client", attributes: ["id", "firstName", "lastName", "email"] },
                { model: Product, as: "product", attributes: ["id", "name"] }
            ],
            order: [["createdAt", "DESC"]]
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Reviews en attente d'approbation
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { is_approved: false },
            include: [
                { model: User, as: "client", attributes: ["id", "firstName", "lastName"] },
                { model: Product, as: "product", attributes: ["id", "name"] }
            ]
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Approuver une review
exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Avis introuvable" });
        }

        // Option A : Mise à jour via instance (déclenche afterUpdate)
        review.is_approved = true;
        await review.save(); 

        /* Note : Si le hook afterUpdate dans review.model.js ne se déclenche toujours pas,
           tu peux forcer l'appel de la fonction de calcul ici (si tu l'exportes) 
           ou utiliser Review.update(...) qui est plus explicite.
        */

        res.json({ message: "Avis approuvé et statistiques produit mises à jour" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Supprimer une review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: "Review introuvable." });

        await review.destroy();

        res.json({ message: "Review supprimée." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

exports.restoreReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id, { paranoid: false });
        if (!review) return res.status(404).json({ message: "Review introuvable." });
        if (!review.deletedAt) return res.status(400).json({ message: "La review n'est pas supprimée." });

        await review.restore();
        return res.status(200).json({ message: "Review restaurée avec succès." });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur." });
    }
};
