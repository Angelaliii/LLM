import React, { useEffect } from "react";
import { useMissionStore } from "../store/useMissionStore";
import { getMissionById } from "../data/missions";

const MissionIntro: React.FC = () => {
  const { currentMissionId, actions } = useMissionStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;

  useEffect(() => {
    // 當進入任務介紹頁面時，初始化任務狀態
    if (currentMissionId && mission) {
      actions.initializeMission(currentMissionId);
    }
  }, [currentMissionId, mission, actions]);

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">請先選擇任務</p>
          <p className="text-sm text-gray-500 mb-6">
            {currentMissionId ? `無法找到任務: ${currentMissionId}` : '未選擇任何任務'}
          </p>
          <button
            onClick={() => actions.goToStage("S0")}
            className="btn-primary"
          >
            返回任務列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-primary-50 py-12">
      <div className="container-max">
        <div className="max-w-5xl mx-auto">
          {/* 頂部大標題區 - 無小標題 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-dark-900 mb-6 tracking-tight">
              {mission.title}
            </h1>
            <p className="text-xl text-dark-700 leading-relaxed max-w-3xl mx-auto">
              1905 年的臺南，殖民統治的序幕正在拉開。你是新任的基層文官，即將見證並參與這場權力的佈局...
            </p>
          </div>

          {/* 玩家身份區塊 - 含角色圖片 */}
          <div className="card bg-white mb-10 overflow-hidden border border-gray-200 shadow-lg">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* 左側：角色圖片 */}
              <div className="md:col-span-1 flex justify-center p-4">
                <div className="relative w-48 h-48">
                  <img 
                    src="/assets/images/main_character.png" 
                    alt="鈴木先生" 
                    className="w-full h-full object-cover rounded-full border-4 border-primary-200 shadow-lg"
                  />
                </div>
              </div>
              
              {/* 右側：文字描述 */}
              <div className="md:col-span-2 space-y-4 p-4">
                <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-2">
                  你的身份
                </div>
                <h2 className="text-3xl font-bold text-dark-900 mb-4">
                  鈴木先生
                </h2>
                <p className="text-lg text-dark-700 leading-relaxed">
                  <span className="font-semibold text-primary-600">臺灣總督府基層文官（地方輔佐官）</span>
                  <br/><br/>
                  你於 1905 年剛被派任到臺灣，協助臺南地區的民政事務。雖然你階級不高，但深知總督府的權力來自《法律第六十三號》（六三法）。你的任務是確保殖民地的基層制度順利運作，並讓臺地財源穩定，以實現殖民地『自負盈虧』的目標。
                </p>
              </div>
            </div>
          </div>

          {/* 主要關係人物區塊 - 卡片式設計 */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-dark-900 mb-6 text-center">主要關係人物</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* NPC 1: 小清 */}
              <div className="card bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img 
                      src="/assets/images/student.png" 
                      alt="小清" 
                      className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 shadow-md mx-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">小清</h3>
                  <p className="text-sm font-semibold text-primary-600 mb-3">公學校學生</p>
                  <p className="text-sm text-dark-700 leading-relaxed">
                    你在視察學校時認識的臺灣學生,聰明但對新制度感到困惑。
                  </p>
                </div>
              </div>

              {/* NPC 2: 佐藤敬一 */}
              <div className="card bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img 
                      src="/assets/images/police.png" 
                      alt="佐藤敬一" 
                      className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 shadow-md mx-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">佐藤 敬一</h3>
                  <p className="text-sm font-semibold text-primary-600 mb-3">日本警察</p>
                  <p className="text-sm text-dark-700 leading-relaxed">
                    你的同事,負責地方治安的執行者。
                  </p>
                </div>
              </div>

              {/* NPC 3: 山本勘助 */}
              <div className="card bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img 
                      src="/assets/images/Cadastral_surveyor.png" 
                      alt="山本勘助" 
                      className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 shadow-md mx-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">山本 勘助</h3>
                  <p className="text-sm font-semibold text-primary-600 mb-3">土地測量員</p>
                  <p className="text-sm text-dark-700 leading-relaxed">
                    技術專家,負責土地調查與測量工作。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 任務目標區塊 - 謎團式呈現 */}
          <div className="card bg-white border border-gray-200 mb-10">
            <h2 className="text-3xl font-bold text-dark-900 mb-6 text-center">你的任務</h2>
            <div className="space-y-4">
              {/* 謎團一 */}
              <div className="bg-primary-50 rounded-lg p-5 border-l-4 border-primary-500 hover:bg-primary-100 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-900 mb-2">權力的來源</h3>
                    <p className="text-dark-700 leading-relaxed">
                      總督大人憑什麼能集大權於一身？你必須探尋那把賦予他絕對權力的鑰匙，以及這套統治哲學背後的真正目的。
                    </p>
                  </div>
                </div>
              </div>

              {/* 謎團二 */}
              <div className="bg-primary-50 rounded-lg p-5 border-l-4 border-primary-500 hover:bg-primary-100 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-900 mb-2">社會的觸手</h3>
                    <p className="text-dark-700 leading-relaxed">
                      中央的權力再大，若無法深入地方，終將崩塌。你必須搞清楚，總督府是如何用一雙無所不在的『手』，控制著臺灣最基層的社會角落。
                    </p>
                  </div>
                </div>
              </div>

              {/* 謎團三 */}
              <div className="bg-primary-50 rounded-lg p-5 border-l-4 border-primary-500 hover:bg-primary-100 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-900 mb-2">財富的秘密</h3>
                    <p className="text-dark-700 leading-relaxed">
                      要讓臺灣『自負盈虧』，不能再向本土伸手。你必須找到兩把打開財源的鑰匙：一個與土地有關，另一個與壟斷經營有關。財源穩定後，政府更透過交通與金融基礎建設，為殖民體系打下堅固的基石。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 互動按鈕 */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => actions.goToStage("S2")}
              className="btn-primary flex items-center gap-3 group px-10 py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span>開始任務</span>
              <span className="group-hover:translate-x-2 transition-transform text-xl">
                →
              </span>
            </button>

            <button
              onClick={() => actions.goToStage("S0")}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-dark-700 border border-gray-300 rounded-lg transition-all duration-300 font-semibold hover:shadow-md"
            >
              返回任務列表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionIntro;
