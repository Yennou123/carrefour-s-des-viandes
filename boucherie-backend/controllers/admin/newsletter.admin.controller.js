// controllers/newsletter.admin.controller.js
const { Newsletter } = require('../../models');


exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.findAll({
      order: [['createdAt', 'DESC']] // Les plus récents en premier
    });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des abonnés." });
  }
};

exports.deletenewsletter = async (req, res) => {
  try {
    const { id } = req.params; // Pour la suppression via ID (Admin)
    const { email } = req.query; // Pour la suppression via Email (Lien client)

    let condition = {};

    if (id) {
      condition = { id: id };
    } else if (email) {
      condition = { email: email };
    } else {
      return res.status(400).json({ message: "ID ou Email requis pour la suppression." });
    }

    const deleted = await Newsletter.destroy({ where: condition });

    if (deleted) {
      return res.status(200).json({ message: "Suppression réussie." });
    } else {
      return res.status(404).json({ message: "Abonné non trouvé." });
    }
  } catch (error) {
    console.error("Erreur suppression newsletter:", error);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

exports.restoreNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await Newsletter.findByPk(id, { paranoid: false });
    if (!subscriber) return res.status(404).json({ message: "Abonné non trouvé." });
    if (!subscriber.deletedAt) return res.status(400).json({ message: "L'abonné n'est pas supprimé." });

    await subscriber.restore();
    return res.status(200).json({ message: "Abonné restauré avec succès." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la restauration." });
  }
};