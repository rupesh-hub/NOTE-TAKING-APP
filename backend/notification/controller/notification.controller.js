import Notification from "../model/notification.model.js";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { addNotification as addNotificationService } from "../service/notification.service.js";
import { User } from "../../user/model/user.model.js";

export const addNotification = async (req, res, next) => {
  try {
    const { project, message, receiver, sender } = req.body;

    const savedNotification = await addNotificationService(
      project,
      message,
      receiver,
      sender
    );

    res.status(201).json({
      message: "Notification created successfully",
      notification: savedNotification,
    });
  } catch (error) {
    next(createHttpError(500, "Error creating notification"));
  }
};

export const removeNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const deletedNotification = await Notification.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      return next(createHttpError(404, "Notification not found"));
    }

    res.status(200).json({
      message: "Notification deleted successfully",
      notification: deletedNotification,
    });
  } catch (error) {
    next(createHttpError(500, "Error deleting notification"));
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Find the notifications for this user (receiver)
    const notifications = await Notification.find({ receiver: user.userId })
      .populate("sender", "firstName lastName email profile")
      .populate("project", "title")
      .sort({ createdAt: -1 }); // Sort by most recent

    // Format notifications
    const formattedNotifications = notifications.map((notification) => {
      return {
        _id: notification._id,
        message: notification.message,
        createdAt: notification.createdAt.toISOString(),
        read: notification.read,
        project: {
          _id: notification.project._id,
          title: notification.project.title,
        },

        receiver: {
          _id: user.userId,
          name: user.firstName + " " + user.lastName,
          email: user.email,
          profile: `/api/v1.0.0/uploads/profiles/${user.profile}`,
        },
        sender: {
          _id: notification.sender._id,
          name:
            notification.sender.firstName + " " + notification.sender.lastName,
          email: notification.sender.email,
          profile: `/api/v1.0.0/uploads/profiles/${notification.sender.profile}`,
        },
      };
    });

    // Return the formatted notifications
    res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications: formattedNotifications,
    });
  } catch (error) {
    next(createHttpError(500, "Error retrieving notifications"));
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const user = req.user;

    // Find and update the notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    ).populate("project sender"); 

    if (!updatedNotification) {
      return next(createHttpError(404, "Notification not found"));
    }

    // Get receiver user details
    const receiver = await User.findById(updatedNotification.receiver);

    if (!receiver) {
      return next(createHttpError(404, "Receiver not found"));
    }

    // Construct the response object
    const response = {
      _id: updatedNotification._id,
      message: updatedNotification.message,
      createdAt: updatedNotification.createdAt.toISOString(),
      read: updatedNotification.read,
      project: {
        _id: updatedNotification.project._id,
        title: updatedNotification.project.title,
      },
      receiver: {
        _id: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        profile: `/api/v1.0.0/uploads/profiles/${user.profile}`,
      },
      sender: {
        _id: updatedNotification.sender._id,
        name: `${updatedNotification.sender.firstName} ${updatedNotification.sender.lastName}`,
        email: updatedNotification.sender.email,
        profile: `/api/v1.0.0/uploads/profiles/${updatedNotification.sender.profile}`,
      },
    };

    res.status(200).json({
      message: "Notification marked as read",
      notification: response,
    });
  } catch (error) {
    next(createHttpError(500, "Error marking notification as read"));
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { receiver: userId, read: false },
      { read: true }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(createHttpError(500, "Error marking all notifications as read"));
  }
};
