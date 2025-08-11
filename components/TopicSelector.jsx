import React from 'react';
import { ENGINEERING_TOPICS } from '../constants.js';
import { LightBulbIcon } from './icons.jsx';

const TopicButton = ({ topic, onClick, disabled, variant = 'primary' }) => {
    const baseClasses = "p-4 w-full rounded-lg font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring";
    
    const variants = {
        primary: "bg-secondary border-border text-foreground hover:bg-muted",
        suggested: "bg-card border-blue-500/50 text-foreground hover:bg-blue-500/10"
    };

    return (
        <button
            onClick={() => onClick(topic)}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]}`}
        >
            {topic}
        </button>
    );
};


const TopicSelector = ({ onSelectTopic, isLoading, suggestedTopics }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 sm:p-8 text-center shadow-sm animate-fade-in">
      <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <LightBulbIcon className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Your Learning Journey!</h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Select a topic below to begin your personalized lesson, or choose from our suggestions tailored for you.</p>
      
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div className="mb-10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Suggested For You</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedTopics.map((topic) => (
                   <TopicButton 
                       key={topic} 
                       topic={topic}
                       onClick={onSelectTopic} 
                       disabled={isLoading} 
                       variant="suggested"
                   />
                ))}
            </div>
            <div className="my-8 border-t border-border/50"></div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-4">All Topics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ENGINEERING_TOPICS.map((topic) => (
            <TopicButton 
                key={topic} 
                topic={topic}
                onClick={onSelectTopic} 
                disabled={isLoading}
            />
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;