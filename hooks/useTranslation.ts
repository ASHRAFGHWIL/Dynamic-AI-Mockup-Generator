import { useState, useEffect, useCallback } from 'react';

type Translations = Record<string, string>;
type Lang = 'en' | 'ar';

const translationsCache: { [key in Lang]?: Translations } = {};

export const useTranslation = () => {
  const [lang, setLang] = useState<Lang>('ar');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const loadTranslations = async () => {
      if (translationsCache[lang]) {
        setTranslations(translationsCache[lang]!);
      } else {
        try {
          const response = await fetch(`/i18n/${lang}.json`);
          const data = await response.json();
          translationsCache[lang] = data;
          setTranslations(data);
        } catch (error) {
          console.error(`Could not load translations for ${lang}`, error);
        }
      }
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    loadTranslations();
  }, [lang]);

  const t = useCallback((key: string, params: Record<string, string> = {}): string => {
    let translation = translations[key] || key;
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    return translation;
  }, [translations]);

  const changeLanguage = (newLang: Lang) => {
    setLang(newLang);
  };

  return { t, changeLanguage, lang };
};
