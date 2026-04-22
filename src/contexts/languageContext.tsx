import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, translations } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.nb;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'nb',
  setLanguage: () => {},
  t: translations.nb,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('vm_lang');
    return (stored === 'en' || stored === 'nb' || stored === 'es' || stored === 'de') ? stored as Language : 'nb';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vm_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
