// controllers/user.controller.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');


// ✅ Nouveau contrôleur pour compter les utilisateurs
exports.getUsersCount = async (req, res) => {
  try {
    const totalUsers = await User.count();
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("❌ Erreur lors du comptage des utilisateurs :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Récupérer les informations du profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
    try {
        // req.user.id est injecté par le middleware verifyToken (Étape 4.3)
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'] // Ne pas envoyer le mot de passe !
            // On pourrait inclure les commandes ici si on les joignait
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};



// ===============================
// ✏️ Modifier informations profil
// ===============================
exports.updateProfileInfo = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Mise à jour champs autorisés uniquement
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;

    await user.save();

    res.status(200).json({
      message: "Informations mises à jour avec succès.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Erreur update profil :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


// Regex mot de passe fort
const strongPasswordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-]).{8,}$/;

// ===============================
// 🔐 Changer mot de passe
// ===============================
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // 1️⃣ Champs obligatoires
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires."
      });
    }

    // 2️⃣ Vérifier mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Mot de passe actuel incorrect."
      });
    }

    // 3️⃣ Vérifier correspondance
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Les mots de passe ne correspondent pas."
      });
    }

    // 4️⃣ Vérifier force
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      });
    }

    // 5️⃣ Vérifier différent de l'ancien
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit être différent de l'ancien."
      });
    }

    // 6️⃣ Hash + save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Mot de passe modifié avec succès."
    });

  } catch (error) {
    console.error("Erreur changement mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};