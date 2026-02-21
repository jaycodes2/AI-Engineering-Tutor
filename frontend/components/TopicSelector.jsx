import React from 'react';
import { ENGINEERING_TOPICS } from '../constants.js';

const TOPIC_META = {
  'Thermodynamics':   { icon: '🔥', desc: 'Heat, energy & entropy' },
  'Circuit Analysis': { icon: '⚡', desc: 'Voltage, current & resistance' },
  'Data Structures':  { icon: '🌲', desc: 'Arrays, trees & graphs' },
  'Fluid Mechanics':  { icon: '💧', desc: 'Flow, pressure & viscosity' },
  'Control Systems':  { icon: '🎛️', desc: 'Feedback & stability' },
  'Quantum Computing':{ icon: '⚛️', desc: 'Qubits & superposition' },
  'Machine Learning': { icon: '🧠', desc: 'Models & optimization' },
  'Signal Processing':{ icon: '📡', desc: 'Filters & transforms' },
  'Structural Analysis':{ icon: '🏗️', desc: 'Stress, strain & loads' },
  'Algorithms':       { icon: '🔢', desc: 'Sorting, searching & complexity' },
  'Materials Science':{ icon: '🔬', desc: 'Properties & microstructure' },
  'Electromagnetics': { icon: '🧲', desc: "Maxwell's equations & waves" },
};

const TopicSelector = ({ onSelectTopic, isLoading, suggestedTopics }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
      .topic-card { transition: all 0.15s ease !important; }
      .topic-card:hover { background: rgba(99,102,241,0.1) !important; border-color: rgba(99,102,241,0.35) !important; transform: translateY(-1px); }
      .topic-card:hover .t-arrow { opacity: 1 !important; transform: translateX(0) !important; }
      .sug-card:hover { background: rgba(99,102,241,0.18) !important; border-color: rgba(99,102,241,0.5) !important; }
    `}</style>
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.3)', fontSize: 18,
          }}>📚</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
              Learn
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Pick a topic for a personalized lesson + quiz
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginTop: 20 }} />
      </div>

      {/* Suggested */}
      {suggestedTopics?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            ✨ Suggested for you
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {suggestedTopics.map(topic => (
              <button key={topic} onClick={() => onSelectTopic(topic)} disabled={isLoading}
                className="sug-card"
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  border: '1px solid rgba(99,102,241,0.3)',
                  background: 'rgba(99,102,241,0.08)',
                  color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}>
                {topic}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
        </div>
      )}

      {/* All topics grid */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        All topics
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
        {ENGINEERING_TOPICS.map(topic => {
          const meta = TOPIC_META[topic] || { icon: '📘', desc: 'Engineering fundamentals' };
          return (
            <button key={topic} onClick={() => onSelectTopic(topic)} disabled={isLoading}
              className="topic-card"
              style={{
                padding: '14px 16px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{meta.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{topic}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{meta.desc}</p>
              </div>
              <span className="t-arrow" style={{
                color: '#6366f1', fontSize: 14, flexShrink: 0,
                opacity: 0, transform: 'translateX(-4px)',
                transition: 'all 0.15s ease',
              }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  </>
);

export default TopicSelector;