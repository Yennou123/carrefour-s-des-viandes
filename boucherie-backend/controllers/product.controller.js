// controllers/product.controller.js
const { Op } = require('sequelize');
const { Product } = require('../models');

// ✅ Nouveau contrôleur pour compter les produits en promotion
exports.getPromoProductsCount = async (req, res) => {
  try {
    const totalPromoProducts = await Product.count({
      where: { is_on_promotion: true }
    });
    res.status(200).json({ totalPromoProducts });
  } catch (error) {
    console.error("❌ Erreur lors du comptage des produits en promotion :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ✅ Récupérer tous les produits avec filtres dynamiques et pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      unitType,
      is_on_promotion,
      is_new_arrival,
      search,
      limit,
      page
    } = req.query;

    const where = {};
    const ILIKE = Op.iLike || Op.like;

    if (category) {
      where.category = { [ILIKE]: category };
    }

    if (unitType) where.unit_type = unitType;
    if (is_on_promotion === 'true') where.is_on_promotion = true;
    if (is_new_arrival === 'true') where.is_new_arrival = true;

    if (search) {
      where.name = { [ILIKE]: `%${search}%` };
    }

    // 🔢 Pagination
    const limitValue = limit ? parseInt(limit, 10) : 12; // Par défaut 12 produits par page
    const pageValue = page ? parseInt(page, 10) : 1;
    const offset = (pageValue - 1) * limitValue;

    // 🔽 Exécution de la requête avec comptage
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: limitValue,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      products: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limitValue),
      currentPage: pageValue,
      limit: limitValue
    });
  } catch (err) {
    console.error('Erreur récupération produits:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ✅ Récupérer un produit par son ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Erreur getProductById:', error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
