const bcrypt = require('bcryptjs');
const { User } = require('../models');

const initAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";
    const adminFirstName = process.env.ADMIN_FIRSTNAME || "Super";
    const adminLastName = process.env.ADMIN_LASTNAME || "Admin";

    if (!adminEmail || !adminPassword) {
      console.warn("⚠️ ADMIN_EMAIL/ADMIN_PASSWORD non définis: création auto admin ignorée.");
      return;
    }

    // 🔎 Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin déjà existant, aucune action nécessaire.');
      return;
    }

    // 🔐 Hash du mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // 👑 Création de l'admin unique
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'admin',
      isBlocked: false,
    }, { bypassAdminCheck: true });

    console.log('✅ Admin créé avec succès');
  } catch (error) {
    console.error("❌ Erreur lors de la creation de l'admin :", error);
  }
};

module.exports = initAdmin;
