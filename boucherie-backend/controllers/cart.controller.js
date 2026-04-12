// controllers/cart.controller.js
const { Cart, CartItem, Product } = require('../models');

// Map incoming unit types to Sequelize ENUM values
const UNIT_TYPE_MAP = {
  "kg": "Poids",
  "poids": "Poids",
  "unit": "Pièce",
  "unité": "Pièce",
  "piece": "Pièce",
  "pièce": "Pièce",
};
const getAllowedKeys = () => Object.keys(UNIT_TYPE_MAP);

const normalizeUnitType = (raw) => {
  const key = String(raw || "").trim().toLowerCase();
  return UNIT_TYPE_MAP[key] || null;
};

// 📦 Récupérer le panier d’un utilisateur
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Utilisateur non authentifié." });

    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!cart) {
      // ✅ Crée un panier vide s’il n’existe pas
      cart = await Cart.create({ userId, totalPrice: 0 });
      return res.status(200).json({ items: [] });
    }

    const formattedItems = cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      price_per_kg: item.price_per_kg,
      unitType: item.unitType,
    }));

    res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error("Erreur getCart:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du panier." });
  }
};

// ➕ Ajouter un produit au panier
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, unitType } = req.body;
    const parsedQuantity = Number(quantity);
    const normalizedUnitType = normalizeUnitType(unitType);

    if (!userId) return res.status(401).json({ message: "Utilisateur non authentifié." });
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "La quantité doit être un nombre strictement positif." });
    }
    if (!normalizedUnitType) {
      return res.status(400).json({ message: "Le type d'unité est invalide. Valeurs acceptées: " + getAllowedKeys().join(", ") });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Produit non trouvé." });

    // Détermination du prix à stocker (normal ou promo)
    let appliedPriceKg = product.price_per_kg;
    let appliedPriceUnit = product.price_per_unit;

    if (product.is_on_promotion && product.promotion_price) {
      if (product.unit_type === "Poids") {
        appliedPriceKg = product.promotion_price;
      } else {
        appliedPriceUnit = product.promotion_price;
      }
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) cart = await Cart.create({ userId, totalPrice: 0 });

    const [item, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId },
      defaults: {
        quantity: parsedQuantity,
        unitType: normalizedUnitType,
        price_per_unit: appliedPriceUnit,
        price_per_kg: appliedPriceKg,
      },
    });

    if (!created) {
      item.quantity += parsedQuantity;
      // Mise à jour du prix au cas où la promo ait changé entre-temps
      item.price_per_unit = appliedPriceUnit;
      item.price_per_kg = appliedPriceKg;
      await item.save();
    }

    // 🔄 Recalcule le total du panier
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const totalPrice = items.reduce((sum, it) => {
      const price = it.unitType === "Poids" ? it.price_per_kg : it.price_per_unit;
      return sum + (price || 0) * it.quantity;
    }, 0);
    cart.totalPrice = totalPrice;
    await cart.save();

    // 🔁 Recharge le panier complet
    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    const formattedItems = updatedCart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price_per_unit: item.product.price_per_unit,
      price_per_kg: item.product.price_per_kg,
      unitType: item.unitType,
    }));

    res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error("Erreur addToCart:", error);
    res.status(500).json({ message: "Erreur serveur lors de l’ajout au panier." });
  }
};

// ✏️ Modifier la quantité d’un produit
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "La quantité doit être un nombre strictement positif." });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Panier introuvable." });

    const item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!item) return res.status(404).json({ message: "Produit non présent dans le panier." });

    item.quantity = parsedQuantity;
    await item.save();

    // 🔄 Met à jour le total
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const totalPrice = items.reduce((sum, it) => {
      const price = it.unitType === "Poids" ? it.price_per_kg : it.price_per_unit;
      return sum + (price || 0) * it.quantity;
    }, 0);
    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(200).json({ message: "Quantité mise à jour avec succès." });
  } catch (error) {
    console.error("Erreur updateQuantity:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la quantité." });
  }
};

// 🗑️ Supprimer un produit du panier
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Panier introuvable." });

    await CartItem.destroy({ where: { cartId: cart.id, productId } });

    // 🔄 Recalcul du total
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const totalPrice = items.reduce((sum, it) => {
      const price = it.unitType === "Poids" ? it.price_per_kg : it.price_per_unit;
      return sum + (price || 0) * it.quantity;
    }, 0);
    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(200).json({ message: "Produit supprimé du panier." });
  } catch (error) {
    console.error("Erreur removeFromCart:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du produit." });
  }
};

// 🧹 Vider le panier
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Panier introuvable." });

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ message: "Panier vidé avec succès." });
  } catch (error) {
    console.error("Erreur clearCart:", error);
    res.status(500).json({ message: "Erreur serveur lors du vidage du panier." });
  }
};
