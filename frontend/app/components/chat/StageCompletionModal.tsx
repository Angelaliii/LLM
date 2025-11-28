import React from "react";

interface StageCompletionModalProps {
  visible: boolean;
  stageName: string;
  achievedPoints: string[];
  onContinue: () => void;
  onReview: () => void;
}

const StageCompletionModal: React.FC<StageCompletionModalProps> = ({
  visible,
  stageName,
  achievedPoints,
  onContinue,
  onReview,
}) => {
  if (!visible) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
        {/* 卡片內容 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-bounce-in">
          {/* 慶祝動畫區 */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-center relative overflow-hidden">
            {/* 裝飾性元素 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-4 text-4xl animate-pulse">🎉</div>
              <div className="absolute top-4 right-8 text-3xl animate-bounce">⭐</div>
              <div className="absolute bottom-4 left-8 text-2xl animate-pulse">✨</div>
              <div className="absolute bottom-2 right-4 text-3xl animate-bounce">🌟</div>
            </div>

            {/* 主要內容 */}
            <div className="relative z-10">
              <div className="text-6xl mb-3">🎊</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                恭喜完成！
              </h2>
              <p className="text-white text-opacity-90">
                {stageName}
              </p>
            </div>
          </div>

          {/* 達成內容 */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span>✓</span>
              您已掌握以下重點：
            </h3>

            <div className="space-y-2 mb-6">
              {achievedPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2"
                >
                  <span className="text-green-500 text-lg">⭐</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* 鼓勵文字 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                💡 太棒了！您已經完成本關卡的學習目標。<br />
                準備好進入下一個挑戰了嗎？
              </p>
            </div>

            {/* 按鈕 */}
            <div className="flex gap-3">
              <button
                onClick={onReview}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                複習對話
              </button>
              <button
                onClick={onContinue}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors font-medium shadow-lg"
              >
                前往下一關 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StageCompletionModal;
