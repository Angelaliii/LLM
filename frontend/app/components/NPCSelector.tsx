import React from "react";
import { e2Npcs } from "../data/missions/e2-industrial-agri";
import { useMissionStore } from "../store/useMissionStore";

const NPCSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentMissionId, selectedNpcId, actions } = useMissionStore();
  
  const npcs = e2Npcs.filter(npc => npc.missionId === currentMissionId);

  const handleNpcSelect = (npcId: string) => {
    actions.selectNpc(npcId);
  };

  if (!currentMissionId) {
    return <div className="p-6">請先選擇任務</div>;
  }

  return (
    <div className={compact ? "p-4" : "min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12"}>
      <div className="container-max">
        <div className={compact ? "" : "text-center mb-12"}>
          <h1 className={compact ? "text-lg font-bold mb-4" : "text-heading-1 text-dark-900 mb-4"}>
            選擇對話角色
          </h1>
          {!compact && (
            <p className="text-xl text-dark-700 max-w-2xl mx-auto">
              選擇一位歷史人物開始對話，了解他們的觀點與經歷
            </p>
          )}
        </div>

        <div className={`grid ${compact ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {npcs.map((npc) => (
            <div
              key={npc.id}
              className={`card transition-all duration-300 cursor-pointer ${
                selectedNpcId === npc.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:shadow-xl hover:-translate-y-1 bg-white'
              } ${compact ? 'p-3' : ''}`}
              onClick={() => handleNpcSelect(npc.id)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {npc.name.charAt(0)}
                </div>
                <div>
                  <h3 className={compact ? "text-base font-semibold" : "text-heading-3 text-dark-900"}>
                    {npc.name}
                  </h3>
                  <div className="text-sm text-primary-600 font-medium">
                    {npc.role}
                  </div>
                </div>
              </div>

              {!compact && (
                <>
                  <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                    {npc.persona.split('。')[0]}。
                  </p>

                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">擅長領域</div>
                    <div className="flex flex-wrap gap-1">
                      {npc.canTalkAbout.slice(0, 2).map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                className={`w-full ${
                  selectedNpcId === npc.id
                    ? 'btn-primary'
                    : 'btn-secondary'
                } ${
                  compact ? 'py-2 text-sm' : ''
                }`}
              >
                {selectedNpcId === npc.id ? '已選擇' : '選擇對話'}
              </button>
            </div>
          ))}
        </div>

        {!compact && selectedNpcId && (
          <div className="mt-12 text-center">
            <button
              onClick={() => actions.goToStage("S3")}
              className="btn-primary flex items-center gap-2 group mx-auto"
            >
              <span>開始對話</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NPCSelector;
