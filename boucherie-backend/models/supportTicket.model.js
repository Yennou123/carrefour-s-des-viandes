// models/supportTicket.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const Notification = require('./notification.model');

const SupportTicket = sequelize.define('SupportTicket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Clé étrangère gérée dans models/index.js (userId)
    
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Open', 'In_Progress', 'Closed'),
        defaultValue: 'Open'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Low'
    },
    admin_response: {
        type: DataTypes.TEXT,
        allowNull: true // Rempli uniquement par l'administrateur
    }
}, {
    tableName: 'support_tickets',
    timestamps: true,
    paranoid: true,
});


SupportTicket.afterCreate(async (ticket, options) => {
    await Notification.create({
        type: 'NEW_SUPPORT',
        title: 'Nouveau ticket support',
        message: `Nouveau ticket: ${ticket.subject}`,
        referenceId: ticket.id
    });
});

module.exports = SupportTicket;