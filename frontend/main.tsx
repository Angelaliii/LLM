import ReactDOM from "react-dom/client";
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import App from "./App.tsx";
import "./styles/index.css";
import zhResources from "./i18n/zh.json";
import enResources from "./i18n/en.json";

// 初始化 i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhResources },
      'en-US': { translation: enResources }
    },
    lng: 'zh-TW',
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false // React 已經安全處理 XSS
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    }
  });

const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
