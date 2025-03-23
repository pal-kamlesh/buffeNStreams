// client/src/components/FileUpload.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ProgressBar } from "./ProgressBar";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setProgress(0);
      setError("");
      setUploadedFile(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    const fileId = uuidv4();
    const chunkSize = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    let start = 0;
    let end = Math.min(chunkSize, file.size);

    setUploading(true);
    setProgress(0);

    const uploadChunk = async () => {
      if (currentChunk >= totalChunks) {
        // All chunks uploaded
        setUploading(false);
        return;
      }

      // Get the chunk from the file
      const chunk = file.slice(start, end);
      const chunkForm = new FormData();
      chunkForm.append("file", chunk);

      try {
        // Send the chunk to the server
        const response = await axios.post("/api/upload", chunk, {
          headers: {
            "Content-Type": "application/octet-stream",
            "X-File-Id": fileId,
            "X-File-Name": file.name,
            "X-Chunk-Index": currentChunk,
            "X-Total-Chunks": totalChunks,
          },
          onUploadProgress: (progressEvent) => {
            // Calculate progress for this chunk
            const chunkProgress =
              (progressEvent.loaded / progressEvent.total) * 100;
            // Calculate overall progress
            const overallProgress =
              (currentChunk / totalChunks) * 100 + chunkProgress / totalChunks;

            setProgress(Math.min(Math.round(overallProgress), 99));
          },
        });

        // Prepare for next chunk
        currentChunk++;
        start = end;
        end = Math.min(start + chunkSize, file.size);

        // Continue with next chunk
        uploadChunk();

        // If this was the last chunk, update with file info from response
        if (currentChunk === totalChunks) {
          setProgress(100);
          setUploadedFile(response.data.file);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Upload failed");
        setUploading(false);
      }
    };

    // Start the upload process
    uploadChunk();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={uploading}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
        />
        {file && (
          <div className="mt-4 text-gray-700">
            <p className="font-semibold">Selected file: {file.name}</p>
            <p className="text-sm">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {file && !uploading && !uploadedFile && (
          <button
            onClick={uploadFile}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Upload File
          </button>
        )}

        {uploading && (
          <div className="mt-4">
            <ProgressBar progress={progress} />
            <p className="text-gray-600 mt-2">{progress}% Uploaded</p>
          </div>
        )}

        {error && <div className="text-red-500 mt-2">{error}</div>}

        {uploadedFile && (
          <div className="mt-4 text-green-600">
            <p className="font-semibold">File uploaded successfully!</p>
            <p className="text-sm">File ID: {uploadedFile.id}</p>
            <button
              onClick={() =>
                (window.location.href = `/process/${uploadedFile.id}`)
              }
              className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              Process File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
