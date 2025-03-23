// client/src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const VideoPlayer = () => {
  const { fileId } = useParams();
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);

  useEffect(() => {
    // Fetch video metadata
    const fetchVideoInfo = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}`);
        if (!response.ok) {
          throw new Error("Video not found");
        }
        const data = await response.json();
        setVideoInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [fileId]);

  useEffect(() => {
    // Set up video stream source
    if (videoRef.current && videoInfo) {
      // The src will be handled by the browser's native streaming capabilities
      videoRef.current.src = `/api/stream/video/${fileId}`;
    }
  }, [videoRef, videoInfo, fileId]);

  if (loading) {
    return <div>Loading video...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="video-player-container">
      <h2>{videoInfo?.filename}</h2>
      <div className="video-player">
        <video
          ref={videoRef}
          controls
          autoPlay={false}
          className="video-element"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="video-info">
        <p>File size: {(videoInfo?.size / 1024 / 1024).toFixed(2)} MB</p>
        <p>
          Upload date: {new Date(videoInfo?.uploadDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
