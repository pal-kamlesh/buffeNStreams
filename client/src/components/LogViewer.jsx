// client/src/components/LogViewer.jsx
import React, { useState, useEffect, useRef } from "react";

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const logEndRef = useRef(null);

  useEffect(() => {
    let eventSource = null;

    const connectToLogStream = () => {
      console.log("Attempting to connect to log stream at /api/logs");
      setConnected(false);

      try {
        eventSource = new EventSource("http://localhost:3000/api/logs");

        console.log("EventSource object created:", eventSource);

        eventSource.onopen = () => {
          setConnected(true);
          setError("");
        };

        eventSource.onmessage = (event) => {
          console.log("Received log:", event.data);
          setLogs((prevLogs) => [...prevLogs, event.data]);
        };

        eventSource.onerror = (err) => {
          console.error("EventSource error:", err);
          setError("Connection to log stream failed");
          setConnected(false);
          eventSource.close();
          setTimeout(connectToLogStream, 5000);
        };
      } catch (err) {
        console.error("Error creating EventSource:", err);
        setError(`Failed to create connection: ${err.message}`);
      }
    };

    connectToLogStream();

    return () => {
      if (eventSource) {
        console.log("Closing EventSource connection");
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Server Logs</h2>
      <div className="mb-4 p-3 rounded text-white text-center ">
        {connected ? (
          <span className="bg-green-500 px-4 py-1 rounded">
            Connected to log stream
          </span>
        ) : (
          <span className="bg-red-500 px-4 py-1 rounded">
            Disconnected from log stream
          </span>
        )}
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="h-64 overflow-y-auto border p-4 bg-gray-100 rounded">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs received yet...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-gray-700 text-sm mb-1">
              {log}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LogViewer;
