// models/cart.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'carts',
  timestamps: true,
  paranoid: true,
});

module.exports = Cart;
