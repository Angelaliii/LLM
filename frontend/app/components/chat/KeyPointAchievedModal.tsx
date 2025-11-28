import React from "react";

interface KeyPointAchievedModalProps {
  visible: boolean;
  keyPointTitle: string;
  keyPointDescription: string;
  nextSuggestion: string;
  onContinue: () => void;
}

/**
 * 單個任務完成提示卡片
 * 當達成一個關鍵點時彈出
 */
const KeyPointAchievedModal: React.FC<KeyPointAchievedModalProps> = ({
  visible,
  keyPointTitle,
  keyPointDescription,
  nextSuggestion,
  onContinue,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* 星星動畫區域 */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 p-8 text-center">
          <div className="inline-block animate-bounce-slow">
            <svg
              className="w-24 h-24 text-yellow-400 drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">
            🎉 恭喜你！
          </h2>
        </div>

        {/* 內容區域 */}
        <div className="p-6 space-y-4">
          {/* 已完成的任務 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">
              已了解
            </p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {keyPointTitle}
            </p>
            {keyPointDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {keyPointDescription}
              </p>
            )}
          </div>

          {/* 建議下一步 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              💡 接下來你想要往...
            </p>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              「{nextSuggestion}」
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              探索，請繼續進行對話
            </p>
          </div>

          {/* 確認按鈕 */}
          <button
            onClick={onContinue}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            繼續探索
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default KeyPointAchievedModal;
