import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Story } from "@shared/schema";
import AudioPlayer from "@/components/audio-player";
import { Book, Brain, Home } from "lucide-react";
import { exportStoryToPDF } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import { useLearningCelebration } from "@/hooks/use-learning-celebration";
import ConfettiBurst from "@/components/confetti-burst";
import { apiRequest, queryClient } from "@/lib/queryClient";
import VocabularyPractice from "@/components/vocabulary-practice";
import TranslationPreview from "@/components/translation-preview";

export default function StoryView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { showConfetti, celebrateProgress } = useLearningCelebration();

  const { data: story, isLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${id}`],
  });

  const completeStoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/stories/${id}/complete`, {
        timeSpent: 0, // You might want to track actual time spent
        quizScore: null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      celebrateProgress();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Story completed! Keep up the great work!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExportPDF = async () => {
    if (!story) return;

    try {
      await exportStoryToPDF(story);
      toast({
        title: "Success",
        description: "Story exported to PDF successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export story to PDF",
        variant: "destructive",
      });
    }
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

  if (!story) {
    return <div>Story not found</div>;
  }

  // Convert translations object to vocabulary items format
  const vocabularyItems = Object.entries(story.translations).map(([source, target], index) => ({
    id: index,
    sourceWord: source,
    targetWord: target,
    targetLanguage: story.sourceLanguage, // Use the story's source language for pronunciation
    context: null
  }));

  return (
    <div className="min-h-screen bg-background p-8">
      {showConfetti && <ConfettiBurst />}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">{story.title}</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full object-contain rounded-lg mb-6"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />

            <AudioPlayer url={story.audioUrl} />

            <div className="mt-6 prose max-w-none">
              <p className="text-xl">{story.content}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Translation Preview</h3>
              <TranslationPreview 
                storyId={story.id} 
                currentLanguage={story.sourceLanguage}
              />
            </div>

            <div className="mt-8 bg-accent/10 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Translations</h3>
              {Object.entries(story.translations).map(([phrase, translation]) => (
                <div key={phrase} className="mb-2">
                  <span className="font-medium">{phrase}</span>
                  <span className="mx-2">→</span>
                  <span>{translation}</span>
                </div>
              ))}
            </div>

            {/* Add Vocabulary Practice section */}
            <div className="mt-8">
              <VocabularyPractice vocabulary={vocabularyItems} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button asChild className="flex-1">
            <Link href={`/quiz/${story.id}`}>
              <Brain className="mr-2 h-4 w-4" />
              Take Quiz
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleExportPDF}>
            <Book className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            variant="default" 
            className="flex-1" 
            onClick={() => completeStoryMutation.mutate()}
            disabled={completeStoryMutation.isPending}
          >
            {completeStoryMutation.isPending ? "Completing..." : "Complete Story"}
          </Button>
        </div>
      </div>
    </div>
  );
}