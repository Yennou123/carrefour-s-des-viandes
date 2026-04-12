const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    type: {
        type: DataTypes.ENUM(
            'NEW_USER',
            'NEW_ORDER',
            'NEW_REVIEW',
            'NEW_SUPPORT',
            'NEW_NEWSLETTER',

        ),
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true // id de la commande, user, review etc.
    }

}, {
    tableName: 'notifications',
    timestamps: true,
    paranoid: true
});

module.exports = Notification;