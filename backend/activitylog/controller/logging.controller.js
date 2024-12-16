import { LoggingService } from '../service/logging.service.js';

export const getUserProjectLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 10, 
      operation,
      entityType,
      status 
    } = req.query;

    // Prepare filters
    const filters = {};
    if (operation) filters.operation = operation;
    if (entityType) filters.entityType = entityType;
    if (status) filters.status = status;

    // Get logs
    const result = await LoggingService.getUserProjectLogs({
      userId,
      filters,
      page: parseInt(page),
      limit: parseInt(limit) 
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error in getUserProjectLogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve logs",
      error: error.message
    });
  }
};

// Additional controller for specific log details
export const getLogDetails = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await ActivityLog.findById(logId)
      .populate({
        path: 'userId',
        select: 'firstName lastName email profile'
      })
      .populate({
        path: 'projectId',
        select: 'title description'
      });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found"
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error("Error in getLogDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve log details",
      error: error.message
    });
  }
};