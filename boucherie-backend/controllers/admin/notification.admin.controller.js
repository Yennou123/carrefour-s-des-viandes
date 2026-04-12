// controllers/notification.admin.controller.js
const { Notification } = require('../../models');


exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.isRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Not found' });

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notification marquée comme lue' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.unRead = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { isRead: false }
        });
        res.json({ unread: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}