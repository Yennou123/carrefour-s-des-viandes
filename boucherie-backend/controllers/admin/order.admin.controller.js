// controllers/order.admin.controller.js
const { OrderItem, Order, Product, User } = require('../../models');
const allowedOrderStatuses = new Set(['Pending', 'Processing', 'Ready_for_Pickup', 'Delivered', 'Cancelled', 'Confirmed']);
const allowedPaymentStatuses = new Set(['Pending', 'Paid', 'Failed', 'Refunded']);

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                {
                    model: User,
                    as: "client",
                    attributes: ["id", "email", "firstName", "lastName"]
                }
            ]
        });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                { model: User, as: "client", attributes: ["id", "email"] }
            ]
        });

        if (!order) return res.status(404).json({ message: "Commande introuvable." });

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: "Commande introuvable." });

        if (status !== undefined && !allowedOrderStatuses.has(status)) {
            return res.status(400).json({ message: "Le statut de commande est invalide." });
        }

        await order.update({ status });

        res.json({ message: "Commande mise à jour.", order });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: "Commande introuvable." });

        await order.destroy();
        res.json({ message: "Commande supprimée." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.restoreOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { paranoid: false });
        if (!order) return res.status(404).json({ message: "Commande introuvable." });
        if (!order.deletedAt) return res.status(400).json({ message: "La commande n'est pas supprimée." });

        await order.restore();
        return res.status(200).json({ message: "Commande restaurée avec succès." });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur." });
    }
};
