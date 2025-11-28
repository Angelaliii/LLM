import React from "react";

interface KeyPoint {
  id: string;
  title: string;
  achieved: boolean;
  description?: string;
}

interface KeyPointProgressProps {
  keyPoints: KeyPoint[];
  stageTitle?: string;
}

const KeyPointProgress: React.FC<KeyPointProgressProps> = ({
  keyPoints,
  stageTitle = "本關重點",
}) => {
  const achievedCount = keyPoints.filter((kp) => kp.achieved).length;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-4 mb-4">
      {/* 標題 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-base">🎯</span>
          {stageTitle}
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {achievedCount} / {keyPoints.length}
        </span>
      </div>

      {/* 星星進度 */}
      <div className="flex items-center justify-center gap-4 mb-3">
        {keyPoints.map((keyPoint, index) => (
          <div
            key={keyPoint.id}
            className="relative flex flex-col items-center group"
          >
            {/* 星星 */}
            <div
              className={`
                transition-all duration-500 transform
                ${
                  keyPoint.achieved
                    ? "scale-110 text-yellow-400 animate-bounce"
                    : "text-gray-300 dark:text-gray-600"
                }
              `}
            >
              <svg
                className="w-10 h-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            {/* 打勾標記 */}
            {keyPoint.achieved && (
              <div className="absolute top-0 right-0 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap max-w-xs">
                <p className="font-semibold">{keyPoint.title}</p>
                {keyPoint.description && (
                  <p className="text-gray-300 mt-1">{keyPoint.description}</p>
                )}
                {/* 箭頭 */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 達成訊息列表 */}
      {keyPoints.filter((kp) => kp.achieved).length > 0 && (
        <div className="space-y-1">
          {keyPoints
            .filter((kp) => kp.achieved)
            .map((keyPoint) => (
              <div
                key={keyPoint.id}
                className="flex items-start gap-2 bg-white dark:bg-gray-800 rounded px-2 py-1.5 text-xs animate-fade-in"
              >
                <span className="text-green-500 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {keyPoint.title}
                  </span>
                  {keyPoint.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                      {keyPoint.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 鼓勵訊息 */}
      {achievedCount === 0 && (
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          開始對話探索重點吧！⭐
        </p>
      )}
      {achievedCount > 0 && achievedCount < keyPoints.length && (
        <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-medium">
          太棒了！繼續探索剩餘重點 🌟
        </p>
      )}
      {achievedCount === keyPoints.length && (
        <p className="text-xs text-center text-green-600 dark:text-green-400 font-semibold">
          🎉 完成本關所有重點！可以前往下一關了！
        </p>
      )}
    </div>
  );
};

export default KeyPointProgress;
