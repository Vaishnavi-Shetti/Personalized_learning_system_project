import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase";
import { collection, addDoc } from 'firebase/firestore';

function Questionnaire() {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState([]);

  const topics = [
    'Web Development',
    'AI/ML',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'Mobile App Development',
    'DevOps',
    'Game Development',
  ];

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedTopics((prev) =>
      prev.includes(value)
        ? prev.filter((topic) => topic !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTopics.length === 0) {
      alert('Please select at least one interest.');
      return;
    }

    try {
      await addDoc(collection(db, 'userPreferences'), {
        topics: selectedTopics,
        timestamp: new Date()
      });
      console.log('Saved to Firestore:', selectedTopics);
      navigate('/recommendations');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Try again.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '500px' }}>
        <h3 className="text-center mb-4">What are your interests?</h3>
        <form onSubmit={handleSubmit}>
          {topics.map((topic, index) => (
            <div className="form-check mb-2" key={index}>
              <input
                className="form-check-input"
                type="checkbox"
                value={topic}
                id={`check-${index}`}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor={`check-${index}`}>
                {topic}
              </label>
            </div>
          ))}

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Get Recommendations
          </button>
        </form>
      </div>
    </div>
  );
}

export default Questionnaire;
