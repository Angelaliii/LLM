import React from "react";

interface StageCompletionCardProps {
  completedStageTitle: string;
  completionNote: string;
  nextStageTitle?: string;
  nextStageDescription?: string;
  isLastStage: boolean;
  onContinue: () => void;
  onClose: () => void;
}

const StageCompletionCard: React.FC<StageCompletionCardProps> = ({
  completedStageTitle,
  completionNote,
  nextStageTitle,
  nextStageDescription,
  isLastStage,
  onContinue,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-amber-50 via-white to-primary-50 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border-4 border-amber-400 animate-scaleIn">
        {/* 裝飾性頂部 */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-primary-600 p-6 text-center">
          {/* 閃光動畫背景 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
          
          {/* 恭喜圖標 */}
          <div className="relative flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg animate-bounce">
              <svg className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          
          {/* 標題 */}
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
            🎉 恭喜破解！
          </h2>
          <p className="text-amber-100 text-lg font-medium">你成功完成了這個階段的探索</p>
        </div>

        {/* 主要內容 */}
        <div className="p-8">
          {/* 完成的關卡 */}
          <div className="mb-6 p-5 bg-white rounded-xl shadow-md border-2 border-amber-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">已完成</h3>
            </div>
            <p className="text-lg font-semibold text-primary-700 mb-2">{completedStageTitle}</p>
            <p className="text-gray-700 leading-relaxed">{completionNote}</p>
          </div>

          {/* 下一關預告 */}
          {!isLastStage && nextStageTitle && (
            <div className="mb-6 p-5 bg-gradient-to-br from-primary-50 to-amber-50 rounded-xl shadow-md border-2 border-primary-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">接下來探索</h3>
              </div>
              <p className="text-lg font-semibold text-amber-800 mb-2">{nextStageTitle}</p>
              {nextStageDescription && (
                <p className="text-gray-700 leading-relaxed">{nextStageDescription}</p>
              )}
            </div>
          )}

          {/* 最後一關提示 */}
          {isLastStage && (
            <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md border-2 border-green-400">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800">任務完成！</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                恭喜你完成了所有關卡！你已經全面理解了這段歷史。可以前往任務總結查看你的學習成果。
              </p>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold shadow-md"
            >
              留在本關
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-primary-600 text-white rounded-lg hover:from-amber-700 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLastStage ? "前往總結" : "前往下一關 →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageCompletionCard;
