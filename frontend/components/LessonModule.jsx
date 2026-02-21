import React from 'react';

const LessonModule = ({ lesson }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 sm:p-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h2>
      <p className="text-muted-foreground mb-6">An AI-generated explanation to help you grasp the concept.</p>

      <div 
        className="prose prose-quoteless prose-neutral dark:prose-invert max-w-none text-foreground text-base md:text-lg leading-relaxed selection:bg-primary/10" 
        dangerouslySetInnerHTML={{ __html: lesson.explanation.replace(/\n/g, '<br />') }} 
      />

      <div className="mt-8 border-t border-border pt-4 flex gap-6">
        <div className="flex items-center text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-sm font-medium">Video (Coming Soon)</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.879 6.121a3 3 0 014.242 0L12 7.758l1.879-1.637a3 3 0 114.242 4.242L12 14.242l-5.879-5.121a3 3 0 010-4.242z" /></svg>
          <span className="text-sm font-medium">Audio (Coming Soon)</span>
        </div>
      </div>
    </div>
  );
};

export default LessonModule;