// 開發用：清除前端儲存在 localStorage 的遊戲資料（Zustand persist keys）
import { useNotebookStore } from '../store/useNotebookStore';
import { useMissionStore } from '../store/useMissionStore';
import { useChatStore } from '../store/useChatStore';
import { useMultiChatStore } from '../store/useMultiChatStore';

export function clearGameData() {
  const knownKeys = ['notebook-store', 'mission-store', 'chat-store', 'multi-chat-store'];
  const removed: string[] = [];

  try {
    // 移除明確指定的 persist key
    knownKeys.forEach((k) => {
      if (localStorage.getItem(k) !== null) {
        localStorage.removeItem(k);
        removed.push(k);
      }
    });

    // 另外清除任何名稱中含有 "store" 的 key（防止遺漏）
    Object.keys(localStorage).forEach((k) => {
      if (/store/i.test(k) && !knownKeys.includes(k)) {
        localStorage.removeItem(k);
        removed.push(k);
      }
    });

    // 嘗試呼叫各 store 的 reset 方法（如果存在）以清除記憶體狀態
    try { useNotebookStore.getState().actions.resetNotebook(); } catch (e) { /* ignore */ }
    try { useMissionStore.getState().actions.resetMission(); } catch (e) { /* ignore */ }
    try { useChatStore.getState().actions.reset(); } catch (e) { /* ignore */ }
    try { useMultiChatStore.getState().actions.reset(); } catch (e) { /* ignore */ }

    return { success: true, removed };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error), removed };
  }
}

export default clearGameData;
