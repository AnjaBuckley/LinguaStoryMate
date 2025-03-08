import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

interface ConfettiBurstProps {
  duration?: number;
  pieces?: number;
}

const COLORS = [
  "#FFD700", // Gold
  "#FF69B4", // Hot Pink
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#FF5722", // Deep Orange
];

export default function ConfettiBurst({ duration = 2000, pieces = 50 }: ConfettiBurstProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate confetti pieces
    const newConfetti = Array.from({ length: pieces }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 20, // Start from bottom
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setConfetti(newConfetti);

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [pieces, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: piece.rotation,
            scale: piece.scale,
          }}
          animate={{
            y: -20, // Float up
            x: piece.x + (Math.random() * 200 - 100), // Random horizontal movement
            rotate: piece.rotation + (Math.random() * 720 - 360), // Random rotation
          }}
          transition={{
            duration: duration / 1000,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            backgroundColor: piece.color,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}
