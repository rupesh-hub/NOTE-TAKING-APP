const Draft = require("../models/DraftModel");
const Image = require("../models/ImageModel");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure multer for dynamic storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.body.projectId || "temp"; // Use 'temp' if projectId is not available
    const dir = path.join(__dirname, `../uploads/${projectId}`);
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating directory:", err);
        cb(err, dir);
      } else {
        cb(null, dir);
      }
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

exports.createDraft = [
  upload.array("images", 10), // Allow up to 10 image uploads
  async (req, res) => {
    try {
      const { title, content, urls, projectId } = req.body;

      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const draft = new Draft({
        title: title || "Untitled",
        content,
        urls: urls ? JSON.parse(urls) : [],
        project: projectId,
        createdBy: req.user._id,
        modifiedBy: req.user._id,
      });

      console.log("Draft object before saving:", draft);

      const savedDraft = await draft.save();

      // Handle image uploads
      if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map((file) => {
          const image = new Image({
            url: `/uploads/${projectId}/${file.filename}`,
            draft: savedDraft._id,
            createdBy: req.user._id,
          });
          return image.save();
        });

        await Promise.all(imagePromises);
      }

      res.status(201).json(savedDraft);
    } catch (error) {
      console.error("Error creating draft:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
];

// Get all drafts for a project
exports.getDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({ project: req.params.projectId })
      .populate("createdBy", "firstName lastName username email profile")
      .populate("modifiedBy", "firstName lastName username email profile");
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single draft with its images
exports.getDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id)
      .populate("createdBy", "firstName lastName username email profile")
      .populate("modifiedBy", "firstName lastName username email profile");
    if (!draft) return res.status(404).json({ message: "Draft not found" });

    const images = await Image.find({ draft: draft._id });
    res.json({ draft, images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a draft
exports.updateDraft = [
  upload.array("images", 10), // Allow up to 10 new image uploads
  async (req, res) => {
    try {
      const { title, content, urls } = req.body;
      const updatedDraft = await Draft.findByIdAndUpdate(
        req.params.id,
        {
          title,
          content,
          urls: urls ? JSON.parse(urls) : [],
          modifiedBy: req.user._id,
          modifiedAt: Date.now(),
        },
        { new: true }
      );

      if (!updatedDraft)
        return res.status(404).json({ message: "Draft not found" });

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map((file) => {
          const image = new Image({
            url: `/uploads/${updatedDraft.project}/${file.filename}`,
            draft: updatedDraft._id,
            createdBy: req.user._id,
          });
          return image.save();
        });

        await Promise.all(imagePromises);
      }

      res.json(updatedDraft);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
];

// Delete a draft and its associated images
exports.deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draft not found" });

    // Delete associated images from filesystem
    const images = await Image.find({ draft: draft._id });
    for (let image of images) {
      const imagePath = path.join(__dirname, "..", image.url);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    // Delete draft and image documents from database
    await Draft.findByIdAndDelete(draft._id);
    await Image.deleteMany({ draft: draft._id });

    res.json({ message: "Draft and associated images deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new image to an existing draft
exports.addImageToDraft = [
  upload.single("image"),
  async (req, res) => {
    try {
      const draft = await Draft.findById(req.params.id);
      if (!draft) return res.status(404).json({ message: "Draft not found" });

      const image = new Image({
        url: `/uploads/${draft.project}/${req.file.filename}`,
        alt: req.body.alt,
        caption: req.body.caption,
        draft: draft._id,
        createdBy: req.user._id,
      });

      const savedImage = await image.save();
      res.status(201).json(savedImage);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
];

// Delete an image from a draft
exports.deleteImageFromDraft = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Delete the image file from the filesystem
    const imagePath = path.join(__dirname, "..", image.url);
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    // Delete the image document from the database
    await Image.findByIdAndDelete(req.params.imageId);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
