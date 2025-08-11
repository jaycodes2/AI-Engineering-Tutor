import React from 'react';
import { Difficulty } from '../constants.js';

const TeacherControls = ({ difficulty, setDifficulty, onReset, isLoading }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Educator Controls</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Learning Difficulty
          </label>
          <div className="flex space-x-2 bg-secondary p-1 rounded-lg">
            {Object.values(Difficulty).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                disabled={isLoading}
                className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-all duration-200 disabled:opacity-50 ${
                  difficulty === level
                    ? 'bg-background text-foreground shadow-sm'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-muted-foreground mb-2">
            Manage Data
          </label>
          <button
            onClick={onReset}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-destructive/10 text-destructive-foreground border border-destructive/20 font-semibold rounded-lg hover:bg-destructive/20 transition-colors duration-200 disabled:opacity-50"
          >
            Reset Performance Data
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        Adjust settings to tailor the learning experience.
      </p>
    </div>
  );
};

export default TeacherControls;