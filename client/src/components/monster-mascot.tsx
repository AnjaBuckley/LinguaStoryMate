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
          cy="110"
          r="60"
          fill="#e5e7eb"
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

        {/* Ears */}
        <motion.circle
          cx="70"
          cy="60"
          r="25"
          fill="#e5e7eb"
          animate={{
            rotate: emotion === "celebrating" ? [-5, 5, -5] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.circle
          cx="130"
          cy="60"
          r="25"
          fill="#e5e7eb"
          animate={{
            rotate: emotion === "celebrating" ? [5, -5, 5] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Inner ears */}
        <circle cx="70" cy="60" r="15" fill="#fca5a5" />
        <circle cx="130" cy="60" r="15" fill="#fca5a5" />

        {/* Eyes */}
        <g>
          {emotion === "happy" || emotion === "celebrating" ? (
            <>
              {/* Happy eyes */}
              <motion.path
                d="M80,100 Q90,115 100,100"
                stroke="#1e1b4b"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
              <motion.path
                d="M120,100 Q130,115 140,100"
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
              <circle cx="90" cy="105" r="8" fill="#1e1b4b" />
              <circle cx="130" cy="105" r="8" fill="#1e1b4b" />
              <circle cx="93" cy="102" r="3" fill="white" />
              <circle cx="133" cy="102" r="3" fill="white" />
            </>
          )}
        </g>

        {/* Nose */}
        <motion.ellipse
          cx="110"
          cy="120"
          rx="8"
          ry="6"
          fill="#f87171"
          animate={{
            scale: emotion === "celebrating" ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Whiskers */}
        <g stroke="#94a3b8" strokeWidth="2">
          <motion.line
            x1="90"
            y1="120"
            x2="60"
            y2="115"
            animate={{
              rotate: emotion === "celebrating" ? [-2, 2, -2] : 0,
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.line
            x1="90"
            y1="125"
            x2="60"
            y2="125"
            animate={{
              rotate: emotion === "celebrating" ? [-2, 2, -2] : 0,
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.line
            x1="130"
            y1="120"
            x2="160"
            y2="115"
            animate={{
              rotate: emotion === "celebrating" ? [2, -2, 2] : 0,
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.line
            x1="130"
            y1="125"
            x2="160"
            y2="125"
            animate={{
              rotate: emotion === "celebrating" ? [2, -2, 2] : 0,
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </g>

        {/* Mouth */}
        {emotion === "celebrating" ? (
          // Wide happy mouth
          <path
            d="M90,130 Q110,145 130,130"
            stroke="#1e1b4b"
            strokeWidth="4"
            fill="none"
          />
        ) : emotion === "happy" ? (
          // Small happy mouth
          <path
            d="M100,130 Q110,135 120,130"
            stroke="#1e1b4b"
            strokeWidth="4"
            fill="none"
          />
        ) : (
          // Neutral mouth
          <path
            d="M100,135 Q110,130 120,135"
            stroke="#1e1b4b"
            strokeWidth="4"
            fill="none"
          />
        )}

        {/* Little paws when celebrating */}
        {emotion === "celebrating" && (
          <>
            <motion.circle
              cx="70"
              cy="160"
              r="10"
              fill="#e5e7eb"
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.circle
              cx="130"
              cy="160"
              r="10"
              fill="#e5e7eb"
              animate={{
                y: [5, -5, 5],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.25,
              }}
            />
          </>
        )}
      </motion.svg>
    </div>
  );
}