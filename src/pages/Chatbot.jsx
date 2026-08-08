import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getUserId, getCacheKey } from '../utils/user';

export default function Chatbot() {
  const userId = getUserId();
  const chatEndRef = useRef(null);

  // Read User Context to personalize AI responses
  const [profile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('user_profile_cache'))) || {};
    } catch {
      return {};
    }
  });

  const [medications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_medications'))) || [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('chat_history'))) || [
        {
          sender: 'bot',
          text: `Hello ${profile.fullName || profile.name || 'there'}! 👋 I am your Medcare Personal AI Assistant. How can I help you with your health schedule, medications, or records today?`
        }
      ];
    } catch {
      return [
        {
          sender: 'bot',
          text: 'Hello! I am your Medcare Personal AI Assistant. How can I assist you today?'
        }
      ];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(getCacheKey('chat_history'), JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const contextPayload = {
        userName: profile.fullName || profile.name || 'Patient',
        patientId: profile.patientId || '#MC8829',
        bloodGroup: profile.bloodGroup || 'Not specified',
        weight: profile.weight || 'Not specified',
        activeMedications: medications.map(m => `${m.name} (${m.dosage || 'standard dose'})`).join(', ') || 'None logged'
      };

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: textToSend,
          userContext: contextPayload
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        const errorDetail = data.error || `Server error (Status: ${response.status})`;
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: `⚠️ ${errorDetail}` }
        ]);
      }
    } catch (error) {
      console.error('Chatbot API Error:', error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `⚠️ Unable to connect to backend server at ${API_BASE_URL}. Please verify node server.js is active.` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const defaultMsg = [
      {
        sender: 'bot',
        text: `Chat history cleared. How can I help you today, ${profile.fullName || profile.name || 'Patient'}?`
      }
    ];
    setMessages(defaultMsg);
    localStorage.setItem(getCacheKey('chat_history'), JSON.stringify(defaultMsg));
  };

  const quickPrompts = [
    "What active medications am I taking?",
    "Tips for maintaining healthy blood pressure",
    "How should I prepare for my doctor visit?",
    "Remind me about hydration goals"
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28 font-sans flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-3xl shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-bold">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              Medcare Assistant <Sparkles size={16} className="text-amber-500 fill-amber-500" />
            </h2>
            <p className="text-xs text-slate-500">Personalized Medical Guide</p>
          </div>
        </div>

        <button 
          onClick={handleClearHistory}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Clear Chat History"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-teal-800'
            }`}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-teal-800 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-100 border border-slate-200/60 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 animate-pulse flex items-center gap-2">
              <span>Medcare AI is analyzing your query...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-teal-100 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center">
        <input 
          type="text" 
          placeholder="Ask anything about your health or medications..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 shadow-sm"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="absolute right-2 bg-teal-800 hover:bg-teal-900 text-white p-2.5 rounded-xl transition disabled:opacity-40 cursor-pointer"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}