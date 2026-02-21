/**
 * API Service — all LLM calls go through the FastAPI backend.
 * Chat uses Server-Sent Events (streaming) for real-time token delivery.
 */
import { auth } from './auth.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch(path, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(Array.isArray(err.detail) ? JSON.stringify(err.detail) : err.detail || `API error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function normaliseHistory(history) {
  return (history || []).map(msg => ({
    role: msg.role,
    text: msg.text || (msg.parts && msg.parts[0]?.text) || '',
  }));
}

// ── Streaming chat ────────────────────────────────────────────────────────────

/**
 * Send a message and stream the response token by token.
 * @param {Array} history
 * @param {string} newMessage
 * @param {Function} onToken - called with each token string as it arrives
 * @param {string|null} sessionId
 * @returns {Promise<string>} full response text
 */
export const sendMessageToTutor = async (history, newMessage, onToken, sessionId = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();

  const res = await fetch(`${BASE_URL}/api/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      history: normaliseHistory(history),
      message: newMessage,
      session_id: sessionId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }

  // Read SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.error) throw new Error(data.error);
        if (data.done) break;
        if (data.token) {
          fullText += data.token;
          if (onToken) onToken(data.token);
        }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') {
          throw e;
        }
      }
    }
  }

  return fullText;
};

export const generateTitleAndSuggestions = async (history) => {
  return apiFetch('/api/chat/title', {
    method: 'POST',
    body: JSON.stringify({ history: normaliseHistory(history) }),
  });
};

// ── Lessons & Quizzes ─────────────────────────────────────────────────────────

export const generateLessonAndQuiz = async (topic, difficulty) => {
  const data = await apiFetch('/api/lessons/generate', {
    method: 'POST',
    body: JSON.stringify({ topic, difficulty }),
  });
  return {
    lesson: {
      title: data.lesson.title,
      explanation: data.lesson.explanation,
      imagePrompt: data.lesson.image_prompt,
    },
    quiz: {
      question: data.quiz.question,
      options: data.quiz.options,
      correctAnswerIndex: data.quiz.correct_answer_index,
      explanation: data.quiz.explanation,
    },
  };
};

export const submitQuizAnswer = async (submission) => {
  return apiFetch('/api/lessons/quiz/submit', {
    method: 'POST',
    body: JSON.stringify(submission),
  });
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export const recordEvent = async (eventType, extra = {}) => {
  try {
    await apiFetch('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, ...extra }),
    });
  } catch (e) {
    console.warn('Analytics event failed:', e.message);
  }
};

export const getUserStats = async () => {
  return apiFetch('/api/analytics/stats');
};