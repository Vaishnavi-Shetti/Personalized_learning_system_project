import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [quizMarks, setQuizMarks] = useState({}); // State to store quiz marks

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch registration info
        const dataRef = doc(db, "userData", user.uid);
        const docSnap = await getDoc(dataRef);
        if (docSnap.exists()) setUserData(docSnap.data());

        // Fetch watched videos
        const watchedRef = doc(db, "watchedVideos", user.uid);
        const watchedSnap = await getDoc(watchedRef);
        if (watchedSnap.exists()) {
          setWatchedVideos(watchedSnap.data().videos || []);
        }

        // Fetch quiz marks
        const quizMarksRef = doc(db, "quizMarks", user.uid);
        const quizMarksSnap = await getDoc(quizMarksRef);
        if (quizMarksSnap.exists()) {
          const data = quizMarksSnap.data();
          setQuizMarks(data.quizzes || {});
        }

      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-header">👤 User Profile</h2>

      {/* Registration Info */}
      <div className="card p-4 mb-5 shadow">
        <h4>📝 Registration Info</h4>
        {userData ? (
          <ul>
            <li><strong>Name:</strong> {userData.name}</li>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Skill Level:</strong> {userData.skillLevel}</li>
            <li><strong>Content Type:</strong> {userData.contentType}</li>
            <li><strong>Languages:</strong> {(userData.languages || []).join(", ")}</li>
            <li><strong>Topics:</strong> {(userData.topics || []).join(", ")}</li>
          </ul>
        ) : (
          <p>No registration data found.</p>
        )}
      </div>

      {/* Watched Videos */}
      <div className="card p-4 shadow">
        <h4>📺 Watched Videos</h4>
        {watchedVideos.length === 0 ? (
          <p>You haven't watched any videos yet.</p>
        ) : (
          <div className="row">
            {watchedVideos.map((video, idx) => {
              const score = quizMarks[video.title]; // Fetch score by video title
              return (
                <div key={video.id || idx} className="col-md-6 mb-4 video-card">
                  <div className="card">
                    <iframe
                      className="video-iframe"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      allowFullScreen
                    ></iframe>
                    <div className="card-body">
                      <h5 className="card-title">{video.title}</h5>
                      {score !== undefined && (
                        <span className="badge bg-success mt-2">
                          Quiz Score: {score} / 5
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
