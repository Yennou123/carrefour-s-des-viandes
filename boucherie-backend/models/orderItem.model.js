// models/orderItem.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    quantity_ordered: {
        type: DataTypes.DECIMAL(10, 1), // Exemple : 0.500 = 500g
        allowNull: false
    },

    price_at_purchase: {
        type: DataTypes.INTEGER,
        allowNull: false // Prix payé au moment de l'achat
    },

    unit_type_ordered: {
        type: DataTypes.STRING, // Exemple : "kg", "pièce", "lot"
        allowNull: true
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    paranoid: true
});

module.exports = OrderItem;
