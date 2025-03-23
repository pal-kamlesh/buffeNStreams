// client/src/components/CsvProcessor.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CsvProcessor = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transformations, setTransformations] = useState([]);
  const [processedFile, setProcessedFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/files/${fileId}`
        );
        setFile(response.data);
      } catch (err) {
        setError("Failed to load file information");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  const addTransformation = (type) => {
    let newTransform = { id: Date.now(), type };

    if (type === "rename") {
      newTransform = { ...newTransform, from: "", to: "" };
    } else if (type === "calculate") {
      newTransform = { ...newTransform, target: "", formula: "" };
    } else if (type === "filter") {
      newTransform = { ...newTransform, condition: "" };
    }

    setTransformations([...transformations, newTransform]);
  };

  const updateTransformation = (id, field, value) => {
    setTransformations(
      transformations.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTransformation = (id) => {
    setTransformations(transformations.filter((t) => t.id !== id));
  };

  const processCsv = async () => {
    if (transformations.length === 0) {
      setError("Add at least one transformation");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Send only the transformation data, not the UI-specific fields
      const transformationData = transformations.map(({ id, ...rest }) => rest);

      const response = await axios.post(
        `http://localhost:5000/api/process/csv/${fileId}`,
        { transformations: transformationData }
      );

      setProcessedFile(response.data.file);
    } catch (err) {
      setError(err.response?.data?.error || "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div>Loading file information...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!file) {
    return <div>File not found</div>;
  }

  return (
    <div className="csv-processor">
      <h2>CSV Processor</h2>
      <div className="file-info">
        <p>Filename: {file.filename}</p>
        <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>

      <div className="transformations-container">
        <h3>Transformations</h3>

        <div className="add-transformation">
          <button onClick={() => addTransformation("rename")}>
            Rename Column
          </button>
          <button onClick={() => addTransformation("calculate")}>
            Calculate Field
          </button>
          <button onClick={() => addTransformation("filter")}>
            Filter Rows
          </button>
        </div>

        {transformations.length === 0 && (
          <p>
            No transformations added yet. Use the buttons above to add
            transformations.
          </p>
        )}

        <div className="transformations-list">
          {transformations.map((t) => (
            <div key={t.id} className="transformation-item">
              <div className="transformation-header">
                <span>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span>
                <button onClick={() => removeTransformation(t.id)}>
                  Remove
                </button>
              </div>

              {t.type === "rename" && (
                <div className="transformation-fields">
                  <div>
                    <label>From Column:</label>
                    <input
                      type="text"
                      value={t.from}
                      onChange={(e) =>
                        updateTransformation(t.id, "from", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label>To Column:</label>
                    <input
                      type="text"
                      value={t.to}
                      onChange={(e) =>
                        updateTransformation(t.id, "to", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {t.type === "calculate" && (
                <div className="transformation-fields">
                  <div>
                    <label>Target Column:</label>
                    <input
                      type="text"
                      value={t.target}
                      onChange={(e) =>
                        updateTransformation(t.id, "target", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label>Formula:</label>
                    <input
                      type="text"
                      value={t.formula}
                      placeholder="e.g., parseInt(column1) + parseInt(column2)"
                      onChange={(e) =>
                        updateTransformation(t.id, "formula", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {t.type === "filter" && (
                <div className="transformation-fields">
                  <div>
                    <label>Condition:</label>
                    <input
                      type="text"
                      value={t.condition}
                      placeholder="e.g., parseInt(value) > 100"
                      onChange={(e) =>
                        updateTransformation(t.id, "condition", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="process-actions">
        <button
          onClick={processCsv}
          disabled={processing || transformations.length === 0}
        >
          {processing ? "Processing..." : "Process CSV"}
        </button>
      </div>

      {processedFile && (
        <div className="result-section">
          <h3>Processing Complete</h3>
          <p>Generated file: {processedFile.filename}</p>
          <div className="result-actions">
            <a
              href={`http://localhost:5000/process/${processedFile.filename}`}
              download
              className="download-button"
            >
              Download Result
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvProcessor;
