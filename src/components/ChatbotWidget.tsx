"use client";

import React, { useState } from "react";

export const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-[10000]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        💬
      </button>

      {/* Chatbot iframe */}
      {open && (
        <iframe
          src="https://www.orchids.app/projects/ef7a2c1a-9229-4040-8874-2eab7e7b4215"
          title="SmartSupport AI Chatbot"
          className="fixed bottom-20 right-5 w-[400px] h-[600px] rounded-xl shadow-xl border-0 z-[9999]"
        />
      )}
    </div>
  );
};

export default ChatbotWidget;