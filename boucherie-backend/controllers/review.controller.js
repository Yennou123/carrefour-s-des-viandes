// controllers/review.controller.js
const { Review, Product, User } = require('../models');

// 1. Lire les avis pour un produit donné (Public)
exports.getReviewsByProduct = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: {
                productId: req.params.productId,
                is_approved: true // N'afficher que les avis approuvés
            },
            include: [{ model: User, as: 'client', attributes: ['firstName', 'lastName', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des avis." });
    }
};

// 2. Soumettre un nouvel avis (Protégé par JWT)
exports.createReview = async (req, res) => {
    // userId est injecté par le middleware JWT
    const { rating, comment, productId } = req.body;
    const userId = req.user.id;

    if (!rating || !productId) {
        return res.status(400).json({ message: "La note et l'ID du produit sont obligatoires." });
    }

    try {
        // Vérification de l'existence du produit
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }

        const existingReview = await Review.findOne({
            where: {
                userId,
                productId
            }
        });

        if (existingReview) {
            return res.status(400).json({
                message: "Vous avez déjà donné un avis sur ce produit."
            });
        }

        // Création de l'avis (is_approved est FALSE par défaut)
        const review = await Review.create({
            rating,
            comment,
            userId,
            productId,
        });

        res.status(201).json({
            message: "Avis soumis avec succès. Il sera visible après modération.",
            review: review
        });

    } catch (error) {
        console.error("Erreur de soumission d'avis:", error);
        res.status(500).json({ message: "Erreur interne lors de la soumission de l'avis." });
    }
};

// 3. Récupérer les 3 derniers avis approuvés (Public)
exports.getLatestApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { is_approved: true },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['lastName', 'firstName'],
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'id'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: 3,
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des derniers avis approuvés :", error);
        res.status(500).json({ message: "Erreur interne lors du chargement des avis approuvés." });
    }
};
