import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

const TRANSLATIONS = {
  en: {
    title: "Language Learning Adventures",
    settings: "User Settings",
    stories: "Your Stories",
    createStory: "Create a New Story",
    storyTopic: "Story Topic",
    enterTopic: "Enter a topic (e.g. animals, space, family)",
    generateStory: "Generate Story",
    generatingStory: "Generating Story...",
    difficultyLevel: "Difficulty Level",
    selectDifficulty: "Select difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    learnLanguage: "Language you want to learn",
    motherTongue: "Your mother tongue",
    selectLanguage: "Select language"
  },
  de: {
    title: "Sprachlern-Abenteuer",
    settings: "Benutzereinstellungen",
    stories: "Deine Geschichten",
    createStory: "Neue Geschichte erstellen",
    storyTopic: "Geschichtenthema",
    enterTopic: "Gib ein Thema ein (z.B. Tiere, Weltall, Familie)",
    generateStory: "Geschichte generieren",
    generatingStory: "Generiere Geschichte...",
    difficultyLevel: "Schwierigkeitsgrad",
    selectDifficulty: "Schwierigkeit auswählen",
    beginner: "Anfänger",
    intermediate: "Fortgeschritten",
    advanced: "Experte",
    learnLanguage: "Sprache, die du lernen möchtest",
    motherTongue: "Deine Muttersprache",
    selectLanguage: "Sprache auswählen"
  }
};

type LanguageContextType = {
  texts: typeof TRANSLATIONS['en'];
  toggleLanguage: () => void;
  currentLanguage: 'en' | 'de';
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const toggleLanguageMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const newLanguage = user.interfaceLanguage === 'en' ? 'de' : 'en';
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, {
        interfaceLanguage: newLanguage
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  });

  const currentLanguage = (user?.interfaceLanguage || 'en') as 'en' | 'de';
  const texts = TRANSLATIONS[currentLanguage];

  return (
    <LanguageContext.Provider value={{ 
      texts,
      currentLanguage,
      toggleLanguage: () => toggleLanguageMutation.mutate()
    }}>
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