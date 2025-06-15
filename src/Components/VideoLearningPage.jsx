import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { getAuth } from 'firebase/auth';

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
          if (matched) {
            setVideoData(matched);
          } else {
            setVideoData({ title: 'Not Found', description: 'Video not found in your watched list.' });
          }
        }
      } catch (err) {
        console.error('Error fetching video data:', err);
      }
    };

    fetchVideo();
  }, [video, videoId]);

  const generateQuiz = async () => {
    if (!videoData) {
      console.warn('No video data available for quiz generation.');
      return;
    }
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
      console.log('Gemini raw text:', raw);

      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']') + 1;
      const jsonString = raw.slice(start, end);
      const parsed = JSON.parse(jsonString);

      const isValid = parsed.every(item => item.question && item.options && item.answer);
      if (!isValid) {
        console.warn('Invalid quiz format:', parsed);
        setQuiz([]);
      } else {
        setQuiz(parsed);
      }

    } catch (err) {
      console.error('Quiz generation failed:', err);
      setQuiz([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: option }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    console.log("Submitting quiz...");
    console.log("User:", user?.uid);
    console.log("Video Title:", videoData?.title);
    console.log("Correct Answers:", correct);

    if (!user?.uid || !videoData?.title) {
      console.warn("Missing user or video data. Aborting Firestore write.");
      return;
    }

    try {
      const progressRef = doc(db, 'progress', user.uid);
      await setDoc(progressRef, { completed: arrayUnion(videoId) }, { merge: true });

      const quizMarksRef = doc(db, 'quizMarks', user.uid);
      await setDoc(
        quizMarksRef,
        {
          quizzes: {
            [videoData.title]: correct
          }
        },
        { merge: true }
      );

      console.log("Quiz marks written successfully");

     
    } catch (err) {
      console.error('Failed to update Firestore:', err.message);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleMarkAsWatched = () => {
    generateQuiz();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-6">{videoData?.title}</h1>

      {!quiz.length && !loading && (
        <button
          onClick={handleMarkAsWatched}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Take Quiz
        </button>
      )}

      {loading && <p className="mt-4 text-yellow-400">Generating quiz... please wait.</p>}

      {quiz.length > 0 && (
        <div className="mt-6 space-y-6">
          {quiz.map((q, idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded shadow">
              <p className="font-semibold mb-2 text-black">
                {idx + 1}. {q.question || <span className="text-red-500">[No Question Text]</span>}
              </p>
              {q.options.map((opt, i) => {
                const isSelected = answers[idx] === opt;
                const isCorrect = submitted && opt === q.answer;
                const isWrong = submitted && isSelected && opt !== q.answer;

                return (
                  <label
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer 
                    ${submitted
                        ? isCorrect
                          ? 'bg-green-600'
                          : isWrong
                            ? 'bg-red-600'
                            : 'bg-slate-700'
                        : isSelected
                          ? 'bg-blue-600'
                          : 'bg-slate-700 hover:bg-slate-600'}
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={opt}
                      checked={isSelected}
                      disabled={submitted}
                      onChange={() => handleAnswer(idx, opt)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 checked:bg-blue-600"
                      style={{ accentColor: 'rgb(37 99 235)' }}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}

              {submitted && (
                <p className={`mt-2 ${answers[idx] === q.answer ? 'text-green-400' : 'text-red-400'}`}>
                  {answers[idx] === q.answer
                    ? 'Correct!'
                    : (
                      <>
                        Wrong.<br />
                        Correct answer: {q.answer}
                      </>
                    )
                  }
                </p>
              )}
            </div>
          ))}

          <div className="mt-6 flex gap-4 items-center">
            {!submitted ? (
              <button
                onClick={() => {
                  console.log("Submit button clicked");
                  handleSubmit();
                }}
                className="bg-green-600 px-5 py-2 rounded"
              >
                Submit Quiz
              </button>
            ) : (
              <>
                <p className="text-lg font-semibold text-black">
                  You scored {score} / {quiz.length}
                </p>
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
