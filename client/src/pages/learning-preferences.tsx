import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLearningPreferencesSchema, type LearningPreferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LearningBuddy from "@/components/learning-buddy";
import { Goal, Flame } from "lucide-react";

const LANGUAGES = {
  "English": {
    welcome: "Let's personalize your learning journey! 📚",
    success: "Great choices! I'll help you learn in English! 🌟",
    error: "Oops! Something went wrong. Let's try again! 🔄",
    goalUpdate: "Setting goals is the first step to success! 🎯",
    preferences: "Learning Preferences",
    interface: "Interface Language",
    goal: "Daily Learning Goal (minutes)",
    save: "Save Preferences",
    streak: "Daily Streak",
    days: "days in a row",
    profile: "Your Learning Profile"
  },
  "Deutsch": {
    welcome: "Lass uns deine Lernreise personalisieren! 📚",
    success: "Tolle Auswahl! Ich helfe dir beim Lernen auf Deutsch! 🌟",
    error: "Ups! Etwas ist schiefgegangen. Versuchen wir es nochmal! 🔄",
    goalUpdate: "Ziele zu setzen ist der erste Schritt zum Erfolg! 🎯",
    preferences: "Lerneinstellungen",
    interface: "Oberflächensprache",
    goal: "Tägliches Lernziel (Minuten)",
    save: "Einstellungen speichern",
    streak: "Tägliche Serie",
    days: "Tage in Folge",
    profile: "Dein Lernprofil"
  },
  "Français": {
    welcome: "Personnalisons votre parcours d'apprentissage ! 📚",
    success: "Excellents choix ! Je vais vous aider à apprendre en français ! 🌟",
    error: "Oups ! Quelque chose s'est mal passé. Réessayons ! 🔄",
    goalUpdate: "Se fixer des objectifs est la première étape vers la réussite ! 🎯",
    preferences: "Préférences d'apprentissage",
    interface: "Langue de l'interface",
    goal: "Objectif quotidien (minutes)",
    save: "Enregistrer les préférences",
    streak: "Série quotidienne",
    days: "jours consécutifs",
    profile: "Votre profil d'apprentissage"
  },
  "Español": {
    welcome: "¡Personalicemos tu viaje de aprendizaje! 📚",
    success: "¡Excelentes elecciones! ¡Te ayudaré a aprender en español! 🌟",
    error: "¡Ups! Algo salió mal. ¡Intentémoslo de nuevo! 🔄",
    goalUpdate: "¡Establecer metas es el primer paso hacia el éxito! 🎯",
    preferences: "Preferencias de aprendizaje",
    interface: "Idioma de la interfaz",
    goal: "Objetivo diario (minutos)",
    save: "Guardar preferencias",
    streak: "Racha diaria",
    days: "días consecutivos",
    profile: "Tu perfil de aprendizaje"
  },
  "Italiano": {
    welcome: "Personalizziamo il tuo percorso di apprendimento! 📚",
    success: "Ottime scelte! Ti aiuterò a imparare in italiano! 🌟",
    error: "Ops! Qualcosa è andato storto. Riproviamo! 🔄",
    goalUpdate: "Stabilire obiettivi è il primo passo verso il successo! 🎯",
    preferences: "Preferenze di apprendimento",
    interface: "Lingua dell'interfaccia",
    goal: "Obiettivo giornaliero (minuti)",
    save: "Salva preferenze",
    streak: "Serie giornaliera",
    days: "giorni consecutivi",
    profile: "Il tuo profilo di apprendimento"
  }
};

export default function LearningPreferencesPage() {
  const { toast } = useToast();
  const [mascotMessage, setMascotMessage] = useState(LANGUAGES["English"].welcome);
  const [currentLanguage, setCurrentLanguage] = useState("English");

  const { data: preferences, isLoading } = useQuery<LearningPreferences>({
    queryKey: ["/api/learning-preferences"],
  });

  const form = useForm({
    resolver: zodResolver(insertLearningPreferencesSchema),
    defaultValues: {
      interfaceLanguage: "English",
      dailyGoalMinutes: 30,
    },
    values: preferences,
  });

  const preferenceMutation = useMutation({
    mutationFn: async (data: LearningPreferences) => {
      const res = await apiRequest("POST", "/api/learning-preferences", data);
      return res.json();
    },
    onSuccess: (data) => {
      const newLanguage = data.interfaceLanguage as keyof typeof LANGUAGES;
      setCurrentLanguage(newLanguage);
      toast({
        title: "Preferences saved",
        description: "Your learning preferences have been updated",
      });
      setMascotMessage(LANGUAGES[newLanguage].success);
    },
    onError: (error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
      setMascotMessage(LANGUAGES[form.getValues("interfaceLanguage")].error);
    },
  });

  const onSubmit = (data: LearningPreferences) => {
    preferenceMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8" />
          <div className="h-96 bg-muted rounded mb-8" />
        </div>
      </div>
    );
  }

  const texts = LANGUAGES[currentLanguage as keyof typeof LANGUAGES];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">{texts.preferences}</h1>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Goal className="h-6 w-6" />
                {texts.profile}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="interfaceLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{texts.interface}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setCurrentLanguage(value as keyof typeof LANGUAGES);
                            setMascotMessage(LANGUAGES[value as keyof typeof LANGUAGES].welcome);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(LANGUAGES).map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyGoalMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{texts.goal}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value);
                              setMascotMessage(LANGUAGES[currentLanguage].goalUpdate);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={preferenceMutation.isPending}
                  >
                    {texts.save}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {preferences && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  {texts.streak}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-orange-500">
                    {preferences.currentStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {texts.days}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <LearningBuddy message={mascotMessage} />
      </div>
    </div>
  );
}