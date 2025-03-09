import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { generateStorySchema } from "@shared/schema";

interface TranslationPreviewProps {
  storyId: number;
  currentLanguage: string;
}

export default function TranslationPreview({ storyId, currentLanguage }: TranslationPreviewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: async (targetLanguage: string) => {
      const res = await apiRequest(
        "POST",
        `/api/stories/${storyId}/translate-preview`,
        { targetLanguage }
      );
      return res.json();
    },
    onSuccess: (data) => {
      setTranslation(data.translation);
    },
    onError: (error: Error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get available languages from the schema
  const availableLanguages = generateStorySchema.shape.sourceLanguage.options
    .filter(lang => lang !== currentLanguage);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((language) => (
              <SelectItem key={language} value={language}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => translateMutation.mutate(selectedLanguage)}
          disabled={!selectedLanguage || translateMutation.isPending}
        >
          {translateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            "Preview Translation"
          )}
        </Button>
      </div>

      <AnimatePresence>
        {translation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="pt-6">
                <p className="text-xl">{translation}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
