import React, { useState } from "react";

interface Stage {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface CompactStageSidebarProps {
  currentStage: number;
  stages: Stage[];
  onStageClick?: (stageId: number) => void; // 可選的點擊回調
}

const CompactStageSidebar: React.FC<CompactStageSidebarProps> = ({
  currentStage,
  stages,
  onStageClick,
}) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  return (
    <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-1">
      {/* 標題 */}
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 writing-mode-vertical transform rotate-180 mb-3">
        任務
      </div>

      {/* 星星列表 */}
      <div className="flex-1 flex flex-col items-center justify-start space-y-2 py-2">
        {stages.map((stage, index) => {
          const stageNumber = index + 1;
          const isCompleted = stage.completed;

          return (
            <div
              key={stage.id}
              className="relative"
              onMouseEnter={() => setHoveredStage(stageNumber)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              {/* 星星圖案 */}
              <svg
                className={`
                  w-8 h-8 transition-all duration-300 cursor-pointer
                  ${hoveredStage === stageNumber ? "scale-125" : ""}
                  ${isCompleted ? "drop-shadow-lg" : ""}
                `}
                viewBox="0 0 24 24"
                fill={isCompleted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
                onClick={() => onStageClick && onStageClick(stage.id)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    isCompleted
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>

              {/* Tooltip */}
              {hoveredStage === stageNumber && (
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2 z-50 whitespace-nowrap">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                    <p className="font-semibold">{stage.title}</p>
                    <p className="text-gray-300 text-xs mt-1 max-w-xs">
                      {stage.description}
                    </p>
                    <p className="text-xs mt-1">
                      {isCompleted ? (
                        <span className="text-yellow-400">✓ 已完成</span>
                      ) : (
                        <span className="text-gray-400">未完成</span>
                      )}
                    </p>
                    {/* 箭頭 */}
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 完成進度 */}
      <div className="text-center mt-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">完成</div>
        <div className="text-lg font-bold text-yellow-500 dark:text-yellow-400">
          {stages.filter(s => s.completed).length}/{stages.length}
        </div>
      </div>
    </div>
  );
};

export default CompactStageSidebar;
