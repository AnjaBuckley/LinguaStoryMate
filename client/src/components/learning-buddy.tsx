import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface LearningBuddyProps {
  currentScore?: number;
  totalQuestions?: number;
  showCelebration?: boolean;
}

export default function LearningBuddy({
  currentScore = 0,
  totalQuestions = 0,
  showCelebration = false,
}: LearningBuddyProps) {
  const [emotion, setEmotion] = useState<"neutral" | "happy" | "celebrating">("neutral");

  useEffect(() => {
    if (showCelebration) {
      setEmotion("celebrating");
      const timer = setTimeout(() => setEmotion("happy"), 3000);
      return () => clearTimeout(timer);
    } else if (currentScore && totalQuestions) {
      const percentage = (currentScore / totalQuestions) * 100;
      setEmotion(percentage >= 70 ? "happy" : "neutral");
    }
  }, [currentScore, totalQuestions, showCelebration]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={emotion}
        className="fixed bottom-4 right-4 w-32 h-32 bg-background rounded-full shadow-lg flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-24 h-24 relative"
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
          {/* Simple character face */}
          <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
            {emotion === "celebrating" ? (
              <span className="text-4xl">🎉</span>
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
    </AnimatePresence>
  );
}
