import React from "react";

const VideoCard = ({ video, onWatch }) => {
  return (
    <div className="video-card" style={{ cursor: "pointer" }} onClick={() => onWatch(video)}>
      <iframe
        width="100%"
        height="180"
        src={`https://www.youtube.com/embed/${video.videoId}`} // Use video.videoId here
        title={video.title}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <h5 className="mt-2">{video.title}</h5>
      {/* Optional: Show description, views, etc */}
    </div>
  );
};

export default VideoCard;
