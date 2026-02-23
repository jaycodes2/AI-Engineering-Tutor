import React from 'react';

const FeedbackModal = ({ isCorrect, explanation, feedback, misconception, partialCredit, hintForNext, onNext }) => {
  const scoreColor = isCorrect ? '#22c55e' : partialCredit > 0 ? '#f59e0b' : '#ef4444';
  const scoreLabel = isCorrect ? 'Correct!' : partialCredit > 0 ? 'Partially Correct' : 'Incorrect';
  const scoreIcon = isCorrect ? '✓' : partialCredit > 0 ? '◑' : '✗';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .continue-btn:hover { background: #4f46e5 !important; transform: translateY(-1px); }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 50, padding: 20,
        animation: 'backdropIn 0.2s ease',
      }}>
        <div style={{
          background: '#13131f', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '32px 36px', maxWidth: 560, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          animation: 'modalIn 0.25s ease',
          fontFamily: "'DM Sans', sans-serif",
        }}>

          {/* Score header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `${scoreColor}20`,
              border: `2px solid ${scoreColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: scoreColor, fontWeight: 700, flexShrink: 0,
            }}>{scoreIcon}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: scoreColor }}>{scoreLabel}</h2>
              {partialCredit !== undefined && !isCorrect && partialCredit > 0 && (
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  Partial credit: {Math.round(partialCredit * 100)}%
                </p>
              )}
            </div>
          </div>

          {/* Misconception alert */}
          {misconception && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            }}>
              <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ⚠ Misconception Detected
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{misconception}</p>
            </div>
          )}

          {/* Explanation */}
          {explanation && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Explanation
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{explanation}</p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            }}>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{feedback}"
              </p>
            </div>
          )}

          {/* Hint for next */}
          {hintForNext && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🧠 Think about this next
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#818cf8', lineHeight: 1.6 }}>{hintForNext}</p>
            </div>
          )}

          {/* Continue button */}
          <button onClick={onNext} className="continue-btn" style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: 'rgba(99,102,241,0.9)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            Continue Learning →
          </button>
        </div>
      </div>
    </>
  );
};

export default FeedbackModal;