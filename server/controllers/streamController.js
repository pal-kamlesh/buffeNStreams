// server/controllers/streamController.js
import fs from "fs";
import path from "path";
import File from "../models/file.js";

const streamVideo = async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // Verify if you're using _id or fileId field
    const file = await File.findOne({ _id: fileId }); // If using Solution 1 from previous answer
    // OR if using Solution 2:
    // const file = await File.findOne({ fileId });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Verify file exists physically
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    const stat = fs.statSync(file.path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return res
          .status(416)
          .header({
            "Content-Range": `bytes */${fileSize}`,
          })
          .send();
      }

      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(file.path, { start, end });

      // Add proper headers
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
        "Cache-Control": "no-cache",
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        res.end();
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Cache-Control": "no-cache",
      });

      fs.createReadStream(file.path)
        .on("error", (err) => {
          console.error("Stream error:", err);
          res.end();
        })
        .pipe(res);
    }
  } catch (err) {
    console.error("Streaming error:", err);
    res.status(500).json({ error: "Video streaming failed" });
  }
};

export { streamVideo };
