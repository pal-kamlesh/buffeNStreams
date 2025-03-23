import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import CsvProcessor from "./components/CsvProcessor";
import VideoPlayer from "./components/VideoPlayer";
import LogViewer from "./components/LogViewer";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-blue-500 text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-4">
            <h1 className="text-xl font-bold">StreamFlow</h1>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/upload" className="hover:underline">
                    Upload
                  </Link>
                </li>
                <li>
                  <Link to="/files" className="hover:underline">
                    Files
                  </Link>
                </li>
                <li>
                  <Link to="/logs" className="hover:underline">
                    Logs
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6 text-center">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
                  <h2 className="text-2xl font-semibold">
                    Welcome to StreamFlow
                  </h2>
                  <p className="text-gray-700 mt-2">
                    A file processing platform built with Node.js streams and
                    buffers.
                  </p>
                  <div className="mt-4 space-x-4">
                    <Link
                      to="/upload"
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Upload File
                    </Link>
                    <Link
                      to="/files"
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      View Files
                    </Link>
                  </div>
                </div>
              }
            />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/files" element={<FileList />} />
            <Route path="/process/csv/:fileId" element={<CsvProcessor />} />
            <Route path="/video/:fileId" element={<VideoPlayer />} />
            <Route path="/logs" element={<LogViewer />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white py-4 text-center">
          <p>StreamFlow - A Node.js Stream & Buffer Learning Project</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
