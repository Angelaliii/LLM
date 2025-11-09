import React, { useState } from "react";
import type { PredefinedQA } from "../../data/predefinedQA";
import {
  getQuestionsByCategory,
  predefinedQuestions,
} from "../../data/predefinedQA";

interface QuestionSelectorProps {
  onQuestionSelect: (questionId: string, questionText: string) => void;
  disabled?: boolean;
}

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  onQuestionSelect,
  disabled = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    PredefinedQA["category"] | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    PredefinedQA["difficulty"] | "all"
  >("all");

  // 篩選問題
  const getFilteredQuestions = () => {
    let questions = predefinedQuestions;

    if (selectedCategory !== "all") {
      questions = getQuestionsByCategory(selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      questions = questions.filter((q) => q.difficulty === selectedDifficulty);
    }

    return questions;
  };

  const filteredQuestions = getFilteredQuestions();

  const categoryLabels = {
    all: "全部分類",
    history: "歷史",
    politics: "政治",
    philosophy: "哲學",
    culture: "文化",
    military: "軍事",
  };

  const difficultyLabels = {
    all: "全部難度",
    beginner: "初級",
    intermediate: "中級",
    advanced: "高級",
  };

  // 獲取分類樣式
  const getCategoryStyle = (category: PredefinedQA["category"]) => {
    const styles = {
      history: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      politics:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      philosophy:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      culture:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      military: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return styles[category];
  };

  // 獲取難度樣式
  const getDifficultyStyle = (difficulty: PredefinedQA["difficulty"]) => {
    const styles = {
      beginner: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      intermediate:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return styles[difficulty];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="mb-3">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
          選擇想要詢問的問題
        </h3>

        {/* 篩選器 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* 分類篩選 */}
          <div className="flex-1 min-w-32">
            <label
              htmlFor="category-select"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              分類
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="block w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              disabled={disabled}
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 難度篩選 */}
          <div className="flex-1 min-w-32">
            <label
              htmlFor="difficulty-select"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              難度
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="block w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              disabled={disabled}
            >
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 問題列表 */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {filteredQuestions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center py-3">
            沒有符合條件的問題
          </p>
        ) : (
          filteredQuestions.map((question) => (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(question.id, question.text)}
              disabled={disabled}
              className="w-full text-left p-2.5 rounded border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-start justify-between">
                <span className="text-gray-900 dark:text-white text-xs leading-relaxed group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-1 pr-2">
                  {question.text}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(
                      question.category
                    )}`}
                  >
                    {categoryLabels[question.category]}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyStyle(
                      question.difficulty
                    )}`}
                  >
                    {difficultyLabels[question.difficulty]}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 說明文字 */}
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
        <p className="text-blue-700 dark:text-blue-300 text-xs">
          💡 選擇問題與秦始皇對話，所有問題都經過歷史考證
        </p>
      </div>
    </div>
  );
};

export default QuestionSelector;
