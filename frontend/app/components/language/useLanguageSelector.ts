import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMissionStore } from "../../store/useMissionStore";

type LanguageCode = "zh-TW" | "en-US";

const SESSION_SELECTED_KEY = "language_gate_selected_once";

const normalizeLanguage = (lang?: string): LanguageCode => {
  if (!lang) return "zh-TW";
  // i18n 有時會回 en / zh-TW / en-US
  if (lang === "en" || lang === "en-US") return "en-US";
  return "zh-TW";
};

export const useLanguageSelector = () => {
  const { i18n } = useTranslation();
  const { isLanguageGateShown, actions } = useMissionStore();
  const [isLoading, setIsLoading] = useState(true);

  // 防 dev StrictMode / 重新 mount 造成初始化重跑
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initializeLanguage = async () => {
      console.log("[useLanguageSelector] Starting initialization...");
      setIsLoading(true);

      try {
        // 規則：每次進入都顯示語言 Gate
        actions.setLanguageGateShown(true);
        console.log("[useLanguageSelector] Always showing language gate");

        // 預設用中文顯示 Gate，但只在「本次 session 還沒選過」才強制設中文
        const hasSelectedInThisSession =
          sessionStorage.getItem(SESSION_SELECTED_KEY) === "1";

        if (!hasSelectedInThisSession) {
          const target: LanguageCode = "zh-TW";
          await i18n.changeLanguage(target);
          console.log("[useLanguageSelector] Language initialized to:", target);
        } else {
          console.log(
            "[useLanguageSelector] Skip forcing default language (already selected this session)"
          );
        }
      } catch (error) {
        console.error("[useLanguageSelector] Error initializing language:", error);
        // fallback 到中文 + 仍顯示 gate
        try {
          await i18n.changeLanguage("zh-TW");
        } catch {}
        actions.setLanguageGateShown(true);
      } finally {
        console.log(
          "[useLanguageSelector] Initialization complete, setting isLoading to false"
        );
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n, actions]);

  const setLanguage = useCallback(
    async (lang: LanguageCode) => {
      try {
        console.log("[useLanguageSelector] setLanguage called with:", lang);
        console.log(
          "[useLanguageSelector] Current language before change:",
          i18n.language
        );

        // 標記本次 session 已選過，避免初始化流程蓋回 zh-TW
        sessionStorage.setItem(SESSION_SELECTED_KEY, "1");

        await i18n.changeLanguage(lang);
        console.log(
          "[useLanguageSelector] Current language after change:",
          i18n.language
        );

        // 如果你想保留「上次選擇」給別處使用，可以留著；
        // 但你的規則是每次仍顯示 gate，所以這不會影響 gate 是否顯示
        localStorage.setItem("language", lang);
      } catch (error) {
        console.error("[useLanguageSelector] Error setting language:", error);
      }
    },
    [i18n]
  );

  const getCurrentLanguage = useCallback((): LanguageCode => {
    return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  }, [i18n.resolvedLanguage, i18n.language]);

  const dismissLanguageGate = useCallback(() => {
    actions.setLanguageGateShown(false);
  }, [actions]);

  return {
    isLanguageGateShown,
    isLoading,
    setLanguage,
    getCurrentLanguage,
    dismissLanguageGate,
    currentLanguage: normalizeLanguage(i18n.resolvedLanguage ?? i18n.language),
  };
};
