import { create } from "zustand";

// UI 狀態管理
interface UIState {
  // A/B 測試變體
  variant: string;

  // 主題模式
  theme: "light" | "dark";

  // 導覽狀態
  isMobileMenuOpen: boolean;

  // Modal 狀態
  isExitIntentModalOpen: boolean;
  isFormModalOpen: boolean;

  // 表單狀態
  formData: {
    name: string;
    email: string;
    role: string;
    institution: string;
    phone?: string;
  };

  // Demo 狀態
  demoState: {
    isActive: boolean;
    messages: any[];
    isTyping: boolean;
  };

  // 滾動狀態
  scrollPosition: number;

  // 動作
  setVariant: (variant: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleMobileMenu: () => void;
  setExitIntentModal: (isOpen: boolean) => void;
  setFormModal: (isOpen: boolean) => void;
  updateFormData: (data: Partial<UIState["formData"]>) => void;
  updateDemoState: (state: Partial<UIState["demoState"]>) => void;
  setScrollPosition: (position: number) => void;
  resetFormData: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // 初始狀態
  variant: "default",
  theme: "light",
  isMobileMenuOpen: false,
  isExitIntentModalOpen: false,
  isFormModalOpen: false,
  formData: {
    name: "",
    email: "",
    role: "",
    institution: "",
    phone: "",
  },
  demoState: {
    isActive: false,
    messages: [],
    isTyping: false,
  },
  scrollPosition: 0,

  // 動作
  setVariant: (variant: string) => {
    set({ variant });

    // 同時更新 localStorage 以保持狀態
    try {
      localStorage.setItem("ui_variant", variant);
    } catch (error) {
      console.warn("Failed to save variant to localStorage:", error);
    }
  },

  setTheme: (theme: "light" | "dark") => {
    set({ theme });

    // 更新 document class
    document.documentElement.classList.toggle("dark", theme === "dark");

    try {
      localStorage.setItem("ui_theme", theme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  },

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  setExitIntentModal: (isOpen: boolean) => {
    set({ isExitIntentModalOpen: isOpen });
  },

  setFormModal: (isOpen: boolean) => {
    set({ isFormModalOpen: isOpen });
  },

  updateFormData: (data: Partial<UIState["formData"]>) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateDemoState: (state: Partial<UIState["demoState"]>) => {
    set((currentState) => ({
      demoState: { ...currentState.demoState, ...state },
    }));
  },

  setScrollPosition: (position: number) => {
    set({ scrollPosition: position });
  },

  resetFormData: () => {
    set({
      formData: {
        name: "",
        email: "",
        role: "",
        institution: "",
        phone: "",
      },
    });
  },
}));

// A/B 測試相關功能
export const initializeABTest = () => {
  // 檢查 URL 參數是否指定變體
  const urlParams = new URLSearchParams(window.location.search);
  const urlVariant = urlParams.get("variant");

  if (urlVariant) {
    useUIStore.getState().setVariant(urlVariant);
    return;
  }

  // 檢查 localStorage 是否有保存的變體
  try {
    const savedVariant = localStorage.getItem("ui_variant");
    if (savedVariant) {
      useUIStore.getState().setVariant(savedVariant);
      return;
    }
  } catch (error) {
    console.warn("Failed to read variant from localStorage:", error);
  }

  // 隨機分配變體
  const variants = ["default", "variant-a", "variant-b"];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  useUIStore.getState().setVariant(randomVariant);
};

// 主題初始化
export const initializeTheme = () => {
  try {
    const savedTheme =
      (localStorage.getItem("ui_theme") as "light" | "dark") || "light";
    useUIStore.getState().setTheme(savedTheme);
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
    useUIStore.getState().setTheme("light");
  }
};

// 滾動位置監聽
export const initializeScrollTracking = () => {
  const handleScroll = () => {
    useUIStore.getState().setScrollPosition(window.scrollY);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // 返回清理函數
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
};

// 退出意圖檢測
export const initializeExitIntent = () => {
  let hasTriggered = false;

  const handleMouseLeave = (event: MouseEvent) => {
    if (hasTriggered) return;

    // 檢查鼠標是否向頁面頂部移動（可能要關閉分頁）
    if (event.clientY <= 0) {
      hasTriggered = true;
      useUIStore.getState().setExitIntentModal(true);
    }
  };

  document.addEventListener("mouseleave", handleMouseLeave);

  // 返回清理函數
  return () => {
    document.removeEventListener("mouseleave", handleMouseLeave);
  };
};
