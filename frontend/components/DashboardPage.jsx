import React, { useState, useCallback, useEffect } from 'react';
import TopicSelector from './TopicSelector.jsx';
import LessonModule from './LessonModule.jsx';
import Quiz from './Quiz.jsx';
import FeedbackModal from './FeedbackModal.jsx';
import { generateLessonAndQuiz } from '../services/geminiService.js';

const Spinner = ({ topic, difficulty }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '2px solid rgba(99,102,241,0.15)',
      borderTop: '2px solid #6366f1',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
      Generating <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{difficulty}</strong> lesson on <strong style={{ color: '#6366f1' }}>{topic}</strong>…
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const DashboardPage = ({ difficulty, setPerformanceData, onQuizAnswer, user, onUpdateUser, suggestedTopics }) => {
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchLesson = useCallback(async (topic) => {
    if (!topic) return;
    setIsLoading(true);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    try {
      const data = await generateLessonAndQuiz(topic, difficulty);
      setCurrentLesson(data.lesson);
      setCurrentQuiz(data.quiz);
    } catch (e) {
      console.error('Failed to fetch lesson:', e);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    if (currentTopic) fetchLesson(currentTopic);
  }, [difficulty, currentTopic, fetchLesson]);

  const handleAnswerSubmit = async (answerIndex) => {
    if (!currentQuiz || !currentTopic) return;
    let result;
    if (onQuizAnswer) {
      result = await onQuizAnswer(currentTopic, currentQuiz, answerIndex, difficulty);
    } else {
      const isCorrect = answerIndex === currentQuiz.correctAnswerIndex;
      result = { isCorrect, explanation: currentQuiz.explanation };
      setPerformanceData(prev => prev.map(d =>
        d.name === currentTopic.split(' ')[0]
          ? { ...d, [isCorrect ? 'correct' : 'incorrect']: d[isCorrect ? 'correct' : 'incorrect'] + 1 }
          : d
      ));
      if (onUpdateUser) onUpdateUser({ streak: isCorrect ? (user.streak || 0) + 1 : 0 });
    }
    setFeedback({ isCorrect: result.isCorrect, explanation: result.explanation });
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentTopic) fetchLesson(currentTopic);
  };

  const handleBack = () => {
    setCurrentTopic(null);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    setFeedback(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .back-btn:hover { color: rgba(255,255,255,0.8) !important; }
      `}</style>
      <main style={{ padding: '28px 24px', maxWidth: 860, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
        {!currentTopic ? (
          <TopicSelector onSelectTopic={setCurrentTopic} isLoading={isLoading} suggestedTopics={suggestedTopics} />
        ) : isLoading ? (
          <Spinner topic={currentTopic} difficulty={difficulty} />
        ) : currentLesson && (
          <div>
            {/* Back + breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={handleBack} className="back-btn" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 5,
                padding: 0, transition: 'color 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}>
                ← Topics
              </button>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>/</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{currentTopic}</span>
              <div style={{
                marginLeft: 'auto',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 20, padding: '3px 10px',
              }}>
                <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{difficulty}</span>
              </div>
            </div>
            <LessonModule lesson={currentLesson} />
            {currentQuiz && (
              <div style={{ marginTop: 16 }}>
                <Quiz quiz={currentQuiz} onSubmitAnswer={handleAnswerSubmit} />
              </div>
            )}
          </div>
        )}
        {feedback && (
          <FeedbackModal isCorrect={feedback.isCorrect} explanation={feedback.explanation} onNext={handleNext} />
        )}
      </main>
    </>
  );
};

export default DashboardPage;