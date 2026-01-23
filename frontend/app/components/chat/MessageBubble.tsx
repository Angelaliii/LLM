import React from "react";
import type { Message } from "../../types/chat";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  personaName?: string;
  avatarUrl?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  personaName = "Dialogue Character",
  avatarUrl,
}) => {
  const isUser = message.role === "user";

  // Format timestamp with error handling for different types or invalid times
  const formatTime = (timestamp?: string | number | Date) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp as any);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calculate readability display
  const getReadabilityColor = (score?: number) => {
    if (!score) return "gray";
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  const getReadabilityText = (score?: number) => {
    if (!score) return "Not Assessed";
    if (score >= 80) return "Easy to Read";
    if (score >= 60) return "Moderate";
    return "Difficult";
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 items-end gap-2`}>
      {/* NPC avatar (left side) */}
      {!isUser && avatarUrl && (
        <img
          src={avatarUrl}
          alt={personaName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      
      <div className={`max-w-[70%] ${isUser ? "order-2" : "order-1"}`}>
        {/* User name */}
        <div
          className={`flex items-center mb-2 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isUser ? "You" : personaName}
          </span>
        </div>

        {/* Message content */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
          }`}
        >
          {/* Message text */}
          <div className="prose prose-sm max-w-none">
            {message.content.split("\n").map((paragraph, idx) => (
              <p
                key={idx}
                className={`mb-2 last:mb-0 ${isUser ? "text-white" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="inline-flex items-center ml-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
