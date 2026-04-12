// newsletter.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const Notification = require('./notification.model');

const Newsletter = sequelize.define('Newsletter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    }
}, {
    tableName: 'newsletters',
    timestamps: true, // Recommandé pour avoir createdAt et updatedAt
    paranoid: true
});

// Hook pour créer une notification à chaque nouvel inscrit
Newsletter.afterCreate(async (newsletter, options) => {
    try {
        await Notification.create({
            type: 'NEW_NEWSLETTER',
            title: 'Nouvel abonné à la newsletter',
            message: `Nouvel abonné : ${newsletter.email}`,
            referenceId: newsletter.id
        });
    } catch (error) {
        console.error("Erreur lors de la création de la notification newsletter:", error);
    }
});

module.exports = Newsletter;