// models/product.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');



const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  price_per_kg: {
    type: DataTypes.INTEGER
  },
  price_per_unit: {
    type: DataTypes.INTEGER
  },
  unit_type: {
    type: DataTypes.ENUM('Poids', 'Pièce'),
    allowNull: false
  },
  stock_quantity: {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false
  },
  is_new_arrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_on_promotion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  promotion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  promotion_price: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING
  },
  details: {
    type: DataTypes.JSON, // Ex : ["Frais", "Bio", "Origine Maroc"]
    allowNull: true
  },
  average_rating: {
    type: DataTypes.FLOAT, // Change INTEGER par FLOAT
    defaultValue: 0
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  paranoid: true
});


module.exports = Product;