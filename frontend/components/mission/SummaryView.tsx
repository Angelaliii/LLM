import React from "react";
import { useChatStore } from "../../store/useChatStore";
import { e2Chunks } from "../../types/data/missions/e2-industrial-agri";

const SummaryView: React.FC = () => {
  const { hiddenSummary, actions, missionId } = useChatStore();

  // If hiddenSummary is not set, create a simple summary from core chunks
  const coreChunks = e2Chunks.filter((c) => c.type === "core_fact");
  const autoSummary = coreChunks.map((c) => c.text).join("\n\n");

  const summaryToShow = hiddenSummary || autoSummary;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">這次調查的全貌</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">{summaryToShow}</p>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => actions.startQuiz()} className="px-3 py-2 bg-blue-600 text-white rounded">我準備好接受挑戰</button>
        <button onClick={() => actions.goToStage("S3")} className="px-3 py-2 bg-gray-200 rounded">返回對話</button>
      </div>
    </div>
  );
};

export default SummaryView;
