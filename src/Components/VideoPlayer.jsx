import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import videosData from "../data/mockVideos.json";

const VideoPlayer = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Storing the watched video in Firestore under the collection called watchedVideos
  const storeWatchedVideo = async (video) => {
    if (!user) return;
    try {
      const watchedVideosRef = doc(db, "watchedVideos", user.email);
      const docSnap = await getDoc(watchedVideosRef);

      if (docSnap.exists()) {
        const existingVideos = docSnap.data().videos || [];
        const alreadyWatched = existingVideos.some((v) => v.id === video.id);
        if (!alreadyWatched) {
          await updateDoc(watchedVideosRef, {
            videos: arrayUnion(video),
          });
        }
      } else {
        await setDoc(watchedVideosRef, {
          videos: [video],
        });
      }
    } catch (error) {
      console.error("Error storing watched video:", error);
    }
  };

  // When user clicks a video to play, then after the completiuon of the video, the data will be stored dynamically
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    storeWatchedVideo(video);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Video list */}
      <div style={{ width: "35%", overflowY: "auto", maxHeight: "80vh" }}>
        <h2>Videos</h2>
        {videosData.videos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoSelect(video)}
            style={{
              cursor: "pointer",
              marginBottom: "15px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            <h4>{video.title}</h4>
            <p>Topic: {video.topic}</p>
            <p>Duration: {video.duration}</p>
          </div>
        ))}
      </div>

      {/* Video player */}
      <div style={{ width: "65%", padding: "10px" }}>
        {selectedVideo ? (
          <>
            <h2>{selectedVideo.title}</h2>
            <iframe
              width="100%"
              height="400px"
              src={`https://www.youtube.com/embed/${selectedVideo.id}`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <p>{selectedVideo.topic}</p>
            <p>Likes: {selectedVideo.likes}</p>
            <p>Views: {selectedVideo.views}</p>
          </>
        ) : (
          <p>Please select a video to watch</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

