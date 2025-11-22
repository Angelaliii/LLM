import React from "react";
import { e2Npcs } from "../../types/data/missions/e2-industrial-agri";
import { useChatStore } from "../../store/useChatStore";

interface NPCSelectorProps {
  compact?: boolean;
}

const NPCSelector: React.FC<NPCSelectorProps> = ({ compact = false }) => {
  const { actions, selectedNpcId } = useChatStore();

  const resolveAvatar = (p: any) => {
    const resolveAsset = (p: string) => {
      if (!p) return p;
      const trimmed = p.replace(/^\/+/, "");
      return `${import.meta.env.BASE_URL || "/"}${trimmed}`;
    };

    const fallback = "assets/Glashütte_icon.png";
    const raw = p.avatar ? p.avatar.replace(/^\/+/, "") : fallback;
    return raw ? resolveAsset(raw) : undefined;
  };

  if (compact) {
    return (
      <aside className="w-72 bg-white dark:bg-gray-800 rounded-lg p-4 shadow h-[calc(100vh-4rem)] overflow-y-auto" aria-label="角色選單">
        <h3 className="text-lg font-semibold mb-3">角色</h3>
        <div className="space-y-3">
          {e2Npcs.map((npc) => {
            const avatar = resolveAvatar(npc);
            const active = selectedNpcId === npc.id;
            return (
              <button
                key={npc.id}
                onClick={() => actions.selectNpc(npc.id)}
                className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors ${active ? "bg-primary-50 dark:bg-primary-700 ring-1 ring-primary-300" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                aria-pressed={active}
                aria-label={`與 ${npc.name} 對話`}
              >
                {avatar ? (
                  <img src={avatar} alt={`${npc.name} 頭像`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm">{npc.name[0]}</div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{npc.name}</div>
                  <div className="text-xs text-gray-500">{npc.role}</div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">選擇對話角色</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {e2Npcs.map((npc) => (
          <div key={npc.id} className="p-4 bg-white rounded shadow flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">{npc.name[0]}</div>
            <div className="flex-1">
              <div className="font-medium">{npc.name}</div>
              <div className="text-xs text-gray-500">{npc.role}</div>
              <div className="text-sm text-gray-600 mt-2 line-clamp-3">{npc.persona}</div>
            </div>
            <div>
              <button
                onClick={() => actions.selectNpc(npc.id)}
                className="px-3 py-2 bg-blue-600 text-white rounded"
                aria-label={`與 ${npc.name} 對話`}
              >
                與其對話
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button onClick={() => actions.goToStage("S1")} className="px-3 py-2 bg-gray-200 rounded">返回開場故事</button>
      </div>
    </div>
  );
};

export default NPCSelector;
