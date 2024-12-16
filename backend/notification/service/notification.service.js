import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import Notification from '../model/notification.model.js';

/**
 * Service to add a new notification.
 */
export const addNotification = async (project, message, receiver, sender) => {
  // Validate required fields
  if (!message || !receiver || !sender) {
    throw createHttpError(400, 'Missing required notification fields');
  }

  // Ensure that sender and receiver exist
  const senderExists = mongoose.Types.ObjectId.isValid(sender);
  const receiverExists = mongoose.Types.ObjectId.isValid(receiver);
  if (!senderExists || !receiverExists) {
    throw createHttpError(400, 'Invalid sender or receiver ID');
  }

  // Create new notification
  const newNotification = new Notification({
    project,
    message,
    receiver,
    sender,
  });

  // Save notification
  try {
    const savedNotification = await newNotification.save();
    return savedNotification;
  } catch (error) {
    throw createHttpError(500, 'Error creating notification');
  }
};
