import mongoose from "mongoose";
import { ActivityLog } from "../model/activity-log.model.js";
import { Project } from "../../project/model/project.model.js";

class LoggingService {
  /**
   * Initialize the logging service with default configurations.
   * @param {Object} config - Configuration options
   * @param {boolean} [config.enableLogging=true] - Toggle logging functionality
   */
  static initialize(config = { enableLogging: true }) {
    this.enableLogging = config.enableLogging ?? true;
  }

  /**
   * Log an activity.
   * @param {Object} params - Logging parameters
   * @param {string} params.operation - Type of operation
   * @param {string} params.entityType - Type of entity
   * @param {mongoose.Types.ObjectId} params.entityId - ID of the entity
   * @param {mongoose.Types.ObjectId} params.userId - ID of the user performing the action
   * @param {Object} [params.details] - Additional details about the operation
   * @param {Object} [params.metadata] - Metadata about the operation
   * @param {string} [params.status='SUCCESS'] - Status of the operation ('SUCCESS' or 'FAILURE')
   * @returns {Promise<ActivityLog|null>}
   */
  static async log({
    operation,
    entityType,
    entityId,
    userId,
    details = {},
    metadata = {},
    status = "SUCCESS",
  }) {
    if (!this.enableLogging) {
      console.warn("Logging is disabled.");
      return null;
    }

    // Validate required fields
    if (!operation || !entityType || !entityId || !userId) {
      console.error("Missing required parameters for logging.");
      return null;
    }

    try {
      const logEntry = new ActivityLog({
        operation,
        entityType,
        entityId,
        userId,
        details,
        metadata,
        status,
      });

      return await logEntry.save();
    } catch (error) {
      console.error("Failed to log activity:", error);
      return null;
    }
  }

  /**
   * Retrieve logs based on filters.
   * @param {Object} filters - Query filters
   * @param {string} [filters.operation] - Filter by operation type
   * @param {string} [filters.entityType] - Filter by entity type
   * @param {mongoose.Types.ObjectId} [filters.entityId] - Filter by entity ID
   * @param {mongoose.Types.ObjectId} [filters.userId] - Filter by user ID
   * @param {string} [filters.status] - Filter by status ('SUCCESS' or 'FAILURE')
   * @param {Date} [filters.startDate] - Start date for filtering logs
   * @param {Date} [filters.endDate] - End date for filtering logs
   * @returns {Promise<ActivityLog[]>}
   */
  static async getLogs(filters = {}) {
    const query = {};

    if (filters.operation) query.operation = filters.operation;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;

    // Add date range filter
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    try {
      return await ActivityLog.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Failed to retrieve logs:", error);
      return [];
    }
  }

  /**
   * Delete logs based on filters (e.g., to clear old logs).
   * @param {Object} filters - Query filters (same as `getLogs`)
   * @returns {Promise<number>} Number of deleted logs
   */
  static async deleteLogs(filters = {}) {
    try {
      const result = await ActivityLog.deleteMany(filters);
      return result.deletedCount || 0;
    } catch (error) {
      console.error("Failed to delete logs:", error);
      return 0;
    }
  }

  /**
   * Fetch logs for a user based on their project involvement
   * @param {Object} options - Filtering and pagination options
   * @param {string} options.userId - ID of the user
   * @param {Object} [options.filters={}] - Additional filters
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=10] - Number of logs per page
   * @returns {Promise<Object>} Paginated logs with additional metadata
   */
  static async getUserProjectLogs(options = {}) {
    const { userId, filters = {}, page = 1, limit = 10 } = options;
  
    try {
      // Find projects where the user is the creator or a collaborator
      const userProjects = await Project.find({
        $or: [{ createdBy: userId }, { "collaborators.collaborator": userId }],
      }).select("_id");
  
      const projectIds = userProjects.map((project) => project._id);
  
      // Build query to filter logs by user and project
      const query = {
        ...filters,
        $or: [{ userId: userId }, { projectId: { $in: projectIds } }],
      };
  
      // Pagination
      const skip = (page - 1) * limit;
  
      // Fetch logs with population
      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "userId",
          select: "firstName lastName email profile",
          // Modify the profile path
          transform: (doc) => {
            if (doc.profile) {
              if (!doc.profile.startsWith('/api/v1.0.0/uploads/profiles/')) {
                doc.profile = `/api/v1.0.0/uploads/profiles/${doc.profile}`;
              }
            }
            return doc;
          },
        })
        .populate({
          path: "projectId",
          select: "title description",
        });
  
      // Count total logs
      const totalLogs = await ActivityLog.countDocuments(query);
  
      return {
        logs,
        pagination: {
          page,
          limit,
          totalLogs,
          totalPages: Math.ceil(totalLogs / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching user project logs:", error);
      throw error;
    }
  }
  
}
export default LoggingService;
export { LoggingService };
