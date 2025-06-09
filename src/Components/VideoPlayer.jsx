import React from "react";
import { useLocation, useParams } from "react-router-dom";
import mockVideos from "../data/mockVideos.json";

const VideoPlayer = () => {
  const { videoId } = useParams();
  const location = useLocation();

  // Prefer video object passed via navigation state, else find by videoId
  const video = location.state?.video || mockVideos.find((v) => v.videoId === videoId);

  if (!video) {
    return <div>Video not found.</div>;
  }

  return (
    <div className="container">
      <h2>{video.title}</h2>
      <iframe
        width="100%"
        height="480"
        src={`https://www.youtube.com/embed/${video.videoId}`}
        title={video.title}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <p className="mt-3">{video.description}</p>
      {/* Optional: Show more video details here */}
    </div>
  );
};

export default VideoPlayer;
