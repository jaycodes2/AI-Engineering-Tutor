import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Difficulty } from '../constants.js';

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14, padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: 10,
      background: `${color}18`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '2px 0', color: p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const PerformancePage = ({ performanceData, backendStats, difficulty, setDifficulty, onReset, isLoading, theme }) => {
  const totalCorrect = performanceData.reduce((s, d) => s + d.correct, 0);
  const totalIncorrect = performanceData.reduce((s, d) => s + d.incorrect, 0);
  const total = totalCorrect + totalIncorrect;
  const accuracy = total > 0 ? ((totalCorrect / total) * 100).toFixed(1) : '—';
  const hasData = total > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .diff-btn:hover { border-color: rgba(99,102,241,0.5) !important; color: rgba(255,255,255,0.9) !important; }
        .reset-btn:hover { background: rgba(239,68,68,0.15) !important; border-color: rgba(239,68,68,0.4) !important; }
      `}</style>
      <main style={{ padding: '28px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 16px rgba(99,102,241,0.3)',
            }}>📊</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>Performance</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Track your learning progress</p>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginTop: 20 }} />
        </div>

        {/* Stat cards — prefer backendStats if available */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
          <StatCard icon="💬" label="Messages Sent"   value={backendStats?.total_messages   ?? '—'} color="#6366f1" />
          <StatCard icon="📚" label="Lessons Viewed"  value={backendStats?.lessons_viewed   ?? '—'} color="#8b5cf6" />
          <StatCard icon="🧩" label="Quizzes Taken"   value={backendStats?.quizzes_attempted ?? total} color="#f59e0b" />
          <StatCard icon="🎯" label="Accuracy"
            value={backendStats ? `${backendStats.accuracy_pct}%` : (total > 0 ? `${accuracy}%` : '—')}
            color="#22c55e" />
        </div>

        {/* Topics studied */}
        {backendStats?.topics_studied?.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '16px 20px', marginBottom: 24,
          }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Topics Studied
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {backendStats.topics_studied.map(topic => (
                <span key={topic} style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  color: '#818cf8', fontSize: 12, fontWeight: 500,
                  padding: '4px 12px', borderRadius: 20,
                }}>{topic}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* Chart */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '20px 20px 12px',
          }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
              Performance by Topic
            </p>
            {!hasData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
                Complete a quiz to see your chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="correct" name="Correct" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="incorrect" name="Incorrect" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Difficulty */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '16px 18px',
            }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Difficulty
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.values(Difficulty).map(level => (
                  <button key={level} onClick={() => setDifficulty(level)} disabled={isLoading}
                    className="diff-btn"
                    style={{
                      padding: '9px 14px', borderRadius: 10,
                      border: difficulty === level
                        ? '1px solid rgba(99,102,241,0.5)'
                        : '1px solid rgba(255,255,255,0.07)',
                      background: difficulty === level ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: difficulty === level ? '#818cf8' : 'rgba(255,255,255,0.4)',
                      fontSize: 13, fontWeight: difficulty === level ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <span>{level === 'Beginner' ? '🌱' : level === 'Intermediate' ? '🌿' : '🌳'}</span>
                    {level}
                    {difficulty === level && (
                      <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '16px 18px',
            }}>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Data
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                Clear all local performance data and reset your stats.
              </p>
              <button onClick={onReset} disabled={isLoading} className="reset-btn"
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 10,
                  border: '1px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.08)',
                  color: '#f87171', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}>
                🗑️ Reset Performance Data
              </button>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default PerformancePage;