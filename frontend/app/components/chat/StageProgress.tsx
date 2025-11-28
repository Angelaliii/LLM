import React, { useState } from "react";

interface Stage {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface StageProgressProps {
  currentStage: number;
  stages: Stage[];
}

const StageProgress: React.FC<StageProgressProps> = ({ currentStage, stages }) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  return (
    <div className="relative py-6 px-4">
      {/* 標題 */}
      <div className="text-center mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          任務進度
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          第 {currentStage} / {stages.length} 關
        </p>
      </div>

      {/* 進度條 */}
      <div className="relative flex items-center justify-between">
        {/* 連接線 */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` }}
        />

        {/* 關卡圓圈 */}
        {stages.map((stage, index) => {
          const stageNumber = index + 1;
          const isCompleted = stageNumber < currentStage;
          const isCurrent = stageNumber === currentStage;
          const isLocked = stageNumber > currentStage;

          return (
            <div
              key={stage.id}
              className="relative flex flex-col items-center z-10"
              onMouseEnter={() => setHoveredStage(stageNumber)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              {/* 圓圈 */}
              <div
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/50"
                      : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/50 animate-pulse"
                      : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                  }
                  ${hoveredStage === stageNumber ? "scale-110" : ""}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{stageNumber}</span>
                )}
              </div>

              {/* 標籤 */}
              <div className="absolute -bottom-8 text-center w-20">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                  {stage.title}
                </p>
              </div>

              {/* Tooltip */}
              {hoveredStage === stageNumber && (
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl max-w-xs">
                    <p className="font-semibold mb-1">{stage.title}</p>
                    <p className="text-gray-300">{stage.description}</p>
                    {/* 箭頭 */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageProgress;
