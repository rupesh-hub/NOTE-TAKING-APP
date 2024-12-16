import mongoose from "mongoose";
import { Comment } from "../model/comment.model.js";
import { io } from "../../server.js";

export const createComment = async (req, res) => {
  const user = req.user;
  const { entity, entityId, text } = req.body;

  if (!entity || !entityId || !text) {
    return res
      .status(400)
      .json({ message: "Missing required fields: entity, entityId, text." });
  }

  const entityTypes = ["NOTE", "PROJECT", "COLLABORATOR"];
  if (!entityTypes.includes(entity)) {
    return res.status(400).json({ message: "Invalid entity type." });
  }

  const comment = new Comment({
    author: user.userId,
    text,
    entity,
    entityId,
    owned: false,
    timestamp: new Date(),
  });

  try {
    const savedComment = await comment.save();

    // Populate author details (name, profile)
    const populatedComment = await Comment.findById(savedComment._id).populate(
      "author",
      "firstName lastName email profile"
    );

    const commentNotification = {
      _id: savedComment._id,
      text: savedComment.text,
      timestamp: savedComment.timestamp,
      owned: false,
      entityId: savedComment.entityId,
      entity: savedComment.entity,
      createdAt: savedComment.createdAt,
      updatedAt: savedComment.updatedAt,
      author: {
        name: `${populatedComment.author.firstName} ${populatedComment.author.lastName}`,
        profile: `/api/v1.0.0/uploads/profiles/${populatedComment.author.profile}`,
        email: `${populatedComment.author.email}`,
      },
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
      replies: [],
    };
    if (entity === "NOTE") {
      io.to(entityId).emit("review-action", commentNotification);
    } else if (entity === "PROJECT") {
      io.to(entityId).emit("review-action", commentNotification);
    } else if (entity === "COLLABORATOR") {
      io.to(entityId).emit("review-action", commentNotification);
    }

    res.status(201).json({
      message: "Comment created successfully.",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Error creating comment.", error });
  }
};

/**
 * Get comments by entityId and entity type
 */
export const getCommentsByEntityId = async (req, res) => {
  const { entity, entityId } = req.params;

  // Validate required parameters
  if (!entity || !entityId) {
    return res
      .status(400)
      .json({ message: "Missing required parameters: entity, entityId." });
  }

  // Validate entity type
  const entityTypes = ["NOTE", "PROJECT", "COLLABORATOR"];
  if (!entityTypes.includes(entity)) {
    return res.status(400).json({ message: "Invalid entity type." });
  }

  try {
    // Fetch comments matching the entity and entityId
    const comments = await Comment.find({ entity, entityId })
      .populate("author", "firstName lastName email profile")
      .sort({ timestamp: -1 }); 

    // Transform comments to include desired fields
    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      text: comment.text,
      timestamp: comment.timestamp,
      owned: comment.author._id.toString() === req.user.userId, // Check ownership
      entityId: comment.entityId,
      entity: comment.entity,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        name: `${comment.author.firstName} ${comment.author.lastName}`,
        profile: `/api/v1.0.0/uploads/profiles/${comment.author.profile}`,
        email: comment.author.email,
      },
      likes: 0, // Default likes count (you can populate this if likes are in a separate collection)
      dislikes: 0, // Default dislikes count
      userLiked: false, // Default (calculate if needed)
      userDisliked: false, // Default (calculate if needed)
      replies: [], // Default (fetch nested replies if implemented)
    }));

    res.status(200).json({
      message: "Comments retrieved successfully.",
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ message: "Error retrieving comments.", error });
  }
};
