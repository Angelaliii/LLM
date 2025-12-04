import React from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { CheckCircle2, RotateCcw, LogOut } from 'lucide-react';
import './s5.css';

export default function S5_Reflection() {
  const { actions } = useChatStore();
  const { actions: missionActions } = useMissionStore();

  const handleRestart = () => {
    actions.goToStage("S0");
    missionActions.goToStage("S0");
  };

  const handleExit = () => {
    window.location.href = '/app';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
      </div>

      {/* 主要內容 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* 成功圖標 */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8 flex justify-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
            <CheckCircle2 size={56} className="text-white" />
          </div>
        </motion.div>

        {/* 標題 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-gray-900 mb-4"
        >
          任務完成！
        </motion.h1>

        {/* 副標題 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl text-gray-700 mb-6"
        >
          你成功修復了歷史檔案
        </motion.p>

        {/* 反思文字 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-white/40"
        >
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            通過重組這些歷史線索，你瞭解了<strong>1923年治警事件</strong>的關鍵角色與背景。
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>蔣渭水</strong>不屈的抗爭精神，在當時威權統治的高壓下，依然堅持為台灣人的權益而努力。
          </p>
        </motion.div>

        {/* 統計信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { label: '修復欄位', value: '3/3' },
            { label: '完成度', value: '100%' },
            { label: '用時', value: '即時' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/50"
            >
              <p className="text-2xl font-bold text-emerald-600 mb-1">{stat.value}</p>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* 操作按鈕 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border border-emerald-200"
          >
            <RotateCcw size={20} />
            <span>重新開始</span>
          </button>

          <button
            onClick={handleExit}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <LogOut size={20} />
            <span>離開遊戲</span>
          </button>
        </motion.div>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-sm text-gray-600 font-medium"
        >
          感謝你探索這段重要的台灣歷史 🎓
        </motion.p>
      </motion.div>
    </div>
  );
}
