import express from "express";
import {
  addNotification,
  removeNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controller/notification.controller.js";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";

const router = express.Router();

// Route to add a new notification
router.post("/", authenticationMiddleware, addNotification);

// Route to delete a notification
router.delete("/:notificationId", authenticationMiddleware, removeNotification);

// Route to get notifications for a specific user
router.get("/", authenticationMiddleware, getNotifications);

// Route to mark a specific notification as read
router.put(
  "/:notificationId/read",
  authenticationMiddleware,
  markNotificationAsRead
);

// Route to mark all notifications as read for a specific user
router.put(
  "/user/:userId/read",
  authenticationMiddleware,
  markAllNotificationsAsRead
);

export default router;
