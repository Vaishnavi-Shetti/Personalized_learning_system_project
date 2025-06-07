// 📄 src/components/Profile.jsx

import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        const watchedRef = collection(db, 'users', user.uid, 'watchedVideos');
        const watchedSnap = await getDocs(watchedRef);

        const videos = watchedSnap.docs.map((doc) => doc.data());
        setWatchedVideos(videos);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/');
    });
  };

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <div className="text-center">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: 36,
              lineHeight: '80px',
              margin: '0 auto 10px',
            }}
          >
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <h4>{userData.username}</h4>
          <p className="text-muted">{userData.email}</p>
        </div>

        <hr />

        <h5>Preferences</h5>
        <div className="mb-3">
          <label>Interested Domains:</label>
          <select className="form-select" disabled>
            {userData.interests?.map((domain, i) => (
              <option key={i}>{domain}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Known Programming Languages:</label>
          <select className="form-select" disabled>
            {userData.programmingLanguages?.map((lang, i) => (
              <option key={i}>{lang}</option>
            ))}
          </select>
        </div>

        <hr />

        <h5>Watched Videos</h5>
        <ul className="list-group">
          {watchedVideos.length === 0 ? (
            <li className="list-group-item">No videos watched yet.</li>
          ) : (
            watchedVideos.map((video, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                {video.title}
                <span className="badge bg-success rounded-pill">
                  Quiz Score: {video.quizScore || 0}%
                </span>
              </li>
            ))
          )}
        </ul>

        <button onClick={handleLogout} className="btn btn-danger mt-4">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
