// server/controllers/filesController.js
import fs from "fs";
import path from "path";
import File from "../models/file.js";

// Get all files
const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Get a single file by ID
const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json(file);
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ error: "Failed to fetch file" });
  }
};

// Download a file
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    // Set Content-Disposition header to trigger download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`
    );

    // Stream the file to the response
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error downloading file:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
};

// Delete a file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete file from disk if it exists
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file from database
    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

export { getAllFiles, getFileById, downloadFile, deleteFile };
