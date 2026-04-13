const { User, Cart } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!process.env.JWT_SECRET) {
  console.error("⚠️ ERREUR : JWT_SECRET non défini dans le fichier .env !");
}


// ------------------ GOOGLE LOGIN ------------------
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    // 1. Rechercher si l'utilisateur existe déjà par email ou googleId
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // 2. Création de l'utilisateur s'il n'existe pas
      user = await User.create({
        email,
        firstName,
        lastName,
        googleId,
        role: 'client',
        // Le mot de passe reste null pour les comptes Google
      });

      // Création du panier pour le nouvel utilisateur
      await Cart.create({ userId: user.id, totalPrice: 0 });
    } else {
      // 3. Si l'utilisateur existe, s'assurer que le googleId est lié (facultatif mais recommandé)
      if (!user.googleId) {
        await user.update({ googleId });
      }
    }

    // 4. Vérifier si le compte est bloqué
    if (user.isBlocked) {
      return res.status(403).json({ message: "Votre compte est suspendu." });
    }

    // 5. Génération du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accessToken: token,
    });

  } catch (error) {
    console.error("🔥 Erreur Google Login:", error);
    return res.status(500).json({ message: "Échec de l'authentification Google." });
  }
};
const validatePassword = (password) => {
  const minLength = 8;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
  if (password.length < minLength) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!regex.test(password)) return "Le mot de passe doit inclure une majuscule, une minuscule, un chiffre et un caractère spécial.";
  return null;
};

// ------------------ INSCRIPTION ------------------
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Validation mot de passe
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    // Vérifie si l'utilisateur existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création utilisateur (toujours client)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: 'client',
    });

    // Création du panier vide
    await Cart.create({ userId: user.id, totalPrice: 0 });

    // Génération du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    res.status(201).json({
      message: "Inscription réussie.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accessToken: token,
      },
    });

  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur interne du serveur lors de l'inscription." });
  }
};


// ------------------ CONNEXION SÉCURISÉE ------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Recherche de l'utilisateur
    const user = await User.findOne({ where: { email } });

    // 2. Simulation de comparaison même si user null (Anti-Timing Attack)
    const passwordIsValid = user ? await bcrypt.compare(password, user.password) : false;

    // 3. Échec : On renvoie 400 Bad Request
    if (!user || !passwordIsValid) {
      return res.status(400).json({
        message: "Identifiants incorrects. Veuillez réessayer."
      });
    }

    // 4. Compte bloqué
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Votre compte est suspendu. Contactez le support."
      });
    }

    // 5. Succès : Génération du token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    // Initialisation panier si inexistant
    const existingCart = await Cart.findOne({ where: { userId: user.id } });
    if (!existingCart) await Cart.create({ userId: user.id, totalPrice: 0 });

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accessToken: token,
    });

  } catch (error) {
    console.error("🔥 Erreur Login:", error);
    return res.status(500).json({
      message: "Une erreur technique est survenue sur nos serveurs."
    });
  }
};