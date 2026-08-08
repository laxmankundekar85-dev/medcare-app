import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingChatButton = () => {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    // Navigates directly to your Chatbot tab/page
    navigate('/chatbot'); 
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleOpenChat}
        title="Open Medcare Assistant"
        className="flex items-center justify-center w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-teal-300 group"
        style={{
          boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
        }}
      >
        {/* Sparkle / Bot Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>

        {/* Pulsing indicator badge */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
};

export default FloatingChatButton;