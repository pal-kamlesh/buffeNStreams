// server/models/file.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  originalFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  processType: {
    type: String,
    enum: ["compression", "csv-transform", "video-transcode", "text-process"],
    default: null,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model("File", fileSchema);

export default File;
