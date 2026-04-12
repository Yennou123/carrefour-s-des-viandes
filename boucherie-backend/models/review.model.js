const { DataTypes, Sequelize } = require('sequelize'); // 1. Ajout de Sequelize ici
const { sequelize } = require('../config/db.config');
const Notification = require('./notification.model');
const Product = require('./product.model'); // Assure-toi que Product est bien importé

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Ajout manuel de productId si Sequelize ne le détecte pas automatiquement dans les hooks
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    paranoid: true,
});

// Fonction de mise à jour
async function updateProductRating(productId) {
    if (!productId) return;

    const stats = await Review.findOne({
        where: {
            productId,
            is_approved: true
        },
        attributes: [
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avg'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        raw: true // 2. Utiliser raw: true pour accéder directement aux données
    });

    // stats contiendra directement 'avg' et 'count' grâce à raw: true
    const average = parseFloat(stats.avg) || 0;
    const count = parseInt(stats.count) || 0;

    await Product.update(
        {
            average_rating: average,
            review_count: count
        },
        { where: { id: productId } }
    );
}


// Hook pour la création (même si is_approved est false, on prépare le terrain)
Review.afterCreate(async (review) => {
    // Notification admin
    await Notification.create({
        type: 'NEW_REVIEW',
        title: 'Nouvel avis client',
        message: `Nouvel avis (${review.rating}/5) en attente.`,
        referenceId: review.id
    });
    
    // Si par hasard l'avis était approuvé d'office, on calcule
    if (review.is_approved) {
        await updateProductRating(review.productId);
    }
});

// Hook pour l'approbation (Update)
Review.afterUpdate(async (review) => {
    // Dès qu'une modification a lieu (comme is_approved passant de false à true)
    // on recalcule pour être sûr que les compteurs sont à jour.
    if (review.productId) {
        await updateProductRating(review.productId);
    }
});

// Hook pour la suppression
Review.afterDestroy(async (review) => {
    if (review.productId) {
        await updateProductRating(review.productId);
    }
});

module.exports = Review;