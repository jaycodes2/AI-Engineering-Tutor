import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons.jsx';

const FeedbackModal = ({ isCorrect, explanation, onNext }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl p-8 max-w-2xl w-full m-4 animate-slide-up-fade">
        <div className="flex items-center mb-6">
          {isCorrect ? (
            <CheckCircleIcon className="w-12 h-12 text-green-500 mr-4" />
          ) : (
            <XCircleIcon className="w-12 h-12 text-red-500 mr-4" />
          )}
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {isCorrect ? 'Correct!' : 'Not Quite...'}
            </h2>
            <p className="text-muted-foreground">
              {isCorrect ? 'Great job! You nailed it.' : "That's a common mistake. Here's why:"}
            </p>
          </div>
        </div>
        <div className="bg-secondary p-4 rounded-lg border border-border text-foreground mb-6">
          <h4 className="font-semibold mb-2 text-foreground">Explanation</h4>
          <p className="text-muted-foreground">{explanation}</p>
        </div>
        {!isCorrect && <p className="text-sm text-purple-400 mb-6 italic">"Don't worry, every attempt is a step forward in learning. Let's try to understand this together."</p>}
        <button
          onClick={onNext}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;