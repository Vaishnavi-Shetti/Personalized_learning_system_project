import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const Recommendation = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserPreferences = async () => {
    const prefsSnapshot = await getDocs(collection(db, 'userPreferences'));
    if (!prefsSnapshot.empty) {
      const lastPref = prefsSnapshot.docs[prefsSnapshot.docs.length - 1].data();
      return lastPref.topics || [];
    }
    return [];
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);

      const userInterests = await getUserPreferences();

      if (userInterests.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }

      const videosSnapshot = await getDocs(collection(db, 'videos'));
      const allVideos = videosSnapshot.docs.map((doc) => doc.data());

      // Content-Based Filtering (simple: match tags)
      const matched = allVideos.filter((video) =>
        Array.isArray(video.tags) &&
        video.tags.some((tag) => userInterests.includes(tag))

      );

      setVideos(matched);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading recommendations...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return <p className="text-center mt-5">No videos match your interests.</p>;
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Recommended Videos for You</h2>
      <div className="row">
        {videos.map((video, index) => (
          <div className="col-md-6 mb-4" key={index}>
            <div className="card h-100 shadow">
              <div className="ratio ratio-16x9">
                <iframe
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">
                  Tags: {video.tags.join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendation;
