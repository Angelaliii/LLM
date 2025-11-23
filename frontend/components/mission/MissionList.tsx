import React from "react";
// lightweight mission list; details for missions live in src/types/data/missions
import { useChatStore } from "../../store/useChatStore";

const missions = [
  {
    id: "E2",
    title: "工業日本・農業臺灣",
    era: "日治時期",
    difficulty: "中等",
    summary: "透過調查理解殖民時期的農業政策與影響。",
  },
];

const MissionList: React.FC = () => {
  const { actions } = useChatStore();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">選擇任務</h2>
      <div className="grid grid-cols-1 gap-4">
        {missions.map((m) => (
          <div key={m.id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{m.title}</h3>
                <div className="text-sm text-gray-500">{m.era} • {m.difficulty}</div>
                <p className="text-sm mt-2 text-gray-600">{m.summary}</p>
              </div>
              <div>
                <button
                  onClick={() => actions.selectMission(m.id)}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  開始任務
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionList;
