// config/db.config.js
require('pg'); // Force le chargement du module pour Vercel/Serverless
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Pour charger les variables d'environnement

const isProduction = process.env.DATABASE_URL ? true : false;

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            connectTimeout: 60000 // Augmente le délai pour l'authentification
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: process.env.DB_DIALECT || 'postgres',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );

// Tente de se connecter
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données PostgreSQL réussie.');
    } catch (error) {
        console.error('Échec de la connexion à la base de données:', error);
    }
}

module.exports = { sequelize, connectDB };