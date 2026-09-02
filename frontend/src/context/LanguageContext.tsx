import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  type LanguageCode,
  type LanguageOption,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from '../i18n/translations';

export type { LanguageCode, LanguageOption };
export { SUPPORTED_LANGUAGES };

interface LanguageContextType {
  currentLang: LanguageCode;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('petsos_lang') as LanguageCode;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  const selectedOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  const isRTL = selectedOption.dir === 'rtl';

  useEffect(() => {
    localStorage.setItem('petsos_lang', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLang, isRTL]);

  const setLang = (lang: LanguageCode) => {
    if (TRANSLATIONS[lang]) {
      localStorage.setItem('petsos_lang_manual', 'true');
      localStorage.setItem('petsos_lang', lang);
      setCurrentLangState(lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[currentLang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        lang: currentLang,
        setLang,
        t,
        isRTL,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
