// models/address.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Address = sequelize.define("Address", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { // 👈 AJOUT DE CE CHAMP
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    label: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    street: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    city: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    zipCode: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    country: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    latitude: { 
        type: DataTypes.FLOAT, 
        allowNull: true 
    },
    longitude: { 
        type: DataTypes.FLOAT, 
        allowNull: true 
    },
    is_default: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
}, {
    tableName: 'address',
    paranoid: true
});

module.exports = Address;
