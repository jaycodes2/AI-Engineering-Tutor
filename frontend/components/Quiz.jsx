import React, { useState } from 'react';

const HINT_LABELS = {
  1: { label: 'Nudge', color: '#6366f1' },
  2: { label: 'Method', color: '#8b5cf6' },
  3: { label: 'Near Solution', color: '#f59e0b' },
  4: { label: 'Full Explanation', color: '#ef4444' },
};

const Quiz = ({ quiz, onSubmitAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);

  const handleSubmit = () => {
    if (selectedOption !== null && !submitted) {
      setSubmitted(true);
      onSubmitAnswer(selectedOption);
    }
  };

  const handleHint = async () => {
    if (hintLevel >= 4 || submitted) return;
    const nextLevel = hintLevel + 1;
    setHintLevel(nextLevel);
    setHintLoading(true);
    setCurrentHint(null);
    try {
      const { getToken } = await import('../services/auth.js');
      const token = await getToken();
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/lessons/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic: quiz.topic || 'Engineering',
          question: quiz.question,
          options: quiz.options,
          correct_index: quiz.correctAnswerIndex,
          hint_level: nextLevel,
        }),
      });
      const data = await res.json();
      setCurrentHint(data);
    } catch (e) {
      setCurrentHint({ hint: 'Think carefully about the core concept behind this question.', level: nextLevel });
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .quiz-opt:hover { border-color: rgba(99,102,241,0.4) !important; background: rgba(99,102,241,0.05) !important; }
        .sub-btn:hover:not(:disabled) { background: #4f46e5 !important; transform: translateY(-1px); }
        .hint-btn:hover:not(:disabled) { border-color: rgba(99,102,241,0.4) !important; color: rgba(255,255,255,0.7) !important; }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 28px', fontFamily: "'DM Sans',sans-serif" }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quiz</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{quiz.question}</p>
          </div>
          {!submitted && (
            <button onClick={handleHint} disabled={hintLevel >= 4 || hintLoading} className="hint-btn"
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 500,
                cursor: hintLevel >= 4 ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease',
              }}>
              💡 {hintLevel === 0 ? 'Hint' : hintLevel >= 4 ? 'No more hints' : 'More hint'}
            </button>
          )}
        </div>

        {/* Hint box */}
        {(hintLoading || currentHint) && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, animation: 'fadeSlide 0.2s ease' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: HINT_LABELS[hintLevel]?.color || '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Hint {hintLevel} — {HINT_LABELS[hintLevel]?.label}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: hintLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              {hintLoading ? 'Generating hint…' : currentHint?.hint}
            </p>
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {quiz.options.map((option, index) => {
            const sel = selectedOption === index;
            return (
              <button key={index} onClick={() => !submitted && setSelectedOption(index)}
                className={!submitted ? 'quiz-opt' : ''}
                style={{
                  padding: '13px 16px', borderRadius: 11, textAlign: 'left',
                  border: sel ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)',
                  background: sel ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  color: sel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                  fontSize: 14, fontWeight: sel ? 500 : 400,
                  cursor: submitted ? 'default' : 'pointer', transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: sel ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.15)',
                  background: sel ? '#6366f1' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: sel ? '#fff' : 'rgba(255,255,255,0.3)',
                }}>{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Hint progress bar */}
        {hintLevel > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {[1,2,3,4].map(l => (
              <div key={l} style={{ flex: 1, height: 3, borderRadius: 2, background: l <= hintLevel ? (HINT_LABELS[l]?.color) : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={selectedOption === null || submitted} className="sub-btn"
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: submitted ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.9)',
            color: submitted ? 'rgba(255,255,255,0.3)' : '#fff',
            fontSize: 14, fontWeight: 600,
            cursor: selectedOption === null || submitted ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}>
          {submitted ? '✓ Answer Submitted' : 'Submit Answer'}
        </button>
      </div>
    </>
  );
};

export default Quiz;