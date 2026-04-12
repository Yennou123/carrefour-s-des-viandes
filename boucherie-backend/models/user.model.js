// models/user.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const Notification = require('./notification.model');

// Définit le modèle User
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Validation Sequelize pour s'assurer que c'est un email
        }
    },
    password: {
        type: DataTypes.STRING, // Stocke le mot de passe HACHÉ
        allowNull: true
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    firstName: { // Ajout du prénom
        type: DataTypes.STRING,
        allowNull: true, // Peut être renseigné après l'inscription si le formulaire minimal ne l'inclut pas
    },
    lastName: { // Ajout du nom de famille
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: { // Ajout du numéro de téléphone
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('client', 'admin'),
        allowNull: false,
        defaultValue: 'client',
    }, 
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'users',
    paranoid: true
});

User.beforeValidate((user, options) => {
    // Empêche la création d'un admin sauf si bypass explicite
    if (user.role === "admin" && !options.bypassAdminCheck) {
        throw new Error("L'assignation du rôle admin doit passer par le script interne.");
    }
});


User.afterCreate(async (user, options) => {
    if (user.role === 'client') {
        await Notification.create({
            type: 'NEW_USER',
            title: 'Nouvel utilisateur inscrit',
            message: `Un nouvel utilisateur (${user.email}) vient de s'inscrire.`,
            referenceId: user.id
        });
    }
});

module.exports = User;