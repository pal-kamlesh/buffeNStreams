import { ChunkedUploadStream } from "../streams/ChunkedUploadStream.js";
import { pipeline } from "stream/promises";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import File from "../models/file.js";

// Correct way to get __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadDirectory = path.join(__dirname, "../uploads");

// Ensure upload directory exists
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
    // Create a writable stream for the file
    const uploadStream = new ChunkedUploadStream({
      filename,
      directory: uploadDirectory,
    });

    // Track upload progress (listener should be set before pipeline execution)
    uploadStream.on("progress", (progress) => {
      console.log(`Progress for ${filename}: ${progress.bytesWritten} bytes`);
    });

    // Use pipeline for proper error handling
    await pipeline(req, uploadStream);

    // Save file metadata to MongoDB
    const fileDoc = new File({
      filename,
      path: path.join(uploadDirectory, filename).replace(/\\/g, "/"),
      size: uploadStream.bytesWritten ?? 0, // Ensure bytesWritten is defined
      uploadDate: new Date(),
    });

    await fileDoc.save();

    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        id: fileDoc._id,
        filename: fileDoc.filename,
        size: fileDoc.size,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "File upload failed" });
  }
};

export { uploadFile };
