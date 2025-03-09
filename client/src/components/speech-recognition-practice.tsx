import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Volume2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SpeechRecognitionPracticeProps {
  word: string;
  targetLanguage: string;
  onPronunciationFeedback?: (feedback: string) => void;
}

export default function SpeechRecognitionPractice({ 
  word, 
  targetLanguage,
  onPronunciationFeedback 
}: SpeechRecognitionPracticeProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  
  // Speech recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = targetLanguage;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      checkPronunciationMutation.mutate({ 
        spoken: transcript,
        target: word,
        language: targetLanguage
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "There was an error with speech recognition. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, [targetLanguage, word]);

  // Pronunciation check mutation
  const checkPronunciationMutation = useMutation({
    mutationFn: async (data: { spoken: string; target: string; language: string }) => {
      const res = await apiRequest("POST", "/api/check-pronunciation", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (onPronunciationFeedback) {
        onPronunciationFeedback(data.feedback);
      }
      toast({
        title: "Pronunciation Feedback",
        description: data.feedback,
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

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.stop();
  };

  // Text-to-speech function
  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = targetLanguage;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={speakWord}
        title="Listen to pronunciation"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant={isListening ? "destructive" : "default"}
        onClick={isListening ? stopListening : startListening}
        className="w-32"
      >
        {isListening ? (
          <>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Practice
          </>
        )}
      </Button>

      {transcript && (
        <p className="text-sm text-muted-foreground">
          You said: "{transcript}"
        </p>
      )}
    </div>
  );
}
