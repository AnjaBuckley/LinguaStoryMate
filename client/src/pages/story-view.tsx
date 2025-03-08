import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Story } from "@shared/schema";
import AudioPlayer from "@/components/audio-player";
import { Book, Brain } from "lucide-react";
import { exportStoryToPDF } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import VocabularyGame from "@/components/vocabulary-game";

export default function StoryView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: story, isLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${id}`],
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">{story.title}</h1>

        <Card className="mb-8">
          <CardContent className="p-6">
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />

            <AudioPlayer url={story.audioUrl} />

            <div className="mt-6 prose max-w-none">
              <p className="text-xl">{story.content}</p>
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
          </CardContent>
        </Card>

        {/* Add Vocabulary Game */}
        <div className="mb-8">
          <VocabularyGame
            storyId={story.id}
            sourceLanguage={story.sourceLanguage}
            targetLanguage={story.targetLanguage}
          />
        </div>

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
        </div>
      </div>
    </div>
  );
}