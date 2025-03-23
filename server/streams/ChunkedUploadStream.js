// server/streams/ChunkedUploadStream.js

import { Writable } from "stream";
import fs from "fs";
import path from "path";

class ChunkedUploadStream extends Writable {
  constructor(options) {
    super(options);
    this.filename = options.filename;
    this.filepath = path.join(options.directory, this.filename);
    this.fileHandle = null;
    this.bytesWritten = 0;
    this.maxChunkSize = options.maxChunkSize || 1024 * 1024; // 1MB default
  }

  async _construct(callback) {
    try {
      this.fileHandle = await fs.promises.open(this.filepath, "w");
      callback();
    } catch (err) {
      callback(err);
    }
  }

  _write(chunk, encoding, callback) {
    // Write chunk to file
    this.fileHandle
      .write(chunk)
      .then(() => {
        this.bytesWritten += chunk.length;
        // Emit progress event
        this.emit("progress", {
          bytesWritten: this.bytesWritten,
          chunk: chunk.length,
        });
        callback();
      })
      .catch(callback);
  }

  async _destroy(err, callback) {
    if (this.fileHandle) {
      try {
        await this.fileHandle.close();
      } catch (closeErr) {
        callback(closeErr || err);
        return;
      }
    }
    callback(err);
  }
}

export { ChunkedUploadStream };
