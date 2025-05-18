import React from "react";
import { useLocation } from "react-router-dom";
import videoData from "../data/videoData";

function Recommendation() {
  const location = useLocation();
  const selectedTopics = location.state?.selectedTopics || [];

  // Function to convert regular YouTube URL to embed URL
  const convertToEmbedUrl = (url) => {
    if (!url) return "";
    // Check if the URL is a YouTube URL
    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url; // Return the original URL, if it is not the valid youtube URL
  };

  return (
    <div>
      <h1>Recommended Videos</h1>
      <div>
        {videoData
          .filter((video) =>
            selectedTopics.includes(video.topic)
          )
          .map((video) => (
            <div key={video.id} className="video-card">
              <h3>{video.title}</h3>
              <p>{video.topic}</p>
              {/* Convert video URL to embed format, so that the video is displed on our website itself */}
              <iframe
                width="560"
                height="315"
                src={convertToEmbedUrl(video.url)} // coneverting to embed format
                //frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              ></iframe>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Recommendation;
