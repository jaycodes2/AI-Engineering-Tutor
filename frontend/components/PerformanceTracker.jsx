import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceTracker = ({ data, theme }) => {
  const totalCorrect = data.reduce((sum, item) => sum + item.correct, 0);
  const totalIncorrect = data.reduce((sum, item) => sum + item.incorrect, 0);
  const totalQuestions = totalCorrect + totalIncorrect;
  const accuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : '0.0';

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const textColor = isDark ? '#a1a1aa' : '#71717a'; // zinc-400 : zinc-500
  const gridColor = isDark ? '#27272a' : '#e4e4e7'; // zinc-800 : zinc-200

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-4">Performance by Topic</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-3xl font-bold text-green-500">{totalCorrect}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Correct</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-3xl font-bold text-red-500">{totalIncorrect}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Incorrect</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-3xl font-bold text-blue-500">{accuracy}%</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Accuracy</p>
        </div>
      </div>
      <div className="flex-grow min-h-[250px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: textColor, fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
              cursor={{ fill: 'hsla(var(--foreground), 0.1)' }}
            />
            <Legend wrapperStyle={{fontSize: "14px", color: textColor}}/>
            <Bar dataKey="correct" fill="#22c55e" name="Correct" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTracker;