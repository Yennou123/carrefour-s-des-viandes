// controllers/dashboard.admin.controller.js
const { SupportTicket, Order, Review, Product, User } = require('../../models');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingTickets,
      totalReviews,
      pendingReviews,
      recentOrders
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
      })
    ]);

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingTickets,
      reviews: {
        total: totalReviews,
        pending: pendingReviews
      },
      recentOrders
    });

  } catch (error) {
    console.error("❌ Dashboard admin error:", error);
    res.status(500).json({
      message: "Erreur serveur dashboard admin"
    });
  }
};

