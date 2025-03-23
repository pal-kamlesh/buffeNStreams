import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { Writable } from "stream";
import { fileURLToPath } from "url";
import { EventEmitter } from "events"; // Import EventEmitter

import uploadRoutes from "./routes/uploadRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import fileRoutes from "./routes/filesRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(__filename);
// console.log(__dirname);

const app = express();
const PORT = process.env.PORT || 5000;
const logEmitter = new EventEmitter();

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/streamflow")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Range"], // Add Range header
    exposedHeaders: ["Content-Range", "Content-Length"], // Add these
  })
);
app.use(express.json());
app.use("/processed", express.static(path.join(__dirname, "processed")));

// Create stream-based logger
const logStream = new Writable({
  write(chunk, encoding, callback) {
    const logMessage = chunk.toString().trim();
    console.log(logMessage); // Log to console
    logEmitter.emit("log", logMessage); // Emit log event
    callback();
  },
});

// Use Morgan with custom logStream
app.use(morgan("combined", { stream: logStream }));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/files", fileRoutes);

// Stream logs to clients via SSE (Server-Sent Events)
app.get("/api/logs", (req, res) => {
  // Explicitly set CORS headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendLog = (log) => {
    res.write(`data: ${log}\n\n`); // Send log to client
  };

  logEmitter.on("log", sendLog); // Listen for log events

  req.on("close", () => {
    logEmitter.removeListener("log", sendLog); // Remove listener on disconnect
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
