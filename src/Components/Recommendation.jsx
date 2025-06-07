import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function getUserInterestArray(userData) {
  if (!userData) return [];

  let interests = [];

  if (userData.contentType) interests.push(userData.contentType.toLowerCase());
  if (Array.isArray(userData.languages))
    interests = interests.concat(userData.languages.map((l) => l.toLowerCase()));
  if (userData.skillLevel) interests.push(userData.skillLevel.toLowerCase());
  if (Array.isArray(userData.topics))
    interests = interests.concat(userData.topics.map((t) => t.toLowerCase()));

  return [...new Set(interests)];
}

const Recommendation = () => {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [watchedVideosData, setWatchedVideosData] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [collaborativeVideos, setCollaborativeVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) setUser(usr);
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (!user) return;

    const fetchAllUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "userData"));
      const usersArr = [];
      usersSnapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          usersArr.push({ id: doc.id, ...doc.data() });
        }
      });
      setAllUsersData(usersArr);
    };

    fetchAllUsers();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchWatchedVideos = async () => {
      const watchedVideosSnapshot = await getDocs(collection(db, "watchedVideos"));
      const videosArr = [];
      watchedVideosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.videos && Array.isArray(data.videos)) {
          videosArr.push({ userId: doc.id, videos: data.videos });
        }
      });
      setWatchedVideosData(videosArr);
      setLoading(false);
    };

    fetchWatchedVideos();
  }, [user]);

  const getVideosForUser = (userId) => {
    const userVideosObj = watchedVideosData.find((entry) => entry.userId === userId);
    if (userVideosObj && Array.isArray(userVideosObj.videos)) return userVideosObj.videos;
    return [];
  };

  useEffect(() => {
    if (!currentUserData || !watchedVideosData.length || !allUsersData.length) return;

    const currentUserInterests = getUserInterestArray(currentUserData);
    const currentUserVideos = getVideosForUser(user.uid);
    const currentUserWatchedIds = currentUserVideos.map((v) => v.id);

    const similarUsers = allUsersData.filter((otherUser) => {
      const otherInterests = getUserInterestArray(otherUser);
      const intersection = otherInterests.filter((i) => currentUserInterests.includes(i));
      const union = [...new Set([...currentUserInterests, ...otherInterests])];
      const similarity = union.length > 0 ? intersection.length / union.length : 0;
      return similarity >= 0.3;
    });

    let collabVideosMap = new Map();
    similarUsers.forEach((simUser) => {
      const simUserVideos = getVideosForUser(simUser.id);
      simUserVideos.forEach((video) => {
        if (!currentUserWatchedIds.includes(video.id)) {
          if (!collabVideosMap.has(video.id)) {
            collabVideosMap.set(video.id, video);
          }
        }
      });
    });

    let allVideosFlat = [];
    watchedVideosData.forEach((entry) => {
      if (Array.isArray(entry.videos)) {
        allVideosFlat = allVideosFlat.concat(entry.videos);
      }
    });

    const uniqueVideosMap = new Map();
    allVideosFlat.forEach((vid) => {
      if (!uniqueVideosMap.has(vid.id)) uniqueVideosMap.set(vid.id, vid);
    });
    const uniqueVideos = Array.from(uniqueVideosMap.values());

    const contentBasedVideos = uniqueVideos.filter((vid) => {
      const videoText = `${vid.title} ${vid.topic}`.toLowerCase();
      return currentUserInterests.some((interest) => videoText.includes(interest));
    });

    const contentBasedFiltered = contentBasedVideos.filter(
      (vid) => !currentUserWatchedIds.includes(vid.id)
    );

    const combinedRecommendationsMap = new Map();

    collabVideosMap.forEach((vid) => {
      combinedRecommendationsMap.set(vid.id, vid);
    });
    contentBasedFiltered.forEach((vid) => {
      if (!combinedRecommendationsMap.has(vid.id)) {
        combinedRecommendationsMap.set(vid.id, vid);
      }
    });

    const combinedRecommendations = Array.from(combinedRecommendationsMap.values());

    setRecommendedVideos(combinedRecommendations);

    const recommendedIdsSet = new Set(combinedRecommendations.map((vid) => vid.id));
    const collabOnlyVideos = Array.from(collabVideosMap.values()).filter(
      (vid) => !recommendedIdsSet.has(vid.id)
    );

    setCollaborativeVideos(collabOnlyVideos);
  }, [currentUserData, watchedVideosData, allUsersData, user]);

  if (loading) return <div>Loading recommendations...</div>;
  if (!user) return <div>Please log in to see recommendations.</div>;
  if (!currentUserData)
    return <div>Please complete your questionnaire to get personalized recommendations.</div>;

  return (
    <div className="container my-4">
      {/* ✅ Fixed Go to Profile Button */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => window.location.href = "/UserProfile"}
          style={{
            backgroundColor: "#28a745",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Go to Profile
        </button>
      </div>

      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          marginTop: "0",
          fontWeight: "bold",
        }}
      >
        Recommended Videos For You
      </h2>

      <div
        className="recommended-videos"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {recommendedVideos.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No recommendations available at this time.
          </p>
        ) : (
          recommendedVideos.map((video) => (
            <div
              key={video.id}
              style={{
                width: "320px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{ cursor: "pointer", aspectRatio: "16 / 9" }}
                onClick={() => window.open(video.url, "_blank")}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allowFullScreen
                  style={{ width: "100%", height: "180px", border: "none" }}
                ></iframe>
              </div>
              <div style={{ padding: "12px" }}>
                <h5 style={{ margin: "0 0 8px 0" }}>{video.title}</h5>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#555" }}>
                  Topic: {video.topic} <br />
                  Duration: {video.duration} <br />
                  Likes: {video.likes} | Views: {video.views}
                </p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                    fontWeight: "bold",
                  }}
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <hr style={{ borderTop: "2px solid #ccc", margin: "40px 0" }} />

      <h3
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontWeight: "bold",
        }}
      >
        Videos Watched by Users with Similar Interests
      </h3>

      <div
        className="collaborative-videos"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {collaborativeVideos.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No collaborative recommendations available.
          </p>
        ) : (
          collaborativeVideos.map((video) => (
            <div
              key={video.id}
              style={{
                width: "320px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{ cursor: "pointer", aspectRatio: "16 / 9" }}
                onClick={() => window.open(video.url, "_blank")}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allowFullScreen
                  style={{ width: "100%", height: "180px", border: "none" }}
                ></iframe>
              </div>
              <div style={{ padding: "12px" }}>
                <h5 style={{ margin: "0 0 8px 0" }}>{video.title}</h5>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#555" }}>
                  Topic: {video.topic} <br />
                  Duration: {video.duration} <br />
                  Likes: {video.likes} | Views: {video.views}
                </p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                    fontWeight: "bold",
                  }}
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recommendation;
