import { useState } from "react";

export function useLearningCelebration() {
  const [showConfetti, setShowConfetti] = useState(false);

  const celebrateProgress = () => {
    setShowConfetti(true);
    // Reset after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  return {
    showConfetti,
    celebrateProgress,
  };
}
