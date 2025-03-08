import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface LearningBuddyProps {
  currentScore?: number;
  totalQuestions?: number;
  showCelebration?: boolean;
  message?: string;
}

const MESSAGES = {
  celebration: [
    "Amazing job! 🌟",
    "You're a superstar! ⭐",
    "Keep up the great work! 🎯",
  ],
  happy: [
    "You're doing great! 😊",
    "Keep going! 🚀",
    "You've got this! 💪",
  ],
  neutral: [
    "Let's try again! 🎯",
    "Practice makes perfect! 📚",
    "You're learning! 🌱",
  ],
};

export default function LearningBuddy({
  currentScore = 0,
  totalQuestions = 0,
  showCelebration = false,
  message,
}: LearningBuddyProps) {
  const [emotion, setEmotion] = useState<"neutral" | "happy" | "celebrating">("neutral");
  const [currentMessage, setCurrentMessage] = useState("");
  const { playSound } = useSoundEffects();

  useEffect(() => {
    if (showCelebration) {
      setEmotion("celebrating");
      playSound("celebration");
      setCurrentMessage(MESSAGES.celebration[Math.floor(Math.random() * MESSAGES.celebration.length)]);
      const timer = setTimeout(() => {
        setEmotion("happy");
        playSound("correct");
        setCurrentMessage(MESSAGES.happy[Math.floor(Math.random() * MESSAGES.happy.length)]);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (currentScore && totalQuestions) {
      const percentage = (currentScore / totalQuestions) * 100;
      const newEmotion = percentage >= 70 ? "happy" : "neutral";
      if (newEmotion !== emotion) {
        setEmotion(newEmotion);
        playSound(percentage >= 70 ? "correct" : "incorrect");
        setCurrentMessage(
          MESSAGES[newEmotion][Math.floor(Math.random() * MESSAGES[newEmotion].length)]
        );
      }
    }
  }, [currentScore, totalQuestions, showCelebration, emotion, playSound]);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
    }
  }, [message]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={emotion}
        className="fixed bottom-4 right-4 flex items-end gap-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Message bubble */}
        <motion.div
          className="bg-background rounded-lg p-4 shadow-lg max-w-xs"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm">{currentMessage}</p>
          {/* Triangle pointer */}
          <div className="absolute bottom-4 right-[-8px] w-0 h-0 border-solid border-8 border-background border-r-transparent border-b-transparent transform rotate-45" />
        </motion.div>

        {/* Mascot character */}
        <motion.div
          className="w-32 h-32 bg-background rounded-full shadow-lg flex items-center justify-center"
          animate={
            emotion === "celebrating"
              ? {
                  y: [-10, 0, -10],
                  rotate: [-5, 0, 5],
                  scale: [1, 1.1, 1],
                }
              : emotion === "happy"
              ? {
                  y: [0, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: emotion === "celebrating" ? Infinity : 0,
            repeatType: "reverse",
          }}
        >
          <motion.div className="w-24 h-24 relative">
            {/* Mascot face */}
            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center relative">
              {emotion === "celebrating" ? (
                <>
                  <span className="text-4xl">🎉</span>
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full text-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: -30, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    ⭐
                  </motion.div>
                </>
              ) : emotion === "happy" ? (
                <span className="text-4xl">😊</span>
              ) : (
                <span className="text-4xl">🤔</span>
              )}
            </div>

            {/* Celebration particles */}
            {emotion === "celebrating" && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [-20 + Math.random() * 40, -30 + Math.random() * 60],
                      y: [-20 + Math.random() * 40, -40 + Math.random() * 80],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}