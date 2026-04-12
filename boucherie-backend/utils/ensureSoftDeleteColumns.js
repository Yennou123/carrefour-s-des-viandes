const { DataTypes } = require("sequelize");

const TABLES_WITH_SOFT_DELETE = [
  "users",
  "products",
  "orders",
  "order_items",
  "reviews",
  "support_tickets",
  "newsletters",
  "notifications",
  "address",
  "carts",
  "cart_items",
];

async function ensureDbColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  // 1. Gestion du Soft Delete (deletedAt)
  for (const tableName of TABLES_WITH_SOFT_DELETE) {
    const tableDefinition = await queryInterface.describeTable(tableName);
    if (!tableDefinition.deletedAt) {
      await queryInterface.addColumn(tableName, "deletedAt", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  }

  // 2. Colonnes spécifiques pour les PROMOTIONS (Table products)
  const productTableDef = await queryInterface.describeTable("products");
  if (!productTableDef.promotion_percentage) {
    await queryInterface.addColumn("products", "promotion_percentage", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    });
  }
  if (!productTableDef.promotion_price) {
    await queryInterface.addColumn("products", "promotion_price", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  }

  // 3. Colonnes spécifiques pour Google Login (Table users)
  const userTableDef = await queryInterface.describeTable("users");
  if (!userTableDef.googleId) {
    await queryInterface.addColumn("users", "googleId", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    });
  }
  
  // S'assurer que le password est nullable pour les comptes Google
  if (userTableDef.password && !userTableDef.password.allowNull) {
    await queryInterface.changeColumn("users", "password", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
}

module.exports = ensureDbColumns;
