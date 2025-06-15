import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const API_KEY = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY;

const VideoLearningPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [videoData, setVideoData] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      const docRef = doc(db, 'videos', videoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideoData(docSnap.data());
      } else {
        setVideoData({ title: 'Not Found', description: 'Video content not available.' });
      }
    };

    fetchVideo();
  }, [videoId]);

  const generateQuiz = async () => {
    if (!videoData){
      console.warn('No video data available for quiz generation.');
    return;} 
    setLoading(true);
    console.log('Generating quiz for:', videoData.title);
    const prompt = `
Generate 5 multiple choice questions from this content:
"""
Title: ${videoData.title}
Description: ${videoData.description || 'N/A'}
"""
Each question should have:
- question
- options: [4]
- answer
Respond in JSON format.
`;

    try {
      const res = await axios.post(
        `${GEMINI_API_URL}?key=${API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Raw response:', text);
      const parsed = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
      setQuiz(parsed);
    } catch (err) {
      console.error('Quiz generation failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: option }));
  };
  {!quiz.length && !loading && (
  <p className="text-red-400 mt-4">No quiz generated. Please try again later.</p>
)}
{loading && <p className="mt-4 text-yellow-400">Generating quiz... please wait.</p>}



  const handleSubmit = async () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (correct >= 3 && user) {
      try {
        const progressRef = doc(db, 'progress', user.uid);
        await setDoc(progressRef, { completed: arrayUnion(videoId) }, { merge: true });
        setTimeout(() => navigate('/dashboard'), 2500);
      } catch (err) {
        console.error('Failed to update progress:', err.message);
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  // 👉 This function will be triggered when "Mark as Watched" is clicked
  const handleMarkAsWatched = () => {
    generateQuiz();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">{videoData?.title}</h1>
      <div className="mb-6">
        <ReactMarkdown>{videoData?.description || 'No description.'}</ReactMarkdown>
      </div>

      {/* Button to trigger quiz via "Mark as Watched" */}
      {!quiz.length && !loading && (
        <button
          onClick={handleMarkAsWatched}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Mark as Watched
        </button>
      )}

      {loading && <p className="mt-4 text-gray-300">Generating quiz...</p>}

      {quiz.length > 0 && (
        <div className="mt-6 space-y-6">
          {quiz.map((q, idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded shadow">
              <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
              {q.options.map((opt, i) => {
                const isSelected = answers[idx] === opt;
                const isCorrect = submitted && opt === q.answer;
                const isWrong = submitted && isSelected && opt !== q.answer;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(idx, opt)}
                    disabled={submitted}
                    className={`block w-full text-left px-4 py-2 rounded 
                      ${submitted
                        ? isCorrect
                          ? 'bg-green-600'
                          : isWrong
                          ? 'bg-red-600'
                          : 'bg-slate-700'
                        : isSelected
                        ? 'bg-blue-600'
                        : 'bg-slate-700 hover:bg-slate-600'}`}
                  >
                    {opt}
                  </button>
                );
              })}
              {submitted && (
                <p className={`mt-2 ${answers[idx] === q.answer ? 'text-green-400' : 'text-red-400'}`}>
                  {answers[idx] === q.answer ? 'Correct!' : `Wrong. Answer: ${q.answer}`}
                </p>
              )}
            </div>
          ))}

          <div className="mt-6 flex gap-4">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="bg-green-600 px-5 py-2 rounded"
              >
                Submit Quiz
              </button>
            ) : (
              <>
                <p className="text-lg">You scored {score} / {quiz.length}</p>
                <button
                  onClick={handleRetry}
                  className="bg-yellow-600 px-4 py-2 rounded"
                >
                  Retry Quiz
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLearningPage;
