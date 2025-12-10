import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'npc' | 'system';
  content: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
  npcName?: string;
}

export default function MessageBubble({ message, npcName }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-6"
      >
        <div className="flex items-center gap-2 px-5 py-3 bg-yellow-50 border border-yellow-200 rounded-full shadow-sm">
          <AlertCircle size={16} className="text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-700">{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* 大頭貼 (NPC 才顯示) */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 shadow-sm">
          <span className="text-sm font-bold text-primary-700">
            {npcName?.[0] || 'N'}
          </span>
        </div>
      )}

      {/* 訊息氣泡 */}
      <div
        className={`max-w-md lg:max-w-xl px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary-500 text-white rounded-br-sm'
            : 'bg-white text-dark-900 rounded-bl-sm border border-gray-200'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-2 opacity-70 ${
          isUser ? 'text-white' : 'text-dark-600'
        }`}>
          {message.timestamp}
        </p>
      </div>

      {/* 大頭貼 (USER 才顯示) */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700 shadow-sm">
          <span className="text-sm font-bold text-white">你</span>
        </div>
      )}
    </motion.div>
  );
}
