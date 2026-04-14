// controllers/dashboard.admin.controller.js
const { SupportTicket, Order, Review, Product, User } = require('../../models');

exports.getDashboardStats = async (req, res) => {
  try {
    const { sequelize } = require('../../models');
    
    // Obtenir la date d'il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingTickets,
      totalReviews,
      pendingReviews,
      recentOrders,
      salesDataResult // <-- NEW
    ] = await Promise.all([
      User.count(),
      Product.count(),
      Order.count(),
      SupportTicket.count({ where: { status: "Open" } }),
      Review.count(),
      Review.count({ where: { is_approved: false } }),
      Order.findAll({
        limit: 5,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "client",
            attributes: ["firstName", "lastName"]
          }
        ]
      }),
      Order.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("SUM", sequelize.cast(sequelize.col("total_amount"), 'decimal')), "total"]
        ],
        where: {
          createdAt: {
            [require("sequelize").Op.gte]: sevenDaysAgo
          }
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
        raw: true
      })
    ]);

    // Formatage des données de vente pour s'assurer du format
    const salesData = salesDataResult.map(item => ({
      date: item.date,
      total: Number(item.total) || 0
    }));

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingTickets,
      reviews: {
        total: totalReviews,
        pending: pendingReviews
      },
      recentOrders,
      salesData // <-- AJOUT
    });

  } catch (error) {
    console.error("❌ Dashboard admin error:", error);
    res.status(500).json({
      message: "Erreur serveur dashboard admin"
    });
  }
};

