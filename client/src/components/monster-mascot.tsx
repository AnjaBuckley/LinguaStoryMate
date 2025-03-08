import { motion } from "framer-motion";

interface MonsterMascotProps {
  emotion: "neutral" | "happy" | "celebrating";
}

export default function MonsterMascot({ emotion }: MonsterMascotProps) {
  return (
    <div className="w-32 h-32 relative">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: emotion === "celebrating" ? [0.8, 1.1, 0.8] : 1,
          rotate: emotion === "celebrating" ? [-5, 5, -5] : 0
        }}
        transition={{
          duration: 1,
          repeat: emotion === "celebrating" ? Infinity : 0,
          repeatType: "reverse"
        }}
      >
        {/* Body */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="#6366f1"
          className="drop-shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Fluff details */}
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            cx={100 + Math.cos((i * Math.PI * 2) / 8) * 85}
            cy={100 + Math.sin((i * Math.PI * 2) / 8) * 85}
            r="15"
            fill="#818cf8"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Eyes */}
        <g>
          {emotion === "happy" || emotion === "celebrating" ? (
            <>
              {/* Happy eyes */}
              <motion.path
                d="M70,80 Q80,95 90,80"
                stroke="#1e1b4b"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
              <motion.path
                d="M110,80 Q120,95 130,80"
                stroke="#1e1b4b"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            </>
          ) : (
            <>
              {/* Neutral eyes */}
              <circle cx="80" cy="85" r="10" fill="#1e1b4b" />
              <circle cx="120" cy="85" r="10" fill="#1e1b4b" />
              <circle cx="83" cy="82" r="3" fill="white" />
              <circle cx="123" cy="82" r="3" fill="white" />
            </>
          )}
        </g>

        {/* Mouth */}
        {emotion === "celebrating" ? (
          // Wide happy mouth
          <path
            d="M70,120 Q100,140 130,120"
            stroke="#1e1b4b"
            strokeWidth="4"
            fill="none"
          />
        ) : emotion === "happy" ? (
          // Small happy mouth
          <path
            d="M85,115 Q100,125 115,115"
            stroke="#1e1b4b"
            strokeWidth="4"
            fill="none"
          />
        ) : (
          // Neutral mouth
          <path
            d="M85,120 Q100,115 115,120"
            stroke="#1e1b4b"
            strokeWidth="4"
            fill="none"
          />
        )}

        {/* Arms */}
        <motion.path
          d="M40,100 Q20,100 10,90"
          stroke="#6366f1"
          strokeWidth="12"
          strokeLinecap="round"
          animate={emotion === "celebrating" ? {
            rotate: [-10, 10, -10],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.path
          d="M160,100 Q180,100 190,90"
          stroke="#6366f1"
          strokeWidth="12"
          strokeLinecap="round"
          animate={emotion === "celebrating" ? {
            rotate: [10, -10, 10],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.svg>
    </div>
  );
}
