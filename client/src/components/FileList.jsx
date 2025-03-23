// client/src/components/FileList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("/api/files");
        setFiles(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Failed to load files");
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const getFileTypeIcon = (filename) => {
    if (filename.endsWith(".csv")) return "📊";
    if (/\.(mp4|avi|mov|wmv)$/i.test(filename)) return "🎬";
    if (/\.(jpg|jpeg|png|gif)$/i.test(filename)) return "🖼️";
    if (/\.(pdf)$/i.test(filename)) return "📄";
    return "📁";
  };

  const getActionLink = (file) => {
    if (file.filename.endsWith(".csv")) {
      return `/process/csv/${file._id}`;
    }
    if (/\.(mp4|avi|mov|wmv)$/i.test(file.filename)) {
      return `/video/${file._id}`;
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Your Files</h2>

      {files.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No files uploaded yet.</p>
          <Link
            to="/upload"
            className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload a File
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">
                    {getFileTypeIcon(file.filename)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {file.filename}
                    </div>
                    {file.originalFile && (
                      <div className="text-xs text-gray-500">
                        Processed file
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(file.uploadDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {getActionLink(file) && (
                        <Link
                          to={getActionLink(file)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {file.filename.endsWith(".csv")
                            ? "Process"
                            : /\.(mp4|avi|mov|wmv)$/i.test(file.filename)
                            ? "View"
                            : "Download"}
                        </Link>
                      )}
                      <a
                        href={`/api/files/download/${file._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileList;
