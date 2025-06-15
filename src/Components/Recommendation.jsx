import React, { useEffect, useState } from "react";
import "./Recommendation.css";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import mockVideos from "../data/mockVideos.json"; // my JSON format

// Helper unction to get all user interests as lowercase trimmed strings
function getUserInterestArray(userData) {
  if (!userData) return [];
  let interests = [];
  if (userData.contentType) interests.push(userData.contentType.toLowerCase().trim());
  if (Array.isArray(userData.languages))
    interests = interests.concat(userData.languages.map((l) => l.toLowerCase().trim()));
  if (userData.skillLevel) interests.push(userData.skillLevel.toLowerCase().trim());
  if (Array.isArray(userData.topics))
    interests = interests.concat(userData.topics.map((t) => t.toLowerCase().trim()));
  return [...new Set(interests)];
}

const Recommendation = () => {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [collaborativeVideos, setCollaborativeVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracking auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Fetch current user data
  useEffect(() => {
    if (!user) return;
    const fetchCurrentUserData = async () => {
      const docRef = doc(db, "userData", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setCurrentUserData(docSnap.data());
      else setCurrentUserData(null);
    };
    fetchCurrentUserData();
  }, [user]);

  // Fetch all other users data
  useEffect(() => {
    if (!user) return;
    const fetchAllUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "userData"));
      const usersArr = [];
      usersSnapshot.forEach((doc) => {
        if (doc.id !== user.uid) usersArr.push({ id: doc.id, ...doc.data() });
      });
      setAllUsersData(usersArr);
    };
    fetchAllUsers();
  }, [user]);

  // Fetch watched videos for a user from Firestore
  const fetchWatchedVideosForUser = async (userId) => {
    const docRef = doc(db, "watchedVideos", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.videos)) return data.videos;
    }
    return [];
  };

  // Generate recommendations based on current user and others
  useEffect(() => {
    if (!currentUserData || allUsersData.length === 0) return;

    const generateRecommendations = async () => {
      setLoading(true);

      const userTopics = (currentUserData.topics || []).map((t) => t.toLowerCase().trim());
      const userLanguages = (currentUserData.languages || []).map((l) => l.toLowerCase().trim());

      // Content-based filtering (match at least one topic OR language)
      const contentBasedVideos = mockVideos.filter((video) => {
        if (!video.videoId) return false;

        const videoTopics = Array.isArray(video.topics)
          ? video.topics.map((t) => t.toLowerCase().trim())
          : [];
        const videoLanguages = Array.isArray(video.languages)
          ? video.languages.map((l) => l.toLowerCase().trim())
          : [];

        const matchesTopic =
          userTopics.length === 0 || videoTopics.some((t) => userTopics.includes(t));
        const matchesLanguage =
          userLanguages.length === 0 || videoLanguages.some((l) => userLanguages.includes(l));

        return matchesTopic || matchesLanguage;
      });

      // Collaborative filtering: find similar users by interest overlap
      const userInterests = getUserInterestArray(currentUserData);
      const similarUsers = allUsersData.filter((otherUser) => {
        const otherInterests = getUserInterestArray(otherUser);
        const intersection = otherInterests.filter((i) => userInterests.includes(i));
        const union = [...new Set([...userInterests, ...otherInterests])];
        const similarity = union.length > 0 ? intersection.length / union.length : 0;
        return similarity >= 0.3;
      });

      // Fetch videos watched by similar users
      const simUsersWatchedVideosList = await Promise.all(
        similarUsers.map(async (simUser) => {
          const vids = await fetchWatchedVideosForUser(simUser.id);
          return { userId: simUser.id, videos: vids };
        })
      );

      // Collect unique collaborative videos (excluding those already in content-based)
      const contentIds = new Set(contentBasedVideos.map((v) => v.id));
      const collabVideosMap = new Map();
      simUsersWatchedVideosList.forEach(({ videos }) => {
        videos.forEach((video) => {
          if (video.id && !contentIds.has(video.id) && video.videoId) {
            collabVideosMap.set(video.id, video);
          }
        });
      });

      setRecommendedVideos(contentBasedVideos);
      setCollaborativeVideos(Array.from(collabVideosMap.values()));
      setLoading(false);
    };

    generateRecommendations();
  }, [currentUserData, allUsersData]);

  // Mark a video as watched
  const handleVideoWatch = async (video) => {
    if (!user) {
      alert("Please log in to mark videos as watched.");
      return;
    }

    const watchedVideosRef = doc(db, "watchedVideos", user.uid);
    const docSnap = await getDoc(watchedVideosRef);

    try {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const alreadyWatched = (data.videos || []).some((v) => v.id === video.id);
        if (!alreadyWatched) {
          await updateDoc(watchedVideosRef, {
            videos: arrayUnion(video),
          });
          //alert(`Marked "${video.title}" as watched.`);
        } else {
          //alert(`You already marked "${video.title}" as watched.`);
        }
      } else {
        await setDoc(watchedVideosRef, {
          videos: [video],
        });
        alert(`Marked "${video.title}" as watched.`);
      }
    } catch (error) {
      console.error("Error marking video as watched:", error);
      //alert("Failed to mark video as watched.");
    }
  };

  // Render videos UI
  const renderVideos = (videos) =>
    videos
      .filter((video) => video.videoId && video.videoId.trim() !== "")
      .map((video) => (
        <div
          key={video.id}
          style={{
            width: "300px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h4>{video.title}</h4>
          <iframe
            width="100%"
            height="170"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "8px", marginBottom: "10px" }}
          ></iframe>
          <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Watch on YouTube
            </a>
            <button onClick={() => handleVideoWatch(video)} className="btn btn-success">
              Mark as Watched
            </button>
          </div>
        </div>
      ));

  if (loading) return <div>Loading recommendations...</div>;
  if (!user) return <div>Please log in to see recommendations.</div>;
  if (!currentUserData)
    return <div>Please complete your questionnaire to get personalized recommendations.</div>;

  return (
    <div className="container my-4">
      <h2 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "30px" }}>
        Recommended Videos For You
      </h2>
      <div
        className="recommended-videos"
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "25px" }}
      >
        {recommendedVideos.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No recommendations available at this time.
          </p>
        ) : (
          renderVideos(recommendedVideos)
        )}
      </div>

      <hr style={{ borderTop: "2px solid #ccc", margin: "40px 0" }} />

      <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "30px" }}>
        Videos Watched by Users with Similar Interests
      </h3>
      <div
        className="collaborative-videos"
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "25px" }}
      >
        {collaborativeVideos.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No collaborative recommendations available.
          </p>
        ) : (
          renderVideos(collaborativeVideos)
        )}
      </div>
    </div>
  );
};

export default Recommendation;
