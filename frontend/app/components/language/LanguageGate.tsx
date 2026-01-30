import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguageSelector } from "./useLanguageSelector";
import "./language.css";

const LanguageGate: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setLanguage, dismissLanguageGate, currentLanguage } = useLanguageSelector();
  const [selectedLang, setSelectedLang] = useState<"zh-TW" | "en-US" | null>(null);

  const resolvedLang = useMemo(() => {
    // 用 hook 的 currentLanguage 已經 normalize 過
    return currentLanguage ?? (i18n.language === "en" ? "en-US" : "zh-TW");
  }, [currentLanguage, i18n.language]);

  const handleLanguageSelect = async (lang: "zh-TW" | "en-US") => {
    setSelectedLang(lang);
    await setLanguage(lang);
    console.log("[LanguageGate] Language changed to:", i18n.language);
  };

  const handleStart = () => {
    dismissLanguageGate();
  };

  const handleDismiss = () => {
    dismissLanguageGate();
  };

  return (
    <div className="language-gate-container">
      <div className="language-gate-bg"></div>

      <div className="language-gate-content">
        <div className="language-gate-header">
          <h1 className="language-gate-title">{t("languageGate.title")}</h1>
        </div>

        <div className="language-gate-buttons">
          <button
            className={`language-btn language-btn-primary ${
              resolvedLang === "zh-TW" ? "active" : ""
            }`}
            onClick={() => handleLanguageSelect("zh-TW")}
            aria-label={t("languageGate.chinese")}
          >
            <span className="language-btn-label">{t("languageGate.chinese")}</span>
            <span className="language-btn-icon">中</span>
          </button>

          <button
            className={`language-btn language-btn-secondary ${
              resolvedLang === "en-US" ? "active" : ""
            }`}
            onClick={() => handleLanguageSelect("en-US")}
            aria-label={t("languageGate.english")}
          >
            <span className="language-btn-label">{t("languageGate.english")}</span>
            <span className="language-btn-icon">En</span>
          </button>
        </div>

        <div className="language-gate-description">
          <p>{t("languageGate.description")}</p>
        </div>

        <div className="language-gate-footer">
          {selectedLang ? (
            <button
              className="language-gate-start-btn"
              onClick={handleStart}
              aria-label={t("languageGate.startButton")}
            >
              {t("languageGate.startButton")}
              <span className="ml-2">→</span>
            </button>
          ) : (
            <button
              className="language-gate-skip"
              onClick={handleDismiss}
              aria-label={t("languageGate.skipLabel")}
            >
              {t("languageGate.skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageGate;
