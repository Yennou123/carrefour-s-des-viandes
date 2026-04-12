// controllers/support.admin.controller.js
const { SupportTicket, User } = require('../../models');


// 📌 Liste de tous les tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.findAll({
            include: [{ model: User, as: "client", attributes: ["id", "email", "firstName", "lastName"] }],
            order: [["createdAt", "DESC"]]
        });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Voir un ticket
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findByPk(req.params.id, {
            include: [{ model: User, as: "client", attributes: ["id", "email"] }]
        });

        if (!ticket) return res.status(404).json({ message: "Ticket introuvable." });

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Répondre à un ticket
exports.respondToTicket = async (req, res) => {
    try {
        const { response } = req.body;

        const ticket = await SupportTicket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket introuvable." });

        await ticket.update({
            admin_response: response,
            status: "In_Progress"
        });

        res.json({ message: "Réponse envoyée.", ticket });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Changer statut
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const ticket = await SupportTicket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket introuvable." });

        await ticket.update({ status });

        res.json({ message: "Statut mis à jour.", ticket });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Supprimer
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket introuvable." });

        await ticket.destroy();

        res.json({ message: "Ticket supprimé." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.restoreTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findByPk(req.params.id, { paranoid: false });
        if (!ticket) return res.status(404).json({ message: "Ticket introuvable." });
        if (!ticket.deletedAt) return res.status(400).json({ message: "Le ticket n'est pas supprimé." });

        await ticket.restore();
        return res.status(200).json({ message: "Ticket restauré avec succès." });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur." });
    }
};
