// server/controllers/uploadController.js
import { ChunkedUploadStream } from "../streams/ChunkedUploadStream.js";
import { pipeline } from "stream/promises";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import File from "../models/file.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const uploadFile = async (req, res) => {
  const fileId = req.headers["x-file-id"];
  const filename = req.headers["x-file-name"];

  if (!fileId || !filename) {
    return res.status(400).json({ error: "Missing file information" });
  }

  try {
    let fileDoc = await File.findOne({ fileId });

    if (!fileDoc) {
      // Use fileId as the server-side filename, store original in document
      fileDoc = new File({
        fileId,
        filename, // Original client filename
        path: path.join(uploadDirectory, fileId).replace(/\\/g, "/"), // Server-side path using fileId
        size: 0,
        uploadDate: new Date(),
      });
    }

    const uploadStream = new ChunkedUploadStream({
      filename: fileId, // Use fileId to construct the server-side file path
      directory: uploadDirectory,
      fileId,
    });

    uploadStream.on("progress", (progress) => {
      console.log(`Progress: ${progress.bytesWritten} bytes`);
    });

    await pipeline(req, uploadStream);

    // Update file size and save
    fileDoc.size = uploadStream.bytesWritten;
    await fileDoc.save(); // Save regardless of modification to ensure persistence

    res.status(200).json({
      message: "Chunk uploaded successfully",
      fileId: fileDoc.fileId,
      bytesReceived: uploadStream.bytesWritten,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export { uploadFile };
