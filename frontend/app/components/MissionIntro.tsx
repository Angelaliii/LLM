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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">請先選擇任務</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="container-max">
        <div className="max-w-4xl mx-auto">
          {/* 任務標題 */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              {mission.period}
            </div>
            <h1 className="text-heading-1 text-dark-900 mb-4">
              {mission.title}
            </h1>
            <p className="text-xl text-gray-600">
              {mission.mainGoal}
            </p>
          </div>

          {/* 玩家人設 */}
          <div className="card bg-white mb-8">
            <h2 className="text-heading-3 text-dark-900 mb-4">你的身份</h2>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-primary-600 mb-2">
                  {mission.playerPersona.name} - {mission.playerPersona.role}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {mission.playerPersona.backgroundStory}
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-2">主要關係人物：</div>
                <ul className="space-y-2">
                  {mission.playerPersona.relationships.map((rel, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span className="text-gray-700">{rel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 任務概覽 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">
                📚 任務結構
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-primary-700">關卡數量</span>
                  <span className="font-bold text-primary-900">{mission.stages.length} 關</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-700">預計時間</span>
                  <span className="font-bold text-primary-900">{mission.estimatedTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-700">難度</span>
                  <span className="font-bold text-primary-900">{mission.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-3">
                🎯 學習目標
              </h3>
              <ul className="space-y-2">
                {mission.learningGoals.slice(0, 3).map((goal, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-amber-500 mt-0.5">✓</span>
                    <span className="text-amber-800 text-sm">{goal}</span>
                  </li>
                ))}
                {mission.learningGoals.length > 3 && (
                  <li className="text-amber-700 text-sm italic">
                    還有 {mission.learningGoals.length - 3} 個學習目標...
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* 關卡預覽 */}
          <div className="card bg-white mb-8">
            <h2 className="text-heading-3 text-dark-900 mb-4">關卡預覽</h2>
            <div className="space-y-3">
              {mission.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{stage.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{stage.description}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {stage.type === 'explore' ? '探索' : stage.type === 'key_question' ? '關鍵問題' : '總結'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 可對話角色 */}
          <div className="card bg-white mb-8">
            <h2 className="text-heading-3 text-dark-900 mb-4">👥 可對話角色</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">👧</div>
                  <div className="font-semibold text-gray-900">小清</div>
                  <div className="text-sm text-gray-600">學生</div>
                  <div className="text-xs text-gray-500 mt-2">公學校教育、警察干預、陋習取締</div>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">👮</div>
                  <div className="font-semibold text-gray-900">佐藤 敬一</div>
                  <div className="text-sm text-gray-600">警察</div>
                  <div className="text-xs text-gray-500 mt-2">六三法、總督專制、保甲制度</div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">📐</div>
                  <div className="font-semibold text-gray-900">山本 勘助</div>
                  <div className="text-sm text-gray-600">土地測量員</div>
                  <div className="text-xs text-gray-500 mt-2">土地調查、專賣制度、財政</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                💡 提示: 進入任務後,您可以隨時切換對話角色,每個角色都有不同的知識領域和視角
              </p>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => actions.goToStage("S3")}
              className="btn-primary flex items-center gap-2 group px-8 py-3"
            >
              <span>開始任務</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            <button
              onClick={() => actions.goToStage("S0")}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
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
