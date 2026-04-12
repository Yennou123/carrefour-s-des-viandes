// controllers/support.controller.js
const { SupportTicket } = require('../models');

// 1. Créer un nouveau ticket de support (Protégé par JWT)
exports.createTicket = async (req, res) => {
    const { subject, message, priority } = req.body;
    const userId = req.user.id; // Injecté par le middleware JWT

    if (!subject || !message) {
        return res.status(400).json({ message: "Le sujet et le message sont obligatoires." });
    }

    try {
        const ticket = await SupportTicket.create({
            subject,
            message,
            priority: priority || 'Low',
            userId,
        });

        res.status(201).json({ 
            message: "Ticket soumis avec succès. Un administrateur vous répondra bientôt.", 
            ticketId: ticket.id 
        });
    } catch (error) {
        console.error("Erreur de soumission de ticket:", error);
        res.status(500).json({ message: "Erreur interne lors de la soumission du ticket." });
    }
};

// 2. Lire les tickets de l'utilisateur connecté (Protégé par JWT)
exports.getUserTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de vos tickets." });
    }
};