import React from 'react';
import PerformanceTracker from './PerformanceTracker.jsx';
import TeacherControls from './TeacherControls.jsx';

const PerformancePage = ({ performanceData, difficulty, setDifficulty, onReset, isLoading, theme }) => {
  return (
    <main className="p-4 lg:p-6 max-w-screen-xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Your Performance</h1>
            <p className="text-muted-foreground mt-1">Review your progress and adjust learning settings.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <PerformanceTracker data={performanceData} theme={theme}/>
            </div>
            <div className="lg:col-span-1">
                <TeacherControls 
                    difficulty={difficulty} 
                    setDifficulty={setDifficulty} 
                    onReset={onReset} 
                    isLoading={isLoading} 
                />
            </div>
        </div>
    </main>
  );
};
export default PerformancePage;