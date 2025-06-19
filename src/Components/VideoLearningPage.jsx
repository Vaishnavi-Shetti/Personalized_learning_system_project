import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import './styles.css';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const API_KEY = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY;

const VideoLearningPage = ({ video }) => {
  const { videoId: videoIdFromURL } = useParams();
  const videoId = video?.videoId || videoIdFromURL;
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [videoData, setVideoData] = useState(video || null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      if (video) return;

      try {
        const watchedRef = doc(db, 'watchedVideos', user.uid);
        const watchedSnap = await getDoc(watchedRef);
        if (watchedSnap.exists()) {
          const videos = watchedSnap.data().videos || [];
          const matched = videos.find(v => v.videoId === videoId);
          setVideoData(matched || { title: 'Not Found', description: 'Video not found in your watched list.' });
        }
      } catch (err) {
        console.error('Error fetching video data:', err);
      }
    };

    fetchVideo();
  }, [video, videoId]);

  const generateQuiz = async () => {
    if (!videoData) return;
    setLoading(true);

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

      const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']') + 1;
      const jsonString = raw.slice(start, end);
      const parsed = JSON.parse(jsonString);

      const isValid = parsed.every(item => item.question && item.options && item.answer);
      setQuiz(isValid ? parsed : []);
    } catch (err) {
      console.error('Quiz generation failed:', err);
      setQuiz([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [idx]: option }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (!user?.uid || !videoData?.title) return;

    try {
      const progressRef = doc(db, 'progress', user.uid);
      await setDoc(progressRef, { completed: arrayUnion(videoId) }, { merge: true });

      const quizMarksRef = doc(db, 'quizMarks', user.uid);
      await setDoc(
        quizMarksRef,
        { quizzes: { [videoData.title]: correct } },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to update Firestore:', err.message);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

return (
  <div className="min-h-screen bg-[#0f0c1d] flex flex-col items-center px-4 py-6 text-white">
    <h1 className="text-2xl font-semibold text-white mb-4 text-center">
      {videoData?.title}
    </h1>
{!quiz.length && !loading && (
  <div className="button-wrapper">
    <button onClick={generateQuiz} className="quiz-action-button">
      Take Quiz
    </button>
  </div>
)}


    {loading && <p className="text-white text-sm mt-2">Generating quiz...</p>}

    {quiz.length > 0 && (
      <div className="w-full max-w-md bg-[#1e003c] p-4 rounded-xl shadow-xl mt-4 space-y-4">
        {quiz.map((q, idx) => (
          <div key={idx} className="bg-[#120227] p-3 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-white leading-snug">
                {idx + 1}. {q.question}
              </p>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isSelected = answers[idx] === opt;
                const isCorrect = submitted && opt === q.answer;
                const isWrong = submitted && isSelected && opt !== q.answer;

                return (
                  <label
                    key={i}
                    className={`flex items-center gap-2 text-xs px-2 py-[1px] rounded-full border transition cursor-pointer w-fit
                      ${isCorrect
                        ? 'bg-green-600 border-green-500 text-white'
                        : isWrong
                        ? 'bg-red-600 border-red-500 text-white'
                        : isSelected
                        ? 'bg-purple-800 border-purple-500 text-white'
                        : 'bg-black border-purple-500 text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleAnswer(idx, opt)}
                      disabled={submitted}
                      className="accent-purple-500"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>

            {submitted && (
              <div className="text-xs text-center mt-1 text-white">
                {answers[idx] === q.answer ? (
                  <span className="text-green-400 font-bold">Correct</span>
                ) : (
                  <>
                    <p className="text-red-400 font-bold">Wrong</p>
                    <p className="text-green-300 font-bold">Correct: {q.answer}</p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* <div className="flex flex-col items-center gap-2 pt-2">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              // className="bg-[#a041f0] hover:bg-[#821ff0] text-white text-sm px-2 py-[1px] rounded-md shadow-md transition w-fit"
              className="glow-button"

            >
              Submit
            </button>
          ) : (
            <>
              <p className="text-sm text-white font-semibold">
                You scored {score} / {quiz.length}
              </p>
              <button
                onClick={handleRetry}
className="glow-button"
              >
                Retry
              </button>
            </>
          )}
        </div> */}
        {/* <div className="flex justify-center gap-2 mt-4">
  {!submitted ? (
    <button onClick={handleSubmit} className="glow-button">
      Submit
    </button>
  ) : (
    <>
      <p className="text-sm text-white font-semibold text-center">
        You scored {score} / {quiz.length}
      </p>
      <button onClick={handleRetry} className="glow-button">
        Retry
      </button>
    </>
  )}
</div> */}
{quiz.length > 0 && (
  <div className="flex flex-col items-center gap-2 pt-2">
    {!submitted ? (
      <div className="button-wrapper">
        <button onClick={handleSubmit} className="quiz-action-button">
          Submit
        </button>
      </div>
    ) : (
      <>
        <p className="text-sm text-white font-semibold text-center">
          You scored {score} / {quiz.length}
        </p>
        <div className="button-wrapper">
          <button onClick={handleRetry} className="quiz-action-button">
            Retry
          </button>
        </div>
      </>
    )}
  </div>
)}

      </div>
    )}
  </div>
);
}
export default VideoLearningPage;
