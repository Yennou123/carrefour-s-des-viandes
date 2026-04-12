const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const Notification = require('./notification.model');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Ready_for_Pickup', 'Delivered', 'Cancelled', 'Confirmed'),
    defaultValue: 'Pending'
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  payment_method: {
    type: DataTypes.STRING, // "Paiement à la réception", "mobile", "card", etc.
    allowNull: true
  },
  delivery_slot: {
    type: DataTypes.STRING
  },
  whatsapp_contact_requested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
});


Order.afterCreate(async (order, options) => {
    await Notification.create({
        type: 'NEW_ORDER',
        title: 'Nouvelle commande reçue',
        message: `Nouvelle commande #${order.id} - Montant: ${order.total_amount} FCFA`,
        referenceId: order.id
    });
});

module.exports = Order;
