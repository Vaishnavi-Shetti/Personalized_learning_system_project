import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const addWatchedVideo = async (userId, video) => {
  try {
    await addDoc(collection(db, "watchedVideos"), {
      userId,
      videoId: video.videoId,
      title: video.title,
      url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`,
      description: video.description || "",
      duration: video.duration || 0,
      likes: video.likes || 0,
      views: video.views || 0,
      watchedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding watched video: ", error);
  }
};
