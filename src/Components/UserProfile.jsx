
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import './UserProfile.css';
import Modal from "react-modal";
import VideoLearningPage from "./VideoLearningPage";
import profile from './profile.png';

Modal.setAppElement("#root");

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [quizMarks, setQuizMarks] = useState({});

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedVideoForQuiz, setSelectedVideoForQuiz] = useState(null);

  const openQuizModal = (video) => {
    setSelectedVideoForQuiz(video);
    setShowQuizModal(true);
  };

  const closeQuizModal = () => {
    setSelectedVideoForQuiz(null);
    setShowQuizModal(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById("backToTopBtn");
      if (btn) {
        btn.style.display = window.scrollY > 300 ? "block" : "none";
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const dataRef = doc(db, "userData", user.uid);
        const docSnap = await getDoc(dataRef);
        if (docSnap.exists()) setUserData(docSnap.data());

        const watchedRef = doc(db, "watchedVideos", user.uid);
        const watchedSnap = await getDoc(watchedRef);
        if (watchedSnap.exists()) {
          setWatchedVideos(watchedSnap.data().videos || []);
        }

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
  <div className="profile-wrapper">
    {/* Top Section: Profile Photo + User Info */}
    <div className="profile-info-container">
      <div className="photo-container">
        {profile && (
          <img src={profile} alt="Profile" className="profile-photo" />
        )}
      </div>
      <div className="details-container">
        {userData && (
          <>
            <h1 className="user-name-title">{userData.name}</h1>
            <ul className="info-list">
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Skill Level:</strong> {userData.skillLevel}</li>
              <li><strong>Content Type:</strong> {userData.contentType}</li>
              <li><strong>Languages:</strong> {(userData.languages || []).join(", ")}</li>
              <li><strong>Topics:</strong> {(userData.topics || []).join(", ")}</li>
            </ul>
          </>
        )}
      </div>
    </div>

    {/* Watched Videos - Styles Unchanged */}
    <div className="watched-wrapper mt-5">
      <div className="card p-4 mb-5">
        <h4>📺 Watched Videos</h4>
        {watchedVideos.length === 0 ? (
          <p>You haven't watched any videos yet.</p>
        ) : (
          <div className="row no-stretch-row">
            {watchedVideos.map((video, idx) => {
              const score = quizMarks[video.title];
              return (
                <div key={video.id || idx} className="video-card">
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
                        <>
                          <span className="badge bg-primary mt-2">
                            Quiz Score: {score} / 5
                          </span>
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => openQuizModal(video)}
                          >
                            Take Quiz Again
                          </button>
                        </>
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

    {/* Quiz Modal */}
    <Modal
      isOpen={showQuizModal}
      onRequestClose={closeQuizModal}
      contentLabel="Quiz Modal"
      style={{
        content: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "10px",
          padding: "20px",
        },
      }}
    >
      <button onClick={closeQuizModal} className="btn btn-sm btn-secondary mb-3 float-end">
        Close
      </button>
      {selectedVideoForQuiz && <VideoLearningPage video={selectedVideoForQuiz} />}
    </Modal>

    {/* Back to Top Button */}
    <button
      id="backToTopBtn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  </div>
);



};
export default UserProfile;
