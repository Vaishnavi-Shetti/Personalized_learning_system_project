import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Questionnaire.css';

function Questionnaire() {
  const navigate = useNavigate();

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [contentType, setContentType] = useState('');
  const [languages, setLanguages] = useState([]);

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

  const programmingLanguages = [
    'Python',
    'JavaScript',
    'Java',
    'C++',
    'C#',
    'PHP',
    'TypeScript',
    'Kotlin',
    'Dart',
  ];

  const handleTopicChange = (e) => {
    const value = e.target.value;
    setSelectedTopics((prev) =>
      prev.includes(value)
        ? prev.filter((topic) => topic !== value)
        : [...prev, value]
    );
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    setLanguages((prev) =>
      prev.includes(value)
        ? prev.filter((lang) => lang !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTopics.length === 0 || !skillLevel || !contentType) {
      alert('Please fill in all fields.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('User not signed in!');
      return;
    }

    const data = {
      topics: selectedTopics,
      skillLevel,
      contentType,
      languages,
      timestamp: Timestamp.now(),
    };

    try {
      await setDoc(doc(db, 'userData', user.uid), data, { merge: true });
      console.log('Saved to Firestore:', data);

      navigate('/recommendations', {
        state: {
          selectedTopics,
          skillLevel,
          contentType,
          selectedLanguages: languages,
        },
      });
    } catch (error) {
      console.error('Error saving preferences:', error.message);
      alert('Failed to save preferences. Try again.');
    }
  };
return (
  <>
  {/* Top Centered Heading */}
  <div className="ready-heading">
    <h1>Ready to Learn?</h1>
  </div>

  {/* Slightly Elevated Questions Container */}
  <div className="form-container">
    <div className="form-card">
      <div className="form-left">
        <h4>Tell us what you love — we’ll tailor your journey.</h4>

        <form onSubmit={handleSubmit}>
          <label>1. Interests:</label>
          <div className="options">
            {topics.map((topic, index) => (
              <label key={index}>
                <input
                  type="checkbox"
                  value={topic}
                  onChange={handleTopicChange}
                />
                {topic}
              </label>
            ))}
          </div>

          <label>2. Skill Level:</label>
          <div className="options">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <label key={level}>
                <input
                  type="radio"
                  name="skillLevel"
                  value={level}
                  onChange={(e) => setSkillLevel(e.target.value)}
                />
                {level}
              </label>
            ))}
          </div>

          <label>3. Preferred Content Type:</label>
          <div className="options">
            {['Projects', 'Tutorials', 'Conceptual Videos'].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="contentType"
                  value={type}
                  onChange={(e) => setContentType(e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>

          <label>4. Preferred Programming Languages:</label>
          <div className="options">
            {programmingLanguages.map((lang, index) => (
              <label key={index}>
                <input
                  type="checkbox"
                  value={lang}
                  onChange={handleLanguageChange}
                />
                {lang}
              </label>
            ))}
          </div>

          <button type="submit">Get Recommendations</button>
        </form>
      </div>
    </div>
  </div>
</>
);
}
export default Questionnaire;
//   return (
    
//     <div className="form-container">
//       <div className="form-card">
//         <div className="form-left">
//           <div className="form-right">
//           <h1>Ready to Learn?</h1>
//         </div>
//         <h4>Tell us what you love — we’ll tailor your journey.</h4>

//           <form onSubmit={handleSubmit}>
//             <label>1. Interests:</label>
//             <div className="options">
//               {topics.map((topic, index) => (
//                 <label key={index}>
//                   <input
//                     type="checkbox"
//                     value={topic}
//                     onChange={handleTopicChange}
//                   />
//                   {topic}
//                 </label>
//               ))}
//             </div>

//             <label>2. Skill Level:</label>
//             <div className="options">
//               {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
//                 <label key={level}>
//                   <input
//                     type="radio"
//                     name="skillLevel"
//                     value={level}
//                     onChange={(e) => setSkillLevel(e.target.value)}
//                   />
//                   {level}
//                 </label>
//               ))}
//             </div>

//             <label>3. Preferred Content Type:</label>
//             <div className="options">
//               {['Projects', 'Tutorials', 'Conceptual Videos'].map((type) => (
//                 <label key={type}>
//                   <input
//                     type="radio"
//                     name="contentType"
//                     value={type}
//                     onChange={(e) => setContentType(e.target.value)}
//                   />
//                   {type}
//                 </label>
//               ))}
//             </div>

//             <label>4. Preferred Programming Languages:</label>
//             <div className="options">
//               {programmingLanguages.map((lang, index) => (
//                 <label key={index}>
//                   <input
//                     type="checkbox"
//                     value={lang}
//                     onChange={handleLanguageChange}
//                   />
//                   {lang}
//                 </label>
//               ))}
//             </div>

//             <button type="submit">Get Recommendations</button>
//           </form>
//         </div>
//         {/* <div className="form-right">
//           <h1>Ready to Learn?</h1>
//         </div> */}
//       </div>
//     </div>
//   );
// }

