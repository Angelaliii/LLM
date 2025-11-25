import React, { useState, useEffect } from "react";

interface LoadingPageProps {
  error?: string | null;
  onRetry?: () => void;
  onGoBack?: () => void;
}

// Engaging loading messages with story/mission feel
const loadingMessages = [
  "時空調查員正在連線中...",
  "正在解讀歷史資料庫...",
  "穿越時空隧道中...",
  "正在載入歷史檔案...",
  "與過去建立連結中...",
];

const LoadingPage: React.FC<LoadingPageProps> = ({ error, onRetry, onGoBack }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate loading messages every 2 seconds
  useEffect(() => {
    if (error) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [error]);

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center max-w-md px-6">
          {/* Error icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            連線中斷
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "無法連接到伺服器，請稍後再試"}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重試
              </button>
            )}
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                返回主畫面
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        {/* Animated loading spinner */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text with animation */}
        <div className="min-h-[3rem]">
          <p className="text-xl text-gray-700 font-medium animate-pulse">
            {loadingMessages[messageIndex]}
          </p>
        </div>

        {/* Secondary hint */}
        <p className="mt-4 text-sm text-gray-500">
          請稍候，正在為您準備精彩的歷史故事
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
