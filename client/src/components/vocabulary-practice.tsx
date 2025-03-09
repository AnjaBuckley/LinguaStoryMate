import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VocabularyItem } from "@shared/schema";
import SpeechRecognitionPractice from "./speech-recognition-practice";
import { useInterfaceLanguage } from "@/hooks/use-interface-language";
import { motion } from "framer-motion";

interface VocabularyPracticeProps {
  vocabulary: VocabularyItem[];
}

export default function VocabularyPractice({ vocabulary }: VocabularyPracticeProps) {
  const { texts } = useInterfaceLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentWord = vocabulary[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
    setFeedback(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vocabulary Practice</CardTitle>
      </CardHeader>
      <CardContent>
        {currentWord && (
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{currentWord.sourceWord}</h3>
              <p className="text-lg text-muted-foreground mb-4">
                {currentWord.targetWord}
              </p>
              {currentWord.context && (
                <p className="text-sm text-muted-foreground italic">
                  Context: "{currentWord.context}"
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <SpeechRecognitionPractice
                word={currentWord.sourceWord}
                targetLanguage={currentWord.targetLanguage}
                onPronunciationFeedback={(feedback) => setFeedback(feedback)}
              />
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-muted rounded-lg"
              >
                <p>{feedback}</p>
              </motion.div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleNext}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Next word →
              </button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
