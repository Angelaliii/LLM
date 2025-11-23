import React, { useState, useRef, useEffect } from 'react';
import { checkContentSafety } from '../../services/prompts/safety.guardrails';

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自動調整輸入框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setSafetyWarning(null);
    
    // 即時安全檢查
    if (e.target.value.length > 10) {
      const safetyResult = checkContentSafety(e.target.value);
      if (!safetyResult.isSafe && safetyResult.issues.some(issue => issue.severity === 'high')) {
        setSafetyWarning('您的輸入可能包含不適當的內容，請重新表達您的問題。');
      }
    }
  };

  // 處理發送
  const handleSend = () => {
    if (!input.trim() || disabled || isComposing) return;

    // 最終安全檢查
    const safetyResult = checkContentSafety(input);
    if (!safetyResult.isSafe) {
      const highSeverityIssues = safetyResult.issues.filter(issue => issue.severity === 'high');
      if (highSeverityIssues.length > 0) {
        setSafetyWarning('您的問題包含不適當的內容，讓我們換個方式討論歷史問題。');
        return;
      }
    }

    onSendMessage(input);
    setInput('');
    setSafetyWarning(null);
  };

  // 處理鍵盤事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // 建議問題
  const suggestions = [
    '你是如何統一度量衡的？',
    '郡縣制與分封制有什麼區別？',
    '長城的建造有什麼意義？',
    '秦朝的法律制度是怎樣的？'
  ];

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* 安全警告 */}
      {safetyWarning && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">{safetyWarning}</span>
          </div>
        </div>
      )}

      {/* 建議問題 */}
      {input.length === 0 && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">建議問題：</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`suggestion-${index}`}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 輸入區域 */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* 文本輸入區 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={disabled ? '正在思考中...' : '請輸入您想詢問秦始皇的問題...'}
              disabled={disabled}
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* 字數統計 */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {input.length}/500
            </div>
          </div>

          {/* 發送按鈕 */}
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim() || input.length > 500}
            className="flex-shrink-0 w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
            aria-label="發送消息"
          >
            {disabled ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* 輸入提示 */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            按 Enter 發送，Shift+Enter 換行
          </div>
          
          {/* 可讀性提示 */}
          {input.length > 50 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              建議保持問題簡潔明確
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputArea;