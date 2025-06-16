// import React, { useEffect, useState } from "react";
// import { db, auth } from "../firebase";
// import { doc, getDoc } from "firebase/firestore";
// import './UserProfile.css';

// const UserProfile = () => {
//   const [user, setUser] = useState(null);
//   const [userData, setUserData] = useState(null);
//   const [watchedVideos, setWatchedVideos] = useState([]);
//   const [quizMarks, setQuizMarks] = useState({}); // State to store quiz marks

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((usr) => {
//       setUser(usr);
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user) return;

//       try {
//         // Fetch registration info
//         const dataRef = doc(db, "userData", user.uid);
//         const docSnap = await getDoc(dataRef);
//         if (docSnap.exists()) setUserData(docSnap.data());

//         // Fetch watched videos
//         const watchedRef = doc(db, "watchedVideos", user.uid);
//         const watchedSnap = await getDoc(watchedRef);
//         if (watchedSnap.exists()) {
//           setWatchedVideos(watchedSnap.data().videos || []);
//         }

//         // Fetch quiz marks
//         const quizMarksRef = doc(db, "quizMarks", user.uid);
//         const quizMarksSnap = await getDoc(quizMarksRef);
//         if (quizMarksSnap.exists()) {
//           const data = quizMarksSnap.data();
//           setQuizMarks(data.quizzes || {});
//         }

//       } catch (err) {
//         console.error("Error fetching user profile:", err);
//       }
//     };

//     fetchData();
//   }, [user]);

//   if (!user) return <p>Loading user data...</p>;

//   return (
//     <div className="profile-container">
//       <h2 className="profile-header">👤 User Profile</h2>

//       {/* Registration Info */}
//       <div className="card p-4 mb-5 shadow">
//         <h4>📝 Registration Info</h4>
//         {userData ? (
//           <ul>
//             <li><strong>Name:</strong> {userData.name}</li>
//             <li><strong>Email:</strong> {user.email}</li>
//             <li><strong>Skill Level:</strong> {userData.skillLevel}</li>
//             <li><strong>Content Type:</strong> {userData.contentType}</li>
//             <li><strong>Languages:</strong> {(userData.languages || []).join(", ")}</li>
//             <li><strong>Topics:</strong> {(userData.topics || []).join(", ")}</li>
//           </ul>
//         ) : (
//           <p>No registration data found.</p>
//         )}
//       </div>

//       {/* Watched Videos */}
//       <div className="card p-4 shadow">
//         <h4>📺 Watched Videos</h4>
//         {watchedVideos.length === 0 ? (
//           <p>You haven't watched any videos yet.</p>
//         ) : (
//           <div className="row">
//             {/* {watchedVideos.map((video, idx) => {
//               const score = quizMarks[video.title]; // Fetch score by video title
//               return (
//                 <div key={video.id || idx} className="col-md-6 mb-4 video-card">
//                   <div className="card">
//                     <iframe
//                       className="video-iframe"
//                       src={`https://www.youtube.com/embed/${video.videoId}`}
//                       title={video.title}
//                       allowFullScreen
//                     ></iframe>
//                     <div className="card-body">
//                       <h5 className="card-title">{video.title}</h5>
//                       {score !== undefined && (
//                         <span className="badge bg-success mt-2">
//                           Quiz Score: {score} / 5
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })} */}
//             {watchedVideos.map((video, idx) => {
//   const score = quizMarks[video.title]; // Fetch score by video title
//   return (
//     <div key={video.id || idx} className="col-md-6 mb-4 video-card">
//       <div className="card">
//         <iframe
//           className="video-iframe"
//           src={`https://www.youtube.com/embed/${video.videoId}`}
//           title={video.title}
//           allowFullScreen
//         ></iframe>
//         <div className="card-body">
//           <h5 className="card-title">{video.title}</h5>
//           {score !== undefined && (
//             <>
//               <span className="badge bg-success mt-2">
//                 Quiz Score: {score} / 5
//               </span>
//               <button
//                 className="btn btn-outline-primary btn-sm d-block mt-3"
//                 onClick={() => window.location.href = `/quiz/${video.videoId}`}
//               >
//                 Take Quiz Again
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// })}

//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfile;
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import './UserProfile.css';
import Modal from "react-modal";
import VideoLearningPage from "./VideoLearningPage"; // Assuming this renders the quiz

Modal.setAppElement("#root");

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [quizMarks, setQuizMarks] = useState({}); // State to store quiz marks

  // NEW STATE for quiz modal
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
                        <>
                          {/* <span className="badge bg-success mt-2">
                            Quiz Score: {score} / 5
                          </span> */}
                          <span className="badge bg-primary mt-2">
                            Quiz Score: {score} / 5
                          </span>

                          {/* <button
                            className="btn btn-success d-block mt-3 w-100 fw-bold"
                            style={{ fontSize: "0.95rem" }}
                            onClick={() => openQuizModal(video)}
                          >
                            Take Quiz Again
                          </button> */}
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

      {/* MODAL FOR QUIZ */}
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
    </div>
  );
};

export default UserProfile;
