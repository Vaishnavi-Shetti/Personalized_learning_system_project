import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const [user, setUser] = useState(null);

  // Sample metadata (You can update this dynamically later)
  const sampleMetadata = {
    title: "Example video",
    topic: "web development",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    duration: "PT5M10S",
    likes: "1234567",
    views: "123456"
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        console.log('User signed in:', usr.uid);
        setUser(usr);
      } else {
        console.log('No user signed in.');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saveWatchedVideo = async () => {
      if (!user || !videoId) return;

      try {
        const docRef = doc(db, 'watchedVideos', `${user.uid}_${videoId}`);
        await setDoc(docRef, {
          userId: user.uid,
          videoId: videoId,
          title: sampleMetadata.title,
          topic: sampleMetadata.topic,
          url: sampleMetadata.url,
          duration: sampleMetadata.duration,
          likes: sampleMetadata.likes,
          views: sampleMetadata.views,
          watchedAt: serverTimestamp(),
        });
        console.log('✅ Video marked as watched.');
      } catch (error) {
        console.error('❌ Error saving watched video:', error);
      }
    };

    saveWatchedVideo();
  }, [user, videoId]);

  return (
    <div className="container my-4">
      <h2>Now Playing</h2>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;
