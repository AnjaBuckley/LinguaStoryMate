import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LanguageSelector from "./language-selector";
import { generateStorySchema, type GenerateStoryRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LearningBuddy from "./learning-buddy";

export default function StoryGenerator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mascotMessage, setMascotMessage] = useState("Let's create a new story! Choose your languages and topic. 📚");

  const form = useForm<GenerateStoryRequest>({
    resolver: zodResolver(generateStorySchema),
    defaultValues: {
      sourceLanguage: "English",
      targetLanguage: "",
      difficulty: "beginner",
      topic: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: GenerateStoryRequest) => {
      const res = await apiRequest("POST", "/api/stories/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      navigate(`/story/${data.story.id}`);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Error generating story",
        description: error.message,
        variant: "destructive",
      });
      setMascotMessage("Oops! Something went wrong. Let's try again! 🔄");
    },
  });

  const onSubmit = (data: GenerateStoryRequest) => {
    setIsGenerating(true);
    setMascotMessage("Creating your personalized story... This will be fun! ✨");
    generateMutation.mutate(data);
  };

  // Update mascot messages based on form changes
  const handleFormChange = (field: keyof GenerateStoryRequest) => {
    switch (field) {
      case "sourceLanguage":
        setMascotMessage("Great choice! What's your native language? 🌍");
        break;
      case "targetLanguage":
        setMascotMessage("Perfect! Now choose how challenging you want the story to be. 📊");
        break;
      case "difficulty":
        setMascotMessage("Almost there! What would you like the story to be about? 🎯");
        break;
      case "topic":
        setMascotMessage("That sounds interesting! Click 'Generate Story' when you're ready! 🚀");
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Story</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sourceLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language you want to learn</FormLabel>
                    <FormControl>
                      <LanguageSelector
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handleFormChange("sourceLanguage");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Tongue</FormLabel>
                    <FormControl>
                      <LanguageSelector
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handleFormChange("targetLanguage");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormChange("difficulty");
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
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a topic (e.g. animals, space, family)"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (e.target.value.length > 0) {
                          handleFormChange("topic");
                        }
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
              disabled={isGenerating}
            >
              {isGenerating ? "Generating Story..." : "Generate Story"}
            </Button>
          </form>
        </Form>
        <LearningBuddy message={mascotMessage} />
      </CardContent>
    </Card>
  );
}