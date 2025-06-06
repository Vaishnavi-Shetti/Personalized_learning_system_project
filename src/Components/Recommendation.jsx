import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";

const trustedChannelIds = [
  "UCeVMnSShP_Iviwkknt83cww",
  "UCWv7vMbMWH4-V0ZXdmDpPBA",
  "UC8butISFwT-Wl7EV0hUK0BQ",
  "UCxX9wt5FWQUAAz4UrysqK9A",
  "UCVYamHliCI9rw1tHR1xbkfw",
  "UCQYMhOMi_Cdj1CEAU-fv80A",
  "UC4SVo0Ue36XCfOyb5Lh1viQ",
  "UCzuaYxY3ULt0CGu41Z4UNPQ",
  "UCYO_jab_esuFRV4b17AJtAw",
  "UCvjgXvBlbQiydffZU7m1_aw",
  "UCsBjURrPoezykLs9EqgamOA",
  "UC29ju8bIPH5as8OGnQzwJyA",
  "UCBwmMxybNva6P_5VmxjzwqA",
  "UC4xKdmAXFh4ACyhpiQ_3qBw",
];

// ✅ Replace with your valid API key
const API_KEY = "AIzaSyCQ_yQweed2qQmD69hlHoceMleHzhef0fs";

function Recommendation() {
  const location = useLocation();
  const initialTopics = location.state?.selectedTopics || [];
  const skillLevel = location.state?.skillLevel || "Beginner";
  const contentType = location.state?.contentType || "Tutorials";
  const selectedLanguages = location.state?.selectedLanguages || [];

  const [selectedTopics, setSelectedTopics] = useState(initialTopics);
  const [videoData, setVideoData] = useState([]);
  const [collaborativeVideos, setCollaborativeVideos] = useState([]);
  const [watchedVideoIds, setWatchedVideoIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);

  const loadWatchedVideos = async (userId) => {
    try {
      const watchedDocRef = doc(db, "watchedVideos", userId);
      const docSnap = await getDoc(watchedDocRef);
      if (docSnap.exists()) {
        const videos = docSnap.data().videos || [];
        setWatchedVideoIds(new Set(videos.map((v) => v.id)));
      } else {
        setWatchedVideoIds(new Set());
      }
    } catch (error) {
      console.error("Error loading watched videos:", error);
    }
  };

  const saveWatchedVideo = async (video) => {
    if (!currentUser || watchedVideoIds.has(video.id)) return;

    const watchedDocRef = doc(db, "watchedVideos", currentUser.uid);

    try {
      const docSnap = await getDoc(watchedDocRef);

      if (docSnap.exists()) {
        const existingVideos = docSnap.data().videos || [];
        const alreadySaved = existingVideos.some((v) => v.id === video.id);
        if (!alreadySaved) {
          await updateDoc(watchedDocRef, {
            videos: arrayUnion(video),
          });
          setWatchedVideoIds((prev) => new Set(prev).add(video.id));
        }
      } else {
        await setDoc(watchedDocRef, {
          videos: [video],
        });
        setWatchedVideoIds(new Set([video.id]));
      }
    } catch (error) {
      console.error("Error saving watched video:", error);
    }
  };

  const fetchVideosByQueries = async (queries) => {
    const fetchedVideos = new Map();

    for (const query of queries) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=5&key=${API_KEY}`;

      try {
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) {
          console.error(`Search API request failed with status ${searchRes.status}`);
          continue;
        }

        const searchData = await searchRes.json();

        if (searchData.items) {
          const videoIds = searchData.items
            .map((item) => item.id.videoId)
            .join(",");
          if (!videoIds) continue;

          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json();

          // ✅ FIXED THIS PART:
          const filteredVideos = (detailsData.items || [])
            .filter(
              (item) =>
                item.statistics &&
                item.contentDetails &&
                trustedChannelIds.includes(item.snippet.channelId)
            )
            .sort(
              (a, b) =>
                parseInt(b.statistics.viewCount || "0") -
                parseInt(a.statistics.viewCount || "0")
            )
            .slice(0, 3);

          filteredVideos.forEach((video) => {
            if (!fetchedVideos.has(video.id)) {
              fetchedVideos.set(video.id, {
                id: video.id,
                title: video.snippet.title,
                topic: query,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                views: video.statistics.viewCount,
                likes: video.statistics.likeCount || "N/A",
                duration: video.contentDetails.duration,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    }
    return Array.from(fetchedVideos.values());
  };

  const fetchVideos = async () => {
    if (!currentUser) return;

    try {
      const userSnap = await getDoc(doc(db, "userData", currentUser.uid));
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const userTopics = userData.topics || [];
      const userLanguages = userData.languages || [];
      const userSkillLevel = userData.skillLevel || "Beginner";
      const userContentType = userData.contentType || "Tutorials";

      let userQueries = [];
      userTopics.forEach((topic) => {
        userQueries.push(`${topic} ${userSkillLevel} ${userContentType}`);
        userLanguages.forEach((lang) => {
          userQueries.push(`${topic} ${lang} ${userContentType}`);
        });
      });

      const userVideos = await fetchVideosByQueries(userQueries);
      setVideoData(userVideos);

      const allUsersSnap = await getDocs(collection(db, "userData"));
      const currentPrefs = new Set([...userTopics, ...userLanguages]);
      const collabVideosMap = new Map();

      for (const docSnap of allUsersSnap.docs) {
        if (docSnap.id === currentUser.uid) continue;

        const otherUserData = docSnap.data();
        const otherTopics = otherUserData.topics || [];
        const otherLanguages = otherUserData.languages || [];
        const otherPrefs = new Set([...otherTopics, ...otherLanguages]);

        const commonPrefs = [...currentPrefs].filter((pref) =>
          otherPrefs.has(pref)
        );

        if (
          commonPrefs.length >=
          Math.min(currentPrefs.size, otherPrefs.size) / 2
        ) {
          let collabQueries = [];
          otherTopics.forEach((topic) => {
            collabQueries.push(
              `${topic} ${userSkillLevel} ${userContentType}`
            );
            otherLanguages.forEach((lang) => {
              collabQueries.push(`${topic} ${lang} ${userContentType}`);
            });
          });

          const videos = await fetchVideosByQueries(collabQueries);
          videos.forEach((video) => {
            if (!collabVideosMap.has(video.id) && !watchedVideoIds.has(video.id)) {
              collabVideosMap.set(video.id, video);
            }
          });
        }
      }

      setCollaborativeVideos(Array.from(collabVideosMap.values()));
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadWatchedVideos(user.uid);
        fetchVideos();
      } else {
        setCurrentUser(null);
        setVideoData([]);
        setCollaborativeVideos([]);
        setWatchedVideoIds(new Set());
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchVideos();
    }
  }, [watchedVideoIds]);

  const groupVideosByTopic = (videos) => {
    const grouped = {};
    videos.forEach((video) => {
      if (!grouped[video.topic]) {
        grouped[video.topic] = [];
      }
      grouped[video.topic].push(video);
    });
    return grouped;
  };

  const renderVideo = (video) => (
    <div
      key={video.id}
      style={{
        width: "500px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        padding: "15px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <h3 style={{ fontSize: "16px", textAlign: "center" }}>{video.title}</h3>
      <iframe
        width="450"
        height="250"
        src={`https://www.youtube.com/embed/${video.id}`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => saveWatchedVideo(video)}
        style={{ borderRadius: "8px", marginTop: "10px" }}
      ></iframe>
    </div>
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Recommended Videos
      </h1>

      {videoData.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No videos found for your preferences.
        </p>
      ) : (
        Object.entries(groupVideosByTopic(videoData)).map(([topic, videos]) => (
          <div key={topic} style={{ marginBottom: "40px" }}>
            <h2 style={{ marginBottom: "15px", color: "#333" }}>{topic}</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "25px",
                justifyContent: "flex-start",
              }}
            >
              {videos.map((video) => renderVideo(video))}
            </div>
          </div>
        ))
      )}

      <h1
        style={{ textAlign: "center", marginTop: "60px", marginBottom: "30px" }}
      >
        Other Users' Interests
      </h1>

      {collaborativeVideos.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No collaborative videos found.
        </p>
      ) : (
        Object.entries(groupVideosByTopic(collaborativeVideos)).map(
          ([topic, videos]) => (
            <div key={topic} style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "15px", color: "#666" }}>{topic}</h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "25px",
                  justifyContent: "flex-start",
                }}
              >
                {videos.map((video) => renderVideo(video))}
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}

export default Recommendation;
