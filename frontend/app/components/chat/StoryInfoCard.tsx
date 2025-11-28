import React, { useState } from "react";

interface StoryInfoCardProps {
  visible: boolean;
  onClose: () => void;
}

const StoryInfoCard: React.FC<StoryInfoCardProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* 卡片內容 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* 頭部圖片區 */}
          <div className="relative h-48 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800">
            {/* 使用背景色和文字代替圖片 */}
            <div className="w-full h-full flex items-center justify-center bg-[#D2B48C] relative overflow-hidden">
              {/* 裝飾性元素 */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">🏛️</div>
                <div className="absolute top-8 right-8 text-4xl">📜</div>
                <div className="absolute bottom-4 left-1/4 text-3xl">🗺️</div>
              </div>
              <div className="relative z-10 text-center">
                <div className="text-8xl mb-2">1905</div>
                <div className="text-2xl font-bold text-gray-700">臺南街景</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <div className="inline-block px-3 py-1 bg-amber-700 text-white text-xs font-semibold rounded-full mb-2">
                1905 年
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">臺南：六三法下的權力與土地</h2>
            </div>
          </div>

          {/* 內容區 */}
          <div className="p-6 space-y-4">
            {/* 你的身分 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">👤</div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    你的身分
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    總督府基層文官
                  </p>
                </div>
              </div>
            </div>

            {/* 故事背景 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-lg">📖</span>
                故事背景
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                1905年的臺南，日本殖民統治已經進入第十年。作為總督府的基層文官，你親眼目睹了殖民體制如何透過法律、警察和土地制度，牢牢掌控這片土地。
              </p>
            </div>

            {/* 任務目標 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                任務目標
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>了解《法律第六十三號》（六三法）賦予總督的權力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>探討警察政治如何控制台灣社會</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>理解土地調查與專賣制度的影響</span>
                </li>
              </ul>
            </div>

            {/* 關閉按鈕 */}
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                開始探索
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryInfoCard;
