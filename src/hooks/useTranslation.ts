import { useAppContext } from '../context/AppContext';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

const translations = { en, vi };

export function useTranslation() {
  const { state, setLanguage } = useAppContext();
  const lang = state.language || 'en';
  const dict = translations[lang] || en;

  const t = (keyPath: string, variables?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let result: any = dict;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback to English dictionary if key is missing
        let fallbackResult: any = en;
        for (const fbKey of keys) {
          if (fallbackResult && typeof fallbackResult === 'object' && fbKey in fallbackResult) {
            fallbackResult = fallbackResult[fbKey];
          } else {
            return keyPath;
          }
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result !== 'string') {
      return keyPath;
    }

    if (variables) {
      let templated = result;
      Object.entries(variables).forEach(([k, v]) => {
        templated = templated.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
      return templated;
    }

    return result;
  };

  return {
    t,
    language: lang,
    setLanguage,
  };
}
