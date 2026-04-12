const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authJwt");
const isAdmin = require("../middlewares/adminAuth");

// Controllers Admin
const dashboard = require("../controllers/admin/dashboard.admin.controller");
const products = require("../controllers/admin/product.admin.controller");
const orders = require("../controllers/admin/order.admin.controller");
const users = require("../controllers/admin/user.admin.controller");
const reviews = require("../controllers/admin/review.admin.controller");
const support = require("../controllers/admin/support.admin.controller");
const notification = require("../controllers/admin/notification.admin.controller");
const newsletter = require("../controllers/admin/newsletter.admin.controller");

// Toutes les routes admin sont protégées
router.use(verifyToken, isAdmin);

/* ----------------------- DASHBOARD ------------------------- */
router.get("/dashboard", dashboard.getDashboardStats);

/* ----------------------- PRODUCTS -------------------------- */
router.get("/products", products.getAllProducts);
router.get("/products/:id", products.getProductById);
router.post("/products", products.createProduct);
router.put("/products/:id", products.updateProduct);
router.delete("/products/:id", products.deleteProduct);
router.put("/products/:id/restore", products.restoreProduct);

/* ----------------------- ORDERS ---------------------------- */
router.get("/orders", orders.getAllOrders);
router.get("/orders/:id", orders.getOrderById);
router.put("/orders/:id", orders.updateOrderStatus);
router.delete("/orders/:id", orders.deleteOrder);
router.put("/orders/:id/restore", orders.restoreOrder);

/* ----------------------- USERS MANAGEMENT ------------------ */
router.get("/users", users.getAllUsers);
router.get("/users/:id", users.getUserById);
router.put("/users/:id/block", users.blockUser);
router.put("/users/:id/unblock", users.unblockUser);
router.put("/profile", users.updateAdminProfile);
router.put("/change-password", users.changeAdminPassword);
router.delete("/users/:id", users.deleteUser);
router.put("/users/:id/restore", users.restoreUser);

/* ----------------------- REVIEWS --------------------------- */
// Lister toutes les reviews
router.get("/reviews", reviews.getAllReviews);
// Lister reviews en attente
router.get("/reviews/pending", reviews.getPendingReviews);
// Approuver une review
router.put("/reviews/:id/approve", reviews.approveReview);
// Supprimer une review
router.delete("/reviews/:id", reviews.deleteReview);
router.put("/reviews/:id/restore", reviews.restoreReview);

/* ----------------------- SUPPORT TICKETS ------------------ */
// Lister tous les tickets
router.get("/tickets", support.getAllTickets);
// Voir un ticket
router.get("/tickets/:id", support.getTicketById);
// Répondre à un ticket
router.put("/tickets/:id/respond", support.respondToTicket);
// Mettre à jour le statut
router.put("/tickets/:id/status", support.updateStatus);
// Supprimer un ticket
router.delete("/tickets/:id", support.deleteTicket);
router.put("/tickets/:id/restore", support.restoreTicket);

/* ----------------------- NOTIFICATONS ------------------ */
// Récupérer toutes les notifications
router.get('/notifications', notification.getAllNotifications);
// Marquer comme lue
router.put('/notifications/:id/read', notification.isRead);
// Non lue
router.get('/notifications/unread/count', notification.unRead);

/* ----------------------- NEWSLETTERS ------------------ */
// Récupérer toutes les newsletters
router.get('/newsletter/all', newsletter.getAllSubscribers);

// Supprimer toutes les newsletter
router.delete('/newsletter/delete/:id', newsletter.deletenewsletter);
router.put('/newsletter/restore/:id', newsletter.restoreNewsletter);

module.exports = router;
