import fs from "fs";
import path from "path";

const BASE_UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Ensure a directory exists, creating it recursively if necessary.
 * @param {string} directory - The directory path.
 */
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Ensure base directory exists
ensureDirectoryExists(BASE_UPLOAD_DIR);

/**
 * Generate the URL path for a given file.
 * @param {string} folder - The folder containing the file.
 * @param {string} filename - The file name.
 * @returns {string | null} - The relative URL path or null if no filename is provided.
 */
export const filePath = (folder, filename) => {
  return filename ? `/api/v1.0.0/uploads/${folder}/${filename}` : null;
};

/**
 * Generate the absolute file path in the file system.
 * @param {string} folder - The folder containing the file.
 * @param {string} filename - The file name.
 * @returns {string | null} - The absolute file system path or null if no filename is provided.
 */
export const fullFilePath = (folder, filename) => {
  return filename ? path.join(BASE_UPLOAD_DIR, folder, filename) : null;
};

/**
 * Delete a file from the file system.
 * @param {string} filePath - The absolute path to the file.
 * @returns {boolean} - True if the file was deleted successfully, false otherwise.
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Special handler for profile image paths.
 * Retains backward compatibility with existing `profilePath` usage.
 * @param {string} filename - The file name.
 * @returns {string | null} - The relative URL path for profile images.
 */
export const profilePath = (filename) => filePath("profiles", filename);

/**
 * Special handler for note image paths.
 * Simplifies integration for note-specific logic.
 * @param {string} filename - The file name.
 * @returns {string | null} - The relative URL path for note images.
 */
export const noteImagePath = (filename) => filePath("notes", filename);

// Ensure specific directories exist
ensureDirectoryExists(path.join(BASE_UPLOAD_DIR, "profiles"));
ensureDirectoryExists(path.join(BASE_UPLOAD_DIR, "notes"));
