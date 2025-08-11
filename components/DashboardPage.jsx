import React, { useState, useCallback, useEffect } from 'react';
import TopicSelector from './TopicSelector.jsx';
import LessonModule from './LessonModule.jsx';
import Quiz from './Quiz.jsx';
import FeedbackModal from './FeedbackModal.jsx';
import ChatTutor from './ChatTutor.jsx';
import Spinner from './common/Spinner.jsx';
import { generateLessonAndQuiz, generateImage } from '../services/geminiService.js';

const DashboardPage = ({ 
    difficulty, 
    setPerformanceData, 
    user, 
    onUpdateUser,
    suggestedTopics,
    // Chat props
    sessions,
    activeSessionId,
    onSelectSession,
    onNewSession,
    onSendMessage,
    isLoading: isChatLoading,
    input: chatInput,
    setInput: setChatInput
}) => {
    const [currentTopic, setCurrentTopic] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const fetchLesson = useCallback(async (topic) => {
        if (!topic) return;
        setIsLoading(true);
        setIsImageLoading(true);
        setCurrentImage(null);
        setCurrentLesson(null);
        setCurrentQuiz(null);
        try {
            const data = await generateLessonAndQuiz(topic, difficulty);
            setCurrentLesson(data.lesson);
            setCurrentQuiz(data.quiz);
            
            generateImage(data.lesson.imagePrompt)
                .then(setImageUrl => setCurrentImage(setImageUrl))
                .catch(err => {
                    console.error("Image generation failed:", err);
                    setCurrentImage(null);
                })
                .finally(() => setIsImageLoading(false));

        } catch (error) {
            console.error("Failed to fetch lesson:", error);
        } finally {
            setIsLoading(false);
        }
    }, [difficulty]);

    useEffect(() => {
        if (currentTopic) {
            fetchLesson(currentTopic);
        }
    }, [difficulty, currentTopic, fetchLesson]);


    const handleSelectTopic = (topic) => {
        setCurrentTopic(topic);
    };

    const handleAnswerSubmit = (answerIndex) => {
        if (currentQuiz && currentTopic) {
            const isCorrect = answerIndex === currentQuiz.correctAnswerIndex;
            setFeedback({ isCorrect, explanation: currentQuiz.explanation });
            
            setPerformanceData(prevData =>
                prevData.map(d =>
                    d.name === currentTopic.split(' ')[0]
                        ? { ...d, [isCorrect ? 'correct' : 'incorrect']: d[isCorrect ? 'correct' : 'incorrect'] + 1 }
                        : d
                )
            );

            if (onUpdateUser) {
                if (isCorrect) {
                    onUpdateUser({ streak: (user.streak || 0) + 1 });
                } else {
                    onUpdateUser({ streak: 0 });
                }
            }
        }
    };
    
    const handleNext = () => {
        setFeedback(null);
        if (currentTopic) {
            fetchLesson(currentTopic);
        }
    };

    return (
        <main className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-2xl mx-auto">
            <div className="lg:col-span-7 xl:col-span-8">
                {!currentTopic ? (
                    <TopicSelector onSelectTopic={handleSelectTopic} isLoading={isLoading} suggestedTopics={suggestedTopics} />
                ) : isLoading ? (
                    <div className="bg-card rounded-xl border border-border p-6 min-h-[400px] flex items-center justify-center">
                       <Spinner message={`Generating ${difficulty} lesson on ${currentTopic}...`}/>
                    </div>
                ) : (
                    currentLesson && (
                        <div>
                            <LessonModule lesson={currentLesson} image={currentImage} isImageLoading={isImageLoading}/>
                            {currentQuiz && <Quiz quiz={currentQuiz} onSubmitAnswer={handleAnswerSubmit} />}
                        </div>
                    )
                )}
            </div>

            <aside className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-110px)] sticky top-[88px]">
                <ChatTutor 
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={onSelectSession}
                    onNewSession={onNewSession}
                    onSendMessage={onSendMessage}
                    isLoading={isChatLoading}
                    input={chatInput}
                    setInput={setChatInput}
                />
            </aside>
            {feedback && (
                <FeedbackModal
                    isCorrect={feedback.isCorrect}
                    explanation={feedback.explanation}
                    onNext={handleNext}
                />
            )}
        </main>
    );
};

export default DashboardPage;