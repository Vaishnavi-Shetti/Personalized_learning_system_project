
// Recommendation.js
import React, { useEffect, useState } from "react";
import "./Recommendation.css";
import UserProfile from './UserProfile';
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

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
import mockVideos from "../data/mockVideos.json";
import VideoLearningPage from "./VideoLearningPage";
import Modal from "react-modal";

Modal.setAppElement("#root");

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
  const [watchedVideosIds, setWatchedVideosIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedVideoForQuiz, setSelectedVideoForQuiz] = useState(null);

  const openQuizModal = (video) => {
    setSelectedVideoForQuiz(video);
    setShowQuizModal(true);
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setSelectedVideoForQuiz(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchCurrentUserData = async () => {
      const docRef = doc(db, "userData", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setCurrentUserData(docSnap.data());
    };
    fetchCurrentUserData();
  }, [user]);

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

  useEffect(() => {
    if (!user) return;
    const fetchWatched = async () => {
      const docRef = doc(db, "watchedVideos", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ids = (data.videos || []).map((v) => v.id);
        setWatchedVideosIds(new Set(ids));
      }
    };
    fetchWatched();
  }, [user]);

  const fetchWatchedVideosForUser = async (userId) => {
    const docRef = doc(db, "watchedVideos", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.videos)) return data.videos;
    }
    return [];
  };

  useEffect(() => {
    if (!currentUserData || allUsersData.length === 0) return;

    const generateRecommendations = async () => {
      setLoading(true);

      const userTopics = (currentUserData.topics || []).map((t) => t.toLowerCase().trim());
      const userLanguages = (currentUserData.languages || []).map((l) => l.toLowerCase().trim());

      const contentBasedVideos = mockVideos.filter((video) => {
        if (!video.videoId) return false;

        const videoTopics = Array.isArray(video.topics)
          ? video.topics.map((t) => t.toLowerCase().trim())
          : [];
        const videoLanguages = Array.isArray(video.languages)
          ? video.languages.map((l) => l.toLowerCase().trim())
          : [];

        const matchesTopic = videoTopics.some((t) => userTopics.includes(t));
        const matchesLanguage = videoLanguages.some((l) => userLanguages.includes(l));

        return matchesTopic || matchesLanguage;
      });

      const userInterests = getUserInterestArray(currentUserData);
      const similarUsers = allUsersData.filter((otherUser) => {
        const otherInterests = getUserInterestArray(otherUser);
        const intersection = otherInterests.filter((i) => userInterests.includes(i));
        const union = [...new Set([...userInterests, ...otherInterests])];
        const similarity = union.length > 0 ? intersection.length / union.length : 0;
        return similarity >= 0.3;
      });

      const simUsersWatchedVideosList = await Promise.all(
        similarUsers.map(async (simUser) => {
          const vids = await fetchWatchedVideosForUser(simUser.id);
          return { userId: simUser.id, videos: vids };
        })
      );

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
        }
      } else {
        await setDoc(watchedVideosRef, {
          videos: [video],
        });
      }

      alert(`Successfully marked "${video.title}" as watched.`);
      openQuizModal(video);
      setWatchedVideosIds((prev) => new Set([...prev, video.id]));
    } catch (error) {
      console.error("Error marking video as watched:", error);
    }
  };
  const renderVideos = (videos) =>
    videos
      .filter((video) => video.videoId && video.videoId.trim() !== "")
      .map((video) => {
        const isWatched = watchedVideosIds.has(video.id);

        return (
          <div key={video.id} className="video-card">
            <h4>{video.title}</h4>
            <iframe
              width="100%"
              height="170"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: "12px", marginBottom: "12px" }}
            ></iframe>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-purple"
              >
                Watch on YouTube
              </a>

              {isWatched ? (
                // <span style={{ color: "#00ffae", fontWeight: "bold", fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                //   <FaCheckCircle />
                //   Watched
                // </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                  {/* <FaCheckCircle
    style={{
      color: "#c084fc",
      textShadow: "0 0 6px #a855f7",
      fontSize: "1.5rem",
      
    }}
  /> */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <FaCheckCircle
                      style={{
                        color: "#c084fc",
                        textShadow: "0 0 6px #a855f7",
                        fontSize: "1.5rem",
                      }}
                    />
                  </div>

                  <span
                    style={{
                      color: "#c084fc",
                      textShadow: "0 0 6px #a855f7",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                    }}
                  >
                    {/* Watched */}
                  </span>
                </div>




              ) : (
                <button
                  
                  onClick={() => handleVideoWatch(video)}
                  className="btn-purple"
                >
                  Mark as Watched
                </button>


              )}
            </div>
          </div>
        );
      });

  if (loading) return <div>Loading recommendations...</div>;
  if (!user) return <div>Please log in to see recommendations.</div>;
  if (!currentUserData)
    return <div>Please complete your questionnaire to get personalized recommendations.</div>;

  return (
    <div style={{ position: "relative" }}>
      {/* <button
        onClick={() => navigate("/profile")}
        style={{
          position: "fixed",
          top: "20px",
          right: "30px",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}
      >
        <FaUserCircle style={{ marginRight: "8px", fontSize: "20px" }} />
        My Profile
      </button> */}
      <button
        onClick={() => navigate("/profile")}
        className="profile-button"
      >
        <FaUserCircle style={{ fontSize: "20px" }} />
        Profile
      </button>


      <h2 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px", marginTop: "20px" }} className="section-heading">
        Recommended Videos For You
      </h2>


      {/* Glowing line just below the heading */}
      <hr className="glow-line" />

      <div
        className="recommended-videos"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "25px",
          marginTop: "20px"
        }}
      >
        {recommendedVideos.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No recommendations available at this time.
          </p>
        ) : (
          renderVideos(recommendedVideos)
        )}
      </div>

      <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "30px", marginTop: "50px" }} className="similar-interest-heading">
        Videos Watched by Users with Similar Interests
      </h3>
      <hr className="glow-line" />

      <div
        className="collaborative-videos"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "25px"
        }}
      >
        {collaborativeVideos.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No collaborative recommendations available.
          </p>
        ) : (
          renderVideos(collaborativeVideos)
        )}
      </div>

      <Modal
        isOpen={showQuizModal}
        onRequestClose={closeQuizModal}
        contentLabel="Quiz Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: "10px",
            padding: "20px"
          }
        }}
      >
        <button onClick={closeQuizModal}  className="glow-button"
>
          Close
        </button>
        {selectedVideoForQuiz && <VideoLearningPage video={selectedVideoForQuiz} />}
      </Modal>

    </div>
  );
};

export default Recommendation;
