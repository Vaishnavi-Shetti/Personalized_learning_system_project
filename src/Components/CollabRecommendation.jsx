// import React, { useEffect, useState } from 'react';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { auth, db } from '../firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import VideoCard from './VideoCard';

// const CollaborativeRecommendation = () => {
//   const [recommendedVideos, setRecommendedVideos] = useState([]);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUserId(user.uid);
//         await generateCollaborativeRecommendations(user.uid);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const generateCollaborativeRecommendations = async (currentUserId) => {
//     try {
//       // Fetch current user preferences
//       const currentUserSnap = await getDocs(
//         query(collection(db, 'userData'), where('userId', '==', currentUserId))
//       );
//       const currentUserData = currentUserSnap.docs[0]?.data();

//       if (!currentUserData) return;

//       // Fetch all users
//       const allUsersSnap = await getDocs(collection(db, 'userData'));
//       const otherUsers = allUsersSnap.docs.filter(doc => doc.data().userId !== currentUserId);

//       // Compare interests
//       let similarUsers = [];
//       for (const doc of otherUsers) {
//         const data = doc.data();
//         const overlapTopics = data.topics.filter(topic => currentUserData.topics.includes(topic));
//         const overlapLanguages = data.languages.filter(lang => currentUserData.languages.includes(lang));
//         if (overlapTopics.length > 0 || overlapLanguages.length > 0) {
//           similarUsers.push(data.userId);
//         }
//       }

//       // Get watched videos of similar users
//       const watchedByOthersSnap = await getDocs(collection(db, 'watchedVideos'));
//       const allWatched = watchedByOthersSnap.docs.map(doc => doc.data());

//       const watchedBySimilarUsers = allWatched.filter(video => similarUsers.includes(video.userId));
//       const currentUserWatched = allWatched.filter(video => video.userId === currentUserId).map(v => v.videoId);

//       // Recommend videos watched by similar users but not by current user
//       const recommendations = watchedBySimilarUsers
//         .filter(video => !currentUserWatched.includes(video.videoId))
//         .map(video => video.videoId);

//       // Remove duplicates
//       const uniqueRecommendations = [...new Set(recommendations)];
//       setRecommendedVideos(uniqueRecommendations);
//     } catch (err) {
//       console.error('Error in collaborative recommendation:', err);
//     }
//   };

//   return (
//     <div className="container my-4">
//       <h3>Collaborative Recommendations</h3>
//       <div className="row">
//         {recommendedVideos.length > 0 ? (
//           recommendedVideos.map((videoId) => (
//             <div className="col-md-4" key={videoId}>
//               <VideoCard videoId={videoId} />
//             </div>
//           ))
//         ) : (
//           <p>No collaborative recommendations available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CollaborativeRecommendation;