import React from "react";
import { qinShiHuangPersona } from "../../services/prompts/persona.qinShihuang";
import { useChatStore } from "../../store/useChatStore";
import PersonaBadge from "../ui/PersonaBadge";

// 最簡易的其他人物資料，未來可抽成獨立檔案
const socratesPersona = {
  id: "socrates",
  name: "蘇格拉底",
  period: "古希臘",
  description: "蘇格拉底式問答的始祖，擅長透過提問引導學生自行思考與發現真理。",
  anchors: {
    timeframe: { reign: "—", birth: "469 BC", death: "399 BC" },
    keyEvents: ["倡導哲學對話", "問答法啟發學生批判思考", "受審並遭死刑"],
  },
  expertise: { primary: ["倫理學", "問答法", "辯證法"] },
};

const suShiPersona = {
  id: "su-shi",
  name: "蘇軾",
  period: "北宋",
  description: "文學家、書畫家，擅長詩詞與散文，思想兼容並蓄，風格豪邁。",
  anchors: {
    timeframe: { reign: "—", birth: "1037", death: "1101" },
    keyEvents: ["東坡詩詞創作", "被貶黃州", "書畫成就顯著"],
  },
  expertise: { primary: ["詩詞", "散文", "書畫"] },
};

const PersonaSidebar: React.FC = () => {
  const { personaId, personaStatus, actions } = useChatStore();

  const personaMap: Record<string, any> = {
    [qinShiHuangPersona.id]: qinShiHuangPersona,
    [socratesPersona.id]: socratesPersona,
    [suShiPersona.id]: suShiPersona,
  };

  const persona = personaMap[personaId] || qinShiHuangPersona;

  const otherPersonas = Object.values(personaMap).filter(
    (p) => p.id !== persona.id
  );

  const handleSwitchPersona = (id: string) => {
    // setPersona action 會自動 startNewSession
    actions.setPersona(id);
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-72 lg:w-80 p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <PersonaBadge
          personaId={persona.id}
          size="large"
          showDescription={false}
        />
      </div>

      <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        <p className="mb-2">{persona.description}</p>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>在位：{persona.anchors.timeframe?.reign}</div>
          <div>
            生卒：{persona.anchors.timeframe?.birth} -{" "}
            {persona.anchors.timeframe?.death}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          重要事件
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          {persona.anchors.keyEvents.slice(0, 6).map((e: string) => (
            <li key={e} className="truncate">
              • {e}
            </li>
          ))}
        </ul>
      </div>

      {/* 專長：與目前選中 persona 相關的內容 */}
      <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">
        <p className="mb-2">專長：</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {persona.expertise?.primary?.slice(0, 6).map((t: string) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
            >
              {t}
            </span>
          ))}
        </div>

        {/* 其他人物放在最下面 */}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          其他人物
        </h4>
        <div className="space-y-3">
          {otherPersonas.map((p: any) => {
            const status = (personaStatus && personaStatus[p.id]) || "offline";
            const isActive = p.id === persona.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSwitchPersona(p.id)}
                className={`w-full text-left flex items-center justify-between rounded-lg p-2 transition-all duration-150 ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-700 ring-1 ring-primary-300"
                    : "bg-gray-50 dark:bg-gray-700 hover:scale-[1.02] hover:shadow-sm"
                }`}
                title={`切換至 ${p.name}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center font-bold text-sm text-white">
                    {p.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {p.period}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === "online" ? "bg-green-400" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {status === "online" ? "在線" : "離線"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 已在上方顯示專長並將其他人物放在底部 */}
    </aside>
  );
};

export default PersonaSidebar;
