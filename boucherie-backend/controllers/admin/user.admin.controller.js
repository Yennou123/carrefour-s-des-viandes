// controllers/user.admin.controller.js
const { User } = require('../../models');
const bcrypt = require("bcryptjs");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 📌 Liste des utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Récupérer un utilisateur
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};



// ===============================
// 🔄 Mettre à jour le profil
// ===============================
exports.updateAdminProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Format d'email invalide." });
      }
      user.email = normalizedEmail;
    }

    await user.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role, // jamais modifiable
      },
    });

  } catch (error) {
    console.error("Erreur update profil :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};


// Regex mot de passe fort
const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/;
    
// ===============================
// 🔐 Changer le mot de passe
// ===============================
exports.changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // 1️⃣ Tous les champs obligatoires
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires.",
      });
    }

    // 2️⃣ Vérifier mot de passe actuel
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Mot de passe actuel incorrect.",
      });
    }

    // 3️⃣ Vérifier correspondance
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Les mots de passe ne correspondent pas.",
      });
    }

    // 4️⃣ Vérifier mot de passe fort
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    // 5️⃣ Vérifier différent de l'ancien
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message:
          "Le nouveau mot de passe doit être différent de l'ancien.",
      });
    }

    // 6️⃣ Hash + save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Mot de passe modifié avec succès.",
    });

  } catch (error) {
    console.error("Erreur changement mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 📌 Suppression utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

        if (user.role === "admin") {
            return res.status(403).json({ message: "Impossible de supprimer l'admin." });
        }

        await user.destroy();
        res.json({ message: "Utilisateur supprimé." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.restoreUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { paranoid: false });
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
        if (!user.deletedAt) return res.status(400).json({ message: "L'utilisateur n'est pas supprimé." });

        await user.restore();
        return res.status(200).json({ message: "Utilisateur restauré avec succès." });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Bloquer un utilisateur (sauf admin)
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

        if (user.role === "admin") {
            return res.status(403).json({ message: "Impossible de bloquer l'admin." });
        }

        await user.update({ isBlocked: true }); // il faut ajouter isBlocked dans le modèle User si ce n'est pas déjà fait

        res.json({ message: "Utilisateur bloqué avec succès.", user });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📌 Débloquer un utilisateur
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

        await user.update({ isBlocked: false });

        res.json({ message: "Utilisateur débloqué avec succès.", user });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};
