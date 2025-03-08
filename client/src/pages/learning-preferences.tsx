import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
import { Goal, Star, Book } from "lucide-react";

interface Recommendation {
  id: number;
  storyId: number;
  story: {
    title: string;
  };
  reason: string;
  priority: number;
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Turkish",
  "Swedish",
  "Russian",
];

export default function LearningPreferencesPage() {
  const { toast } = useToast();
  const [mascotMessage, setMascotMessage] = useState("Let's personalize your learning journey! 📚");

  const { data: preferences, isLoading } = useQuery<LearningPreferences>({
    queryKey: ["/api/learning-preferences"],
  });

  const form = useForm({
    resolver: zodResolver(insertLearningPreferencesSchema),
    defaultValues: {
      preferredLanguages: [],
      preferredTopics: [],
      preferredDifficulty: "beginner",
      learningGoals: [],
      dailyGoalMinutes: 30,
    },
    values: preferences,
  });

  const preferenceMutation = useMutation({
    mutationFn: async (data: LearningPreferences) => {
      const res = await apiRequest("POST", "/api/learning-preferences", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your learning preferences have been updated",
      });
      setMascotMessage("Great choices! I'll help you find the perfect content for your learning style! 🌟");
    },
    onError: (error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
      setMascotMessage("Oops! Something went wrong. Let's try again! 🔄");
    },
  });

  const { data: recommendations } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!preferences,
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Learning Preferences</h1>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Goal className="h-6 w-6" />
                Your Learning Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="preferredLanguages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages you want to learn</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange([...field.value, value]);
                              setMascotMessage("Excellent language choices! What topics interest you? 🌍");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select languages" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                  {lang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDifficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Difficulty Level</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setMascotMessage("Perfect! Let's set your daily learning goals! ⏰");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTopics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Topics</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter topics (comma-separated, e.g., travel, food, culture)"
                            value={field.value.join(", ")}
                            onChange={(e) => {
                              field.onChange(e.target.value.split(",").map((t) => t.trim()));
                              setMascotMessage("Those are interesting topics! 📚");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyGoalMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Learning Goal (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                              setMascotMessage("Setting goals is the first step to achieving them! 🎯");
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
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {recommendations && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {recommendations.map((rec) => (
                    <Card key={rec.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{rec.story.title}</h3>
                            <p className="text-sm text-muted-foreground">{rec.reason}</p>
                          </div>
                          <Button asChild variant="outline">
                            <Link href={`/story/${rec.storyId}`}>
                              <Book className="mr-2 h-4 w-4" />
                              Start Learning
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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