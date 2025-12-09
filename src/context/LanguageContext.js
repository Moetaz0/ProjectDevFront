import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";
import { getUserFromToken } from "../utils/jwt";
import { translations, rtlLanguages } from "../i18n/translations";

export const LanguageContext = createContext({
  language: "en",
  updateLanguage: async () => {},
  loadingLanguage: true,
  t: (key, fallback) => fallback || key,
  dir: "ltr",
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [loadingLanguage, setLoadingLanguage] = useState(true);

  // Initialize language from localStorage, then user profile if logged in
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);

      const tokenUser = getUserFromToken();
      const userId = tokenUser?.userId;
      if (!userId) {
        setLoadingLanguage(false);
        return;
      }

      try {
        const res = await api.get(`/users/${userId}`);
        if (cancelled) return;
        const resolvedLanguage = res.data?.language || storedLanguage || "en";
        setLanguage(resolvedLanguage);
        localStorage.setItem("language", resolvedLanguage);
      } catch (error) {
        console.error("Failed to load user language:", error);
      } finally {
        if (!cancelled) setLoadingLanguage(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Set document direction/lang when language changes
  useEffect(() => {
    document.documentElement.lang = language || "en";
    document.documentElement.dir = rtlLanguages.includes(language)
      ? "rtl"
      : "ltr";
  }, [language]);

  // Update language locally and persist (server when authenticated)
  const updateLanguage = useCallback(async (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);

    const tokenUser = getUserFromToken();
    const userId = tokenUser?.userId;
    if (!userId) return { persisted: false };

    try {
      await api.put(`/users/${userId}`, { language: newLanguage });
      return { persisted: true };
    } catch (error) {
      console.error("Failed to persist language to server:", error);
      return { persisted: false, error };
    }
  }, []);

  const t = useCallback(
    (key, fallback) =>
      translations[language]?.[key] ?? fallback ?? translations.en[key] ?? key,
    [language]
  );

  const dir = useMemo(
    () => (rtlLanguages.includes(language) ? "rtl" : "ltr"),
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{ language, updateLanguage, loadingLanguage, t, dir }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
