import React, { useState } from "react";
import { e2Quizzes } from "../data/missions/e2-industrial-agri";
import { useMissionStore } from "../store/useMissionStore";

const QuizView: React.FC = () => {
  const { actions } = useChatStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: string, key: string) => {
    setAnswers((s) => ({ ...s, [qId]: key }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // score
    let correct = 0;
    for (const q of e2Quizzes) {
      if (answers[q.id] === q.answer) correct++;
    }
    // For now we could store result in hiddenSummary or simply finish
    actions.finishQuiz();
    alert(`分數：${correct} / ${e2Quizzes.length}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">測驗：確認熟悉度</h2>
      <div className="space-y-4 mb-4">
        {e2Quizzes.map((q) => (
          <div key={q.id} className="p-4 bg-white rounded shadow">
            <div className="font-medium mb-2">{q.stem}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt: any) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(q.id, opt.key)}
                  className={`text-left px-3 py-2 rounded border ${answers[q.id] === opt.key ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                >
                  <div className="font-medium">{opt.key}</div>
                  <div className="text-sm text-gray-600">{opt.text}</div>
                </button>
              ))}
            </div>
            {submitted && (
              <div className="mt-2 text-sm text-gray-700">
                正確答案：{q.answer} • 解說：{q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleSubmit} className="px-3 py-2 bg-blue-600 text-white rounded">提交並查看分數</button>
        <button onClick={() => actions.goToStage("S4")} className="px-3 py-2 bg-gray-200 rounded">回到整理</button>
      </div>
    </div>
  );
};

export default QuizView;
