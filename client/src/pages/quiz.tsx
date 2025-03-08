import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Quiz } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function QuizPage() {
  const { storyId } = useParams();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${storyId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast({
        title: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }
    setShowResults(true);
  };

  const getScore = () => {
    return quiz.questions.reduce((score, q, idx) => {
      return score + (answers[idx] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Quiz Time!</h1>

        <div className="space-y-8">
          {quiz.questions.map((question, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <p className="text-xl mb-4">{question.question}</p>
                <RadioGroup
                  value={answers[idx]}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [idx]: value }))
                  }
                  disabled={showResults}
                >
                  {question.options.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center space-x-2 p-2 rounded ${
                        showResults &&
                        option === question.correctAnswer &&
                        "bg-green-100"
                      }`}
                    >
                      <RadioGroupItem value={option} id={`${idx}-${option}`} />
                      <Label htmlFor={`${idx}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showResults ? (
          <Button onClick={handleSubmit} className="mt-8 w-full">
            Submit Answers
          </Button>
        ) : (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">
                Score: {getScore()} / {quiz.questions.length}
              </h2>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
