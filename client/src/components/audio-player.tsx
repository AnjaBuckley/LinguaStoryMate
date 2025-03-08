import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2 } from "lucide-react";
import { useState, useRef } from "react";

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-secondary/20 p-4 rounded-lg">
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={!url}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>
      <Volume2 className="h-6 w-6 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">
        {url ? "Listen to the story" : "Audio not available"}
      </div>
    </div>
  );
}
