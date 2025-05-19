import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_KEY = "AIzaSyDy3jZKh0dgsAZ_YFms_FiE-rcbmI8UILk"; // Replace with your API key

function Recommendation() {
  const location = useLocation();
  const selectedTopics = location.state?.selectedTopics || [];

  const [videoData, setVideoData] = useState([]);

  // Function to fetch video for each topic
  const fetchVideos = async () => {
    const fetchedVideos = [];
  
    for (const topic of selectedTopics) {
      const query = `${topic} tutorial`;
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=3&key=${API_KEY}`;
  
      try {
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
  
        if (searchData.items) {
          // Collect video IDs
          const videoIds = searchData.items.map(item => item.id.videoId).join(",");
  
          // Fetch video details
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json();
  
          const sorted = detailsData.items
            .filter(item => item.statistics && item.contentDetails)
            .sort((a, b) => {
              const aViews = parseInt(a.statistics.viewCount || "0");
              const bViews = parseInt(b.statistics.viewCount || "0");
              return bViews - aViews; // sort descending by viewCount
            });
  
          const best = sorted[0]; // pick top one
  
          if (best) {
            fetchedVideos.push({
              id: best.id,
              title: best.snippet.title,
              topic: topic,
              url: `https://www.youtube.com/watch?v=${best.id}`,
              views: best.statistics.viewCount,
              likes: best.statistics.likeCount,
              duration: best.contentDetails.duration,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    }
  
    setVideoData(fetchedVideos);
  };
  

  useEffect(() => {
    if (selectedTopics.length > 0) {
      fetchVideos();
    }
  }, [selectedTopics]);

  // Convert regular URL to embed format
  const convertToEmbedUrl = (url) => {
    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div>
      <h1>Recommended Videos</h1>
      <div>
        {videoData.map((video) => (
          <div key={video.id} className="video-card">
            <h3>{video.title}</h3>
            <p>{video.topic}</p>
            <iframe
              width="560"
              height="315"
              src={convertToEmbedUrl(video.url)}
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
