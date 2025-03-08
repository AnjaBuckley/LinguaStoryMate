import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LearningPreferences } from "@shared/schema";

export const LANGUAGES = {
  "English": {
    title: "Language Learning Adventures",
    settings: "Learning Preferences",
    stories: "Your Stories",
    difficulty: "Difficulty",
    source: "Source",
    target: "Target",
  },
  "Deutsch": {
    title: "Sprachlern-Abenteuer",
    settings: "Lerneinstellungen",
    stories: "Deine Geschichten",
    difficulty: "Schwierigkeit",
    source: "Quelle",
    target: "Ziel",
  },
  "Français": {
    title: "Aventures d'Apprentissage des Langues",
    settings: "Préférences d'apprentissage",
    stories: "Vos Histoires",
    difficulty: "Difficulté",
    source: "Source",
    target: "Cible",
  },
  "Español": {
    title: "Aventuras de Aprendizaje de Idiomas",
    settings: "Preferencias de aprendizaje",
    stories: "Tus Historias",
    difficulty: "Dificultad",
    source: "Origen",
    target: "Destino",
  },
  "Italiano": {
    title: "Avventure di Apprendimento Linguistico",
    settings: "Preferenze di apprendimento",
    stories: "Le tue Storie",
    difficulty: "Difficoltà",
    source: "Origine",
    target: "Destinazione",
  }
};

type LanguageContextType = {
  currentLanguage: keyof typeof LANGUAGES;
  texts: typeof LANGUAGES[keyof typeof LANGUAGES];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof LANGUAGES>("English");

  const { data: preferences } = useQuery<LearningPreferences>({
    queryKey: ["/api/learning-preferences"],
  });

  useEffect(() => {
    if (preferences?.interfaceLanguage) {
      setCurrentLanguage(preferences.interfaceLanguage as keyof typeof LANGUAGES);
    }
  }, [preferences]);

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        texts: LANGUAGES[currentLanguage] 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useInterfaceLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useInterfaceLanguage must be used within a LanguageProvider");
  }
  return context;
}
