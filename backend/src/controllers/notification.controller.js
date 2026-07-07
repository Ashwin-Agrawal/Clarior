const Notification = require("../models/Notification");

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Mark all user's notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
