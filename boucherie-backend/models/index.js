// models/index.js
const sequelize = require('../config/db.config').sequelize;

const User = require('./user.model');
const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Review = require('./review.model');
const SupportTicket = require('./supportTicket.model');
const Cart = require('./cart.model');
const CartItem = require('./cartItem.model');
const Address = require('./address.model');
const Notification = require('./notification.model');
const Newsletter = require('./newsletter.model');

// ===============================
// 🔗 ASSOCIATIONS ENTRE MODÈLES
// ===============================

// 👤 UTILISATEUR
User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
User.hasMany(SupportTicket, { foreignKey: 'userId', as: 'supportTickets', onDelete: 'CASCADE' });
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });

// ===============================
// 🧾 COMMANDES
// ===============================

// Une commande appartient à un utilisateur
Order.belongsTo(User, { foreignKey: 'userId', as: 'client' });

// Une commande contient plusieurs articles
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });

// Un article de commande appartient à une commande
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// ===============================
// 🛒 PRODUITS ET ARTICLES DE COMMANDE
// ===============================

// Un produit peut apparaître dans plusieurs OrderItems
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems', onDelete: 'SET NULL' });

// Un OrderItem est lié à un seul produit
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ===============================
// ⭐ AVIS
// ===============================

// Un produit peut avoir plusieurs avis
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });

// Un avis appartient à un utilisateur
Review.belongsTo(User, { foreignKey: 'userId', as: 'client' });

// Un avis concerne un produit
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ===============================
// 🧰 SUPPORT
// ===============================
SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'client' });

// ===============================
// 🛍️ PANIER
// ===============================

// Un utilisateur a un panier
Cart.belongsTo(User, { foreignKey: 'userId', as: 'client' });

// Un panier contient plusieurs CartItems
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });

// Un CartItem appartient à un panier
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// Un CartItem correspond à un produit
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ===============================
// 📍 ADRESSES
// ===============================

// Une adresse appartient à un utilisateur
Address.belongsTo(User, { foreignKey: 'userId', as: 'client' });

// ===============================
// 📦 EXPORT
// ===============================
const models = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Review,
  SupportTicket,
  Cart,
  CartItem,
  Address,
  Notification,
  Newsletter
};

module.exports = models;
