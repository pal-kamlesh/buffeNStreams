// server/controllers/streamController.js
import fs from "fs";
import path from "path";
import File from "../models/file.js";

const streamVideo = async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const stat = fs.statSync(file.path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // Create read stream for the specific range
      const stream = fs.createReadStream(file.path, { start, end });

      // Set appropriate headers
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      // Pipe the stream to response
      stream.pipe(res);
    } else {
      // Stream the entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(file.path).pipe(res);
    }
  } catch (err) {
    console.error("Streaming error:", err);
    res.status(500).json({ error: "Video streaming failed" });
  }
};

export { streamVideo };
