import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="language-selector">
      <button onClick={() => changeLanguage('zh-TW')}>{t('common.chinese')}</button>
      <button onClick={() => changeLanguage('en')}>{t('common.english')}</button>
    </div>
  );
};

export const App = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const toggleLanguageSelector = () => {
    setShowLanguageSelector((prev) => !prev);
  };

  return (
    <div className="app">
      <header>
        <h1>{t('app.title')}</h1>
        <button onClick={toggleLanguageSelector}>
          {showLanguageSelector ? t('app.hide') : t('app.show')}
        </button>
      </header>
      <main>
        <div>{t('app.welcome')}</div>
        <div>{t('app.description')}</div>
      </main>
      <footer>
        <p>{t('app.footer')}</p>
      </footer>
      {showLanguageSelector && <LanguageSelector />}
    </div>
  );
};

export default App;