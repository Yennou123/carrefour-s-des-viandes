const { Newsletter } = require('../models');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');

// Initialisation de Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signUnsubscribeToken = (email) => {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET manquant");
  }
  return jwt.sign({ email, purpose: 'newsletter_unsubscribe' }, secret, { expiresIn: '7d' });
};

const verifyUnsubscribeToken = (token) => {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET manquant");
  }
  return jwt.verify(token, secret);
};

exports.addnewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }

    // 1. Sauvegarde locale dans la base de données (ou restauration si déjà soft-supprimé)
    const existingSubscriber = await Newsletter.findOne({
      where: { email: normalizedEmail },
      paranoid: false,
    });
    if (existingSubscriber) {
      if (existingSubscriber.deletedAt) {
        await existingSubscriber.restore();
      } else {
        return res.status(400).json({ message: "Cet email est déjà inscrit." });
      }
    } else {
      await Newsletter.create({ email: normalizedEmail });
    }

    const unsubscribeToken = signUnsubscribeToken(normalizedEmail);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${frontendUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

    // 2. Envoi du mail de bienvenue via Resend
    const { data, error } = await resend.emails.send({
      from: "Carrefour'S des Viandes <onboarding@resend.dev>", // Utilise onboarding@resend.dev pour tes tests
      to: [normalizedEmail],
      subject: "Bienvenue chez Carrefour'S des Viandes ! 🥩",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #991b1b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Carrefour'S des Viandes</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #991b1b;">Merci pour votre inscription !</h2>
            <p>Bonjour,</p>
            <p>Nous sommes ravis de vous compter parmi nos abonnés privilégiés.</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #991b1b;">
              <strong>Votre cadeau :</strong> Utilisez le code <b style="color: #991b1b;">GOURMET5</b> pour 5% de réduction.
            </div>
            <p>À très bientôt en boutique ou en ligne !</p>
          </div>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Vous recevez ce mail car vous vous êtes inscrit sur notre site.</p>
            <a href="${unsubscribeUrl}" style="color: #991b1b;">Se désabonner</a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur d'envoi Resend:", error);
      // On ne renvoie pas d'erreur 500 ici car l'utilisateur est déjà en DB
    }

    return res.status(201).json({ 
        message: "Inscription réussie ! Un mail de bienvenue vous a été envoyé." 
    });

  } catch (error) {
    console.error("Erreur serveur Newsletter:", error);
    return res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};


exports.unsubscribe = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Jeton de désinscription requis." });
    }

    let payload;
    try {
      payload = verifyUnsubscribeToken(token);
    } catch (error) {
      return res.status(400).json({ message: "Jeton de désinscription invalide ou expiré." });
    }

    if (!payload?.email || payload.purpose !== 'newsletter_unsubscribe') {
      return res.status(400).json({ message: "Jeton de désinscription invalide." });
    }

    const deleted = await Newsletter.destroy({
      where: { email: payload.email }
    });

    if (deleted) {
      return res.status(200).json({ message: "Vous avez été désabonné avec succès." });
    } else {
      return res.status(404).json({ message: "Email non trouvé." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors du désabonnement." });
  }
};