const { Order, OrderItem, Product, Address, sequelize } = require('../models');
const axios = require('axios');

const STORE_LOCATION = { lat: 12.328778, lon: -1.550306 };
const BASE_FEE = 1000;
const PRICE_PER_KM = 250;
const EXPRESS_SURCHARGE = 700;

/**
 * Calcul de distance réelle (Routage routier) via OSRM
 */
const getRealRouteDistance = async (lat1, lon1, lat2, lon2) => {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const response = await axios.get(url);
    if (response.data?.routes?.length > 0) {
      return response.data.routes[0].distance / 1000; // km
    }
    return null;
  } catch (error) {
    console.error("⚠️ Erreur OSRM (fallback Haversine):", error.message);
    return null;
  }
};

/**
 * Calcul Haversine (Secours si l'API de route échoue)
 */
const calculateDistanceFallback = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * 📊 Compter les commandes
 */
exports.getOrdersCount = async (req, res) => {
  try {

    const totalOrders = await Order.count();

    res.status(200).json({ totalOrders });

  } catch (error) {

    console.error("❌ Erreur lors du comptage des commandes :", error.message);

    res.status(500).json({
      message: "Erreur interne du serveur."
    });

  }
};


/**
 * 🧾 Création de commande (Paiement à la livraison uniquement)
 */

exports.createOrder = async (req, res) => {
  const { cartItems, shippingDetails, total } = req.body;
  const userId = req.user.id;
  const parsedTotal = Number(total);

  if (!cartItems?.length || !shippingDetails || !Number.isFinite(parsedTotal) || parsedTotal < 0) {
    return res.status(400).json({ message: "Données de commande incomplètes." });
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Calcul de la distance réelle
    const userAddress = await Address.findOne({ where: { userId, is_default: true } });
    let finalShippingCost = BASE_FEE;

    if (userAddress?.latitude && userAddress?.longitude) {
      let distance = await getRealRouteDistance(STORE_LOCATION.lat, STORE_LOCATION.lon, userAddress.latitude, userAddress.longitude);
      
      if (distance === null) {
        distance = calculateDistanceFallback(STORE_LOCATION.lat, STORE_LOCATION.lon, userAddress.latitude, userAddress.longitude);
      }

      finalShippingCost = Math.round(BASE_FEE + (distance * PRICE_PER_KM));
      if (shippingDetails.slot === "express") finalShippingCost += EXPRESS_SURCHARGE;
    }

    // 2. Création de l'en-tête de commande
    const newOrder = await Order.create({
      userId,
      total_amount: parsedTotal,
      status: "Processing",
      payment_method: "delivery",
      shipping_address: userAddress ? JSON.stringify(userAddress) : "À emporter / Non renseignée",
      delivery_slot: shippingDetails.slot || "standard",
      shipping_cost: finalShippingCost
    }, { transaction });

    // 3. Gestion des articles et du stock
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product) throw new Error(`Produit ID ${item.productId} introuvable.`);
      if (product.stock_quantity < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name} (${product.stock_quantity} restants).`);
      }

      // Mise à jour stock
      await product.update({
        stock_quantity: product.stock_quantity - item.quantity
      }, { transaction });

      // Prix à l'achat (Sécurité prix selon type d'unité)
      const itemPrice = (item.unitType === "Poids" || product.unit_type === "Poids")
        ? product.price_per_kg
        : product.price_per_unit;

      orderItemsData.push({
        orderId: newOrder.id,
        productId: item.productId,
        quantity_ordered: item.quantity,
        price_at_purchase: itemPrice,
        unit_type_ordered: item.unit || product.unit_type || "unité"
      });
    }

    // 4. Insertion en masse des articles
    await OrderItem.bulkCreate(orderItemsData, { transaction });

    // 5. VALIDATION UNIQUE
    await transaction.commit();

    return res.status(201).json({
      message: "✅ Commande créée avec succès.",
      orderId: newOrder.id,
      shippingCost: finalShippingCost
    });

  } catch (error) {
    // On ne tente le rollback que si la transaction n'est pas déjà finie
    if (transaction) await transaction.rollback();
    
    console.error("❌ Erreur createOrder:", error.message);
    
    const statusCode = error.message.includes("Stock insuffisant") ? 409 : 500;
    return res.status(statusCode).json({
      message: error.message || "Échec de la création de la commande."
    });
  }
};




/**
 * 📋 Commandes détaillées de l'utilisateur
 */

exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: orders, count } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      orders,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("❌ Erreur getUserOrders:", error.message);
    res.status(500).json({
      message: "Erreur lors de la récupération de vos commandes."
    });
  }
};



/**
 * 📦 Historique rapide des commandes (dashboard)
 */

exports.getOrdersForCurrentUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { rows: orders, count } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      attributes: ['id', 'createdAt', 'total_amount', 'status'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      orders,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("❌ Erreur getOrdersForCurrentUser:", error.message);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'historique de commandes."
    });
  }
};


/**
 * 📦 Récupérer le détail d'une commande spécifique
 * - accessible uniquement par le propriétaire de la commande
 */
exports.getOrderById = async (req, res) => {
  try {

    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: userId
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: ["id", "quantity_ordered", "price_at_purchase"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "unit_type", "image_url"]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        message: "Commande introuvable ou accès non autorisé."
      });
    }

    // conversion adresse si JSON
    let shippingAddress = order.shipping_address;
    try {
      shippingAddress = JSON.parse(order.shipping_address);
    } catch {
      shippingAddress = order.shipping_address;
    }

    const formattedOrder = {
      id: order.id,
      order_date: order.createdAt,
      total_amount: order.total_amount,
      order_status: order.status,
      shipping_address: shippingAddress,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity_ordered,
        price_at_order: item.price_at_purchase,
        Product: {
          name: item.product.name,
          unit_type: item.product.unit_type,
          image_url: item.product.image_url
        }
      }))
    };

    res.status(200).json(formattedOrder);

  } catch (error) {
    console.error("❌ Erreur getOrderById:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la commande."
    });
  }
};

/**
 * 📲 Marquer une demande de contact WhatsApp (Tracking)
 */
exports.trackWhatsAppClick = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findOne({ where: { id: orderId, userId } });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable." });
    }

    // Mise à jour du flag de tracking
    await order.update({ whatsapp_contact_requested: true });

    // Création d'une notification pour l'admin
    const Notification = require('../models/notification.model'); // Import local si besoin ou via models
    await Notification.create({
      type: 'WHATSAPP_CONTACT',
      title: 'Demande de suivi WhatsApp',
      message: `Le client ${req.user.firstName} ${req.user.lastName} souhaite suivre la commande #${order.id} sur WhatsApp.`,
      referenceId: order.id
    });

    res.status(200).json({ message: "Click enregistré avec succès." });

  } catch (error) {
    console.error("❌ Erreur trackWhatsAppClick:", error.message);
    res.status(500).json({ message: "Erreur lors du tracking WhatsApp." });
  }
};