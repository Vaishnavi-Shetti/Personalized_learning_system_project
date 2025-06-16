import React from "react";
import { useLocation, useParams } from "react-router-dom";
import mockVideos from "../data/mockVideos.json";

const VideoPlayer = () => {
  const { videoId } = useParams();
  const location = useLocation();

  // Prefer video object passed via navigation state, else find by videoId
  const video = location.state?.video || mockVideos.find((v) => v.videoId === videoId);

  if (!video) {
    return <div>Video not found.</div>;
  }

  return (
    <div className="container">
      <h2>{video.title}</h2>
      <iframe
        width="100%"
        height="480"
        src={`https://www.youtube.com/embed/${video.videoId}`}
        title={video.title}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <p className="mt-3">{video.description}</p>
      {/* Optional: Show more video details here */}
    </div>
  );
};

export default VideoPlayer;
// import React, { useEffect, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import mockVideos from "../data/mockVideos.json";
// import { db } from "../firebase";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// const VideoPlayer = () => {
//   console.log("🟨 VideoPlayer component loaded");

//   const { videoId } = useParams();
//   const location = useLocation();
//   const video = location.state?.video || mockVideos.find((v) => v.videoId === videoId);

//   const [userId, setUserId] = useState(null);
//   const [buttonText, setButtonText] = useState("Take Quiz");
//   const [isLoading, setIsLoading] = useState(true);

//   // Wait for Firebase Auth
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         console.log("✅ Auth detected:", user.uid);
//         setUserId(user.uid);
//       } else {
//         console.log("❌ No user logged in");
//         setUserId(null);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   // Check if quiz was already taken
//   useEffect(() => {
//     const fetchQuizStatus = async () => {
//       if (!userId || !video?.videoId) return;

//       try {
//         const docRef = doc(db, "quizmarks", userId);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const quizData = docSnap.data();
//           console.log("📘 Quiz Data:", quizData);

//           if (video.videoId in quizData) {
//             console.log("✅ Quiz already taken.");
//             setButtonText("Take Quiz Again");
//           } else {
//             console.log("🆕 Quiz not yet taken.");
//             setButtonText("Take Quiz");
//           }
//         } else {
//           console.log("📂 No quizmarks document found.");
//           setButtonText("Take Quiz");
//         }
//       } catch (error) {
//         console.error("🔥 Error checking quiz status:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchQuizStatus();
//   }, [userId, video?.videoId]);

//   // Handle quiz button click
//   const handleQuizClick = async () => {
//     const score = window.prompt("Simulated Quiz: Enter your score (0–10):");
//     if (score !== null && !isNaN(score)) {
//       try {
//         const docRef = doc(db, "quizmarks", userId);
//         await setDoc(
//           docRef,
//           {
//             [video.videoId]: {
//               title: video.title,
//               score: parseInt(score),
//               timestamp: new Date().toISOString(),
//             },
//           },
//           { merge: true }
//         );

//         console.log("✅ Quiz score saved:", score);
//         setButtonText("Take Quiz Again");
//         alert("Quiz submitted successfully.");
//       } catch (error) {
//         console.error("❌ Failed to save quiz:", error);
//       }
//     }
//   };

//   if (!video) return <div>Video not found.</div>;

//   return (
//     <div className="container">
//       <h2>{video.title}</h2>
//       <iframe
//         width="100%"
//         height="480"
//         src={`https://www.youtube.com/embed/${video.videoId}`}
//         title={video.title}
//         frameBorder="0"
//         allowFullScreen
//       ></iframe>
//       <p className="mt-3">{video.description}</p>

//       {/* ✅ Show Button */}
//       {userId && !isLoading && (
//         <button className="btn btn-primary mt-3" onClick={handleQuizClick}>
//           {buttonText}
//         </button>
//       )}
//       {!userId && !isLoading && (
//         <p className="text-danger mt-3">Please log in to take the quiz.</p>
//       )}
//     </div>
//   );
// };

// export default VideoPlayer;




