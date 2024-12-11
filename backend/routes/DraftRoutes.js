const express = require('express');
const router = express.Router();
const draftResource = require('../resource/DraftResource');

const {
    authenticate,
    checkPermission,
  } = require("../middleware/AuthMiddleware");
  

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new draft
router.post('/', draftResource.createDraft);

// Get all drafts for a project
router.get('/project/:projectId', draftResource.getDrafts);

// Get a single draft
router.get('/:id', draftResource.getDraft);

// Update a draft
router.put('/:id', draftResource.updateDraft);

// Delete a draft
router.delete('/:id', draftResource.deleteDraft);

// Add a new image to an existing draft
router.put('/:id/images', draftResource.addImageToDraft);

// Delete an image from a draft
router.delete('/:id/images/:imageId', draftResource.deleteImageFromDraft);

module.exports = router;