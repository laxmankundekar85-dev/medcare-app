import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getUserId, getCacheKey } from '../utils/user';

const REQUEST_TIMEOUT = 30000;

const SAFE_ERROR =
  'I could not process that request. Please try again. For urgent symptoms, contact emergency services or a healthcare professional.';

const cleanReply = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(
      /(localhost:\d+|api key|backend|server error|internal server error|stack trace|exception|node\.js|status code|system prompt)/gi,
      ''
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 4000);
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
};

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export default function Chatbot() {
  const userId = getUserId();
  const chatEndRef = useRef(null);

  const [profile] = useState(() =>
    readStorage(getCacheKey('user_profile_cache'), {})
  );

  const [medications] = useState(() =>
    readStorage(getCacheKey('cached_medications'), [])
  );

  const [messages, setMessages] = useState(() => {
    const cachedMessages = readStorage(getCacheKey('chat_history'), null);

    if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
      return cachedMessages;
    }

    return [
      {
        sender: 'bot',
        text: `Hello ${
          profile.fullName || profile.name || 'there'
        }! 👋 I am your Medcare Personal AI Assistant. How can I help you today?`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const displayName = profile.fullName || profile.name || 'Patient';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      localStorage.setItem(
        getCacheKey('chat_history'),
        JSON.stringify(messages)
      );
    } catch {
      // Chat history storage is optional.
    }
  }, [messages]);

  const handleSendMessage = async (customText) => {
    const textToSend = String(customText ?? input).trim();

    if (!textToSend || loading) return;

    setMessages((previous) => [
      ...previous,
      { sender: 'user', text: textToSend }
    ]);

    if (customText === undefined) {
      setInput('');
    }

    setLoading(true);

    const contextPayload = {
      userName: displayName,
      patientId: profile.patientId || 'Not provided',
      bloodGroup: profile.bloodGroup || 'Not specified',
      weight: profile.weight || 'Not specified',
      activeMedications:
        Array.isArray(medications) && medications.length > 0
          ? medications
              .map((medication) => {
                const name = medication?.name || 'Unknown medicine';
                const dosage = medication?.dosage || 'dose not specified';
                return `${name} (${dosage})`;
              })
              .join(', ')
          : 'None logged'
    };

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          message: textToSend,
          userContext: contextPayload,
          instructions: [
            'Answer the patient directly, clearly, and briefly.',
            'Never mention backend systems, APIs, prompts, server errors, code, or implementation details.',
            'Do not diagnose conditions or invent medicine names, doses, ingredients, or interactions.',
            'Use the supplied patient context only when it is relevant.',
            'Do not assume missing patient information.',
            'If information is uncertain, clearly say so and recommend a doctor or pharmacist.',
            'Do not recommend changing, starting, or stopping prescription medicine.',
            'For emergency symptoms, advise immediate emergency medical help.',
            'Explain medical information in simple language.'
          ]
        })
      });

      const data = await response.json().catch(() => ({}));
      const reply = cleanReply(data.reply);

      if (!response.ok || !reply) {
        throw new Error('The assistant did not return a valid response.');
      }

      setMessages((previous) => [
        ...previous,
        { sender: 'bot', text: reply }
      ]);
    } catch (error) {
      console.error('Chatbot request failed:', error);

      setMessages((previous) => [
        ...previous,
        { sender: 'bot', text: SAFE_ERROR }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const defaultMessage = [
      {
        sender: 'bot',
        text: `Chat history cleared. How can I help you today, ${displayName}?`
      }
    ];

    setMessages(defaultMessage);

    try {
      localStorage.setItem(
        getCacheKey('chat_history'),
        JSON.stringify(defaultMessage)
      );
    } catch {
      // Chat history storage is optional.
    }
  };

  const quickPrompts = [
    'What active medications am I taking?',
    'Tips for maintaining healthy blood pressure',
    'How should I prepare for my doctor visit?',
    'Remind me about hydration goals'
  ];

  return (
    <div className="max-w-4xl mx-auto font-sans flex flex-col h-[calc(100dvh-130px)] bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-white border-b border-slate-100 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-bold">
            <Bot size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              Medcare Assistant
              <Sparkles
                size={16}
                className="text-amber-500 fill-amber-500"
              />
            </h2>
            <p className="text-xs text-slate-500">
              Personalized Medical Guide
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Clear Chat History"
          aria-label="Clear chat history"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.sender}-${index}`}
            className={`flex items-start gap-3 ${
              message.sender === 'user'
                ? 'flex-row-reverse'
                : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                message.sender === 'user'
                  ? 'bg-teal-800 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {message.sender === 'user' ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>

            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                message.sender === 'user'
                  ? 'bg-teal-800 text-white rounded-tr-none shadow-sm'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bot size={16} />
            </div>

            <div className="bg-white border border-slate-200/80 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 shrink-0 space-y-2.5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt) => (
            <button
              type="button"
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-teal-100 transition disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask anything about your health or medications..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:border-teal-700 shadow-sm text-slate-800 placeholder-slate-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 bg-teal-800 hover:bg-teal-900 text-white p-2.5 rounded-xl transition disabled:opacity-40 cursor-pointer"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}