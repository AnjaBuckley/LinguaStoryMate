import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StoryGenerator from "@/components/story-generator";
import { Story } from "@shared/schema";
import { Link } from "wouter";
import { ImageOff, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            Language Learning Adventures
          </h1>
          <Button asChild variant="outline">
            <Link href="/learning-preferences">
              <Settings className="mr-2 h-4 w-4" />
              Learning Preferences
            </Link>
          </Button>
        </div>

        <StoryGenerator />

        {recommendations && recommendations.length > 0 && (
          <div className="mt-12 mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <Star className="h-6 w-6 text-primary" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.id} href={`/story/${rec.storyId}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{rec.story.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{rec.reason}</p>
                      <div className="flex gap-2">
                        <span className="text-sm bg-secondary/20 px-2 py-1 rounded">
                          Priority: {rec.priority}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold mt-12 mb-6">Your Stories</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories?.map((story) => (
              <Link key={story.id} href={`/story/${story.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`hidden w-full h-32 bg-muted rounded-md flex items-center justify-center ${!story.imageUrl ? '!flex' : ''}`}>
                      <ImageOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <span className="text-sm bg-secondary/20 px-2 py-1 rounded">
                        {story.sourceLanguage} → {story.targetLanguage}
                      </span>
                      <span className="text-sm bg-accent/20 px-2 py-1 rounded">
                        {story.difficulty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}