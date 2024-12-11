const Image = require("../models/ImageModel");

// Add an image to a draft
exports.addImage = async (req, res) => {
  try {
    const { url, alt, caption, draftId } = req.body;
    const image = new Image({
      url,
      alt,
      caption,
      draft: draftId,
      createdBy: req.user.id,
    });
    const savedImage = await image.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all images for a draft
exports.getImages = async (req, res) => {
  try {
    const images = await Image.find({ draft: req.params.draftId });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an image
exports.updateImage = async (req, res) => {
  try {
    const { url, alt, caption } = req.body;
    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      { url, alt, caption },
      { new: true }
    );
    if (!updatedImage)
      return res.status(404).json({ message: "Image not found" });
    res.json(updatedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an image
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
