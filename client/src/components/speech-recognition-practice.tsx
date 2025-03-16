import { useState, useEffect, useRef } from 'react';
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
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

  // Check browser support
  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    if (!supported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
        variant: "destructive",
      });
    }
  }, []);

  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = targetLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        toast({
          title: "Listening",
          description: "Speak now...",
        });
      };

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
          description: `Speech recognition error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

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
        disabled={!isSupported}
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