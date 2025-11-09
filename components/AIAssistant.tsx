'use client';
import { useState, useEffect } from 'react';

const suggestions = [
  "我可以为你推荐最适合的旅行路线",
  "根据你的预算，我建议选择这些热门目的地",
  "让我为你规划一个完美的行程",
  "基于你的偏好，这些地方值得一去",
  "我可以帮你优化行程，节省时间和预算"
];

export default function AIAssistant({ isGenerating }: { isGenerating: boolean }) {
  const [currentMessage, setCurrentMessage] = useState(suggestions[0]);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setShowTyping(true);
      setCurrentMessage("正在为你生成个性化行程...");
    } else {
      setShowTyping(false);
      const interval = setInterval(() => {
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setCurrentMessage(randomSuggestion);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <div className="ai-assistant">
      <div className="ai-avatar">
        <div className="ai-pulse"></div>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      </div>
      <div className="ai-message">
        <div className="ai-message-content">
          {showTyping ? (
            <>
              {currentMessage}
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </>
          ) : (
            currentMessage
          )}
        </div>
      </div>
    </div>
  );
}

