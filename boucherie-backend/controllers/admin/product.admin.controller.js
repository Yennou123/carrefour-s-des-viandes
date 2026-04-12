// controllers/product.admin.controller.js
const { Product } = require('../../models');

exports.createProduct = async (req, res) => {
    try {
        const { stock_quantity = 0, price_per_kg, price_per_unit, unit_type, is_on_promotion, promotion_percentage, ...data } = req.body;

        // Sécurité : Vérifier qu'au moins un prix est présent selon le type
        let basePrice = 0;
        if (unit_type === "Poids") {
            if (!price_per_kg || price_per_kg <= 0) return res.status(400).json({ message: "Prix au kilo obligatoire." });
            basePrice = price_per_kg;
        } else {
            if (!price_per_unit || price_per_unit <= 0) return res.status(400).json({ message: "Prix à l'unité obligatoire." });
            basePrice = price_per_unit;
        }

        // Calcul du prix promo si activé
        let promotion_price = null;
        if (is_on_promotion && promotion_percentage > 0) {
            promotion_price = Math.round(basePrice * (1 - promotion_percentage / 100));
        }

        const product = await Product.create({
            ...data,
            unit_type,
            price_per_kg,
            price_per_unit,
            stock_quantity,
            is_on_promotion,
            promotion_percentage,
            promotion_price
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: "Erreur création produit", error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit introuvable." });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit introuvable." });

        const allowedFields = [
            "name", "description", "category",
            "price_per_kg", "price_per_unit", "unit_type",
            "stock_quantity", "is_new_arrival", "is_on_promotion",
            "promotion_percentage", "promotion_price", // On autorise l'envoi manuel ou automatique
            "image_url", "details"
        ];

        const payload = { ...req.body };

        // Recalcul automatique du prix promo lors de l'update
        const finalOnPromo = payload.is_on_promotion !== undefined ? payload.is_on_promotion : product.is_on_promotion;
        const finalPercentage = payload.promotion_percentage !== undefined ? payload.promotion_percentage : product.promotion_percentage;
        const finalUnitType = payload.unit_type || product.unit_type;
        const finalKgPrice = payload.price_per_kg || product.price_per_kg;
        const finalUnitWeightPrice = payload.price_per_unit || product.price_per_unit;

        if (finalOnPromo && finalPercentage > 0) {
            const basePrice = finalUnitType === "Poids" ? finalKgPrice : finalUnitWeightPrice;
            payload.promotion_price = Math.round(basePrice * (1 - finalPercentage / 100));
        } else if (!finalOnPromo) {
            payload.promotion_price = null;
            payload.promotion_percentage = 0;
        }

        const sanitizedPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => allowedFields.includes(key))
        );

        await product.update(sanitizedPayload);
        res.json({ message: "Produit mis à jour.", product });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit introuvable." });

        await product.destroy();
        res.json({ message: "Produit supprimé." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.restoreProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, { paranoid: false });
        if (!product) return res.status(404).json({ message: "Produit introuvable." });
        if (!product.deletedAt) return res.status(400).json({ message: "Le produit n'est pas supprimé." });

        await product.restore();
        return res.status(200).json({ message: "Produit restauré avec succès." });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur." });
    }
};
