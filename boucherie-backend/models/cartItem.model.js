// models/cartItem.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.FLOAT, // ⚡ Peut être décimal pour les produits au poids
    allowNull: false,
    defaultValue: 1,
  },
  unitType: {
    type: DataTypes.ENUM('Poids', 'Pièce'),
    allowNull: false,
  },
  price_per_unit: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  price_per_kg: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'cart_items',
  timestamps: true,
  paranoid: true,
});

module.exports = CartItem;
