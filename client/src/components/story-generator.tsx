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
import { generateStorySchema, type GenerateStoryRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useInterfaceLanguage } from "@/hooks/use-interface-language";
import LearningBuddy from "./learning-buddy";

export default function StoryGenerator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { texts } = useInterfaceLanguage();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{texts.createStory}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{texts.difficultyLevel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={texts.selectDifficulty} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">{texts.beginner}</SelectItem>
                      <SelectItem value="intermediate">{texts.intermediate}</SelectItem>
                      <SelectItem value="advanced">{texts.advanced}</SelectItem>
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
                  <FormLabel>{texts.storyTopic}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={texts.enterTopic}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (e.target.value.length > 0) {
                          setMascotMessage("That sounds interesting! Click 'Generate Story' when you're ready! 🚀");
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
              {isGenerating ? texts.generatingStory : texts.generateStory}
            </Button>
          </form>
        </Form>
        <LearningBuddy message={mascotMessage} />
      </CardContent>
    </Card>
  );
}