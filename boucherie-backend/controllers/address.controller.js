// controllers/address.controller.js
const axios = require('axios');
const { Address } = require('../models');
const isValidCoordinate = (value, min, max) => Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;

// 📦 Créer ou mettre à jour une adresse pour un utilisateur
exports.saveAddress = async (req, res) => {
  try {
    const userId = req.user.id; // récupéré depuis le middleware d'auth
    const { label, street, city, zipCode, country, latitude, longitude } = req.body;
    if (!street || !city || !country) {
      return res.status(400).json({ message: "Les champs street, city et country sont obligatoires." });
    }
    if (
      (latitude !== undefined && !isValidCoordinate(latitude, -90, 90)) ||
      (longitude !== undefined && !isValidCoordinate(longitude, -180, 180))
    ) {
      return res.status(400).json({ message: "Latitude/longitude invalides." });
    }


    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    let address = await Address.findOne({ where: { userId, is_default: true } });

    if (address) {
      await address.update({ label, street, city, zipCode, country, latitude, longitude });
    } else {
      address = await Address.create({
        userId,
        label,
        street,
        city,
        zipCode,
        country,
        latitude,
        longitude,
        is_default: true,
      });
    }

    res.status(200).json({ message: "Adresse enregistree avec succes", address });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'adresse:", error);
    res.status(500).json({ message: "Erreur serveur lors de la sauvegarde de l'adresse." });
  }
};

// 📦 Récupérer l'adresse par défaut d'un utilisateur
exports.getUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const address = await Address.findOne({ where: { userId, is_default: true } });
    if (!address) return res.status(404).json({ message: "Aucune adresse trouvee." });

    res.status(200).json(address);
  } catch (error) {
    console.error("Erreur recuperation adresse:", error);
    res.status(500).json({ message: "Erreur serveur lors de la recuperation de l'adresse." });
  }
};


exports.reverseGeocode = async (req, res) => {
  const { lat, lon } = req.query;
  try {
    if (!isValidCoordinate(lat, -90, 90) || !isValidCoordinate(lon, -180, 180)) {
      return res.status(400).json({ message: 'Paramètres lat/lon invalides.' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', addressdetails: 1 },
      headers: { 'User-Agent': 'E-BoucherieApp/1.0' }
    });

    const addr = response.data.address;
    
    // Logique de secours si la rue n'existe pas dans la base OSM
    res.json({
      street: addr.road || addr.suburb || addr.neighbourhood || 'Secteur non défini',
      city: addr.city || addr.town || addr.village || 'Ouagadougou',
      zipCode: addr.postcode || 'BP 00',
      country: addr.country || 'Burkina Faso',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur de géocodage.' });
  }
};