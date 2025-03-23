// server/streams/ChunkedUploadStream.js
import { Writable } from "stream";
import fs from "fs";
import path from "path";

class ChunkedUploadStream extends Writable {
  constructor({ filename, directory, fileId }) {
    super();
    // Use fileId as the filename to ensure unique file per upload
    this.filePath = path.join(directory, fileId);
    this.bytesWritten = 0;
    // Append to existing file if resuming
    this.fd = fs.openSync(this.filePath, "a");
  }

  _write(chunk, encoding, callback) {
    fs.write(this.fd, chunk, 0, chunk.length, null, (err) => {
      if (err) return callback(err);
      this.bytesWritten += chunk.length;
      this.emit("progress", { bytesWritten: this.bytesWritten });
      callback();
    });
  }

  _destroy(err, callback) {
    if (this.fd) fs.close(this.fd, () => callback(err));
    else callback(err);
  }
}

export { ChunkedUploadStream };
