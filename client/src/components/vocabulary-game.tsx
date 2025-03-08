import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Game, VocabularyItem } from "@shared/schema";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import LearningBuddy from "./learning-buddy";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface VocabularyGameProps {
  storyId: number;
  sourceLanguage: string;
  targetLanguage: string;
}

export default function VocabularyGame({ storyId, sourceLanguage, targetLanguage }: VocabularyGameProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [words, setWords] = useState<Array<{ source: string; target: string }>>([]);
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  useEffect(() => {
    // Fetch vocabulary items for the story
    fetch(`/api/vocabulary/${storyId}`)
      .then((res) => res.json())
      .then((data: VocabularyItem[]) => {
        setWords(
          data.map((item) => ({
            source: item.sourceWord,
            target: item.targetWord,
          }))
        );
      })
      .catch((error) => {
        console.error("Failed to fetch vocabulary:", error);
        toast({
          title: "Error",
          description: "Failed to load vocabulary game",
          variant: "destructive",
        });
      });
  }, [storyId]);

  const checkMatch = () => {
    if (!selectedSource || !selectedTarget) return;

    const pair = words.find(
      (w) => w.source === selectedSource && w.target === selectedTarget
    );

    if (pair) {
      setMatchedPairs(new Set([...matchedPairs, selectedSource]));
      playSound("correct");
      toast({
        title: "Correct!",
        description: "You found a match!",
      });
    } else {
      playSound("incorrect");
      toast({
        title: "Try again",
        description: "These words don't match",
        variant: "destructive",
      });
    }

    setSelectedSource(null);
    setSelectedTarget(null);
  };

  useEffect(() => {
    if (selectedSource && selectedTarget) {
      checkMatch();
    }
  }, [selectedSource, selectedTarget]);

  if (words.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            Vocabulary Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading game...</p>
        </CardContent>
      </Card>
    );
  }

  const isGameComplete = matchedPairs.size === words.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" />
          Match the Words
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGameComplete ? (
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-4">
              Congratulations! 🎉
            </h3>
            <p className="mb-4">You've matched all the words correctly!</p>
            <Button onClick={() => {
              playSound("celebration");
              window.location.reload();
            }}>
              Play Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium mb-4">{sourceLanguage}</h3>
              {words.map((word) => (
                <Button
                  key={word.source}
                  variant={selectedSource === word.source ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    matchedPairs.has(word.source) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    playSound("click");
                    setSelectedSource(word.source);
                  }}
                  disabled={matchedPairs.has(word.source)}
                >
                  {word.source}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium mb-4">{targetLanguage}</h3>
              {words
                .map((word) => word.target)
                .sort(() => Math.random() - 0.5)
                .map((target) => (
                  <Button
                    key={target}
                    variant={selectedTarget === target ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      words.some(
                        (w) => w.target === target && matchedPairs.has(w.source)
                      ) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      playSound("click");
                      setSelectedTarget(target);
                    }}
                    disabled={words.some(
                      (w) => w.target === target && matchedPairs.has(w.source)
                    )}
                  >
                    {target}
                  </Button>
                ))}
            </div>
          </div>
        )}
        {isGameComplete && (
          <LearningBuddy
            showCelebration={true}
          />
        )}
      </CardContent>
    </Card>
  );
}