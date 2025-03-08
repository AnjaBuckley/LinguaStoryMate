import { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LearningPreferences } from "@shared/schema";

export const LANGUAGES = {
  "English": {
    title: "Language Learning Adventures",
    settings: "Learning Preferences",
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
  "Deutsch": {
    title: "Sprachlern-Abenteuer",
    settings: "Lerneinstellungen",
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
  },
  "Français": {
    title: "Aventures d'Apprentissage des Langues",
    settings: "Préférences d'apprentissage",
    stories: "Vos Histoires",
    createStory: "Créer une nouvelle histoire",
    storyTopic: "Thème de l'histoire",
    enterTopic: "Entrez un thème (ex: animaux, espace, famille)",
    generateStory: "Générer l'histoire",
    generatingStory: "Génération de l'histoire...",
    difficultyLevel: "Niveau de difficulté",
    selectDifficulty: "Sélectionnez la difficulté",
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    learnLanguage: "Langue que vous souhaitez apprendre",
    motherTongue: "Votre langue maternelle",
    selectLanguage: "Sélectionner la langue"
  },
  "Español": {
    title: "Aventuras de Aprendizaje de Idiomas",
    settings: "Preferencias de aprendizaje",
    stories: "Tus Historias",
    createStory: "Crear nueva historia",
    storyTopic: "Tema de la historia",
    enterTopic: "Ingresa un tema (ej: animales, espacio, familia)",
    generateStory: "Generar historia",
    generatingStory: "Generando historia...",
    difficultyLevel: "Nivel de dificultad",
    selectDifficulty: "Seleccionar dificultad",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    learnLanguage: "Idioma que quieres aprender",
    motherTongue: "Tu lengua materna",
    selectLanguage: "Seleccionar idioma"
  },
  "Italiano": {
    title: "Avventure di Apprendimento Linguistico",
    settings: "Preferenze di apprendimento",
    stories: "Le tue Storie",
    createStory: "Crea una nuova storia",
    storyTopic: "Tema della storia",
    enterTopic: "Inserisci un tema (es: animali, spazio, famiglia)",
    generateStory: "Genera storia",
    generatingStory: "Generazione della storia...",
    difficultyLevel: "Livello di difficoltà",
    selectDifficulty: "Seleziona difficoltà",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzato",
    learnLanguage: "Lingua che vuoi imparare",
    motherTongue: "La tua lingua madre",
    selectLanguage: "Seleziona lingua"
  }
};

type LanguageKey = keyof typeof LANGUAGES;

type LanguageContextType = {
  texts: typeof LANGUAGES[LanguageKey];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: preferences } = useQuery<LearningPreferences>({
    queryKey: ["/api/learning-preferences"],
    refetchInterval: 0
  });

  const languageKey = (preferences?.interfaceLanguage || "English") as LanguageKey;
  const texts = LANGUAGES[languageKey];

  return (
    <LanguageContext.Provider value={{ texts }}>
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