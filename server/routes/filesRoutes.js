// server/routes/fileRoutes.js
import express from "express";
import {
  deleteFile,
  downloadFile,
  getAllFiles,
  getFileById,
} from "../controllers/fileController.js";

const router = express.Router();

// Get all files
router.get("/", getAllFiles);

// Get a single file by ID
router.get("/:id", getFileById);

// Download a file
router.get("/download/:id", downloadFile);

// Delete a file
router.delete("/:id", deleteFile);

export default router;
