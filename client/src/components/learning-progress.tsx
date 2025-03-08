import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateUserLevel, calculateProgressToNextLevel, type User } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface LearningProgressProps {
  user: User;
}

const PROGRESS_LEVELS = {
  // Add your progress levels here.  Example:
  "1": { badge: "⭐️" },
  "2": { badge: "⭐⭐" },
  "3": { badge: "⭐⭐⭐" },
};


export default function LearningProgress({ user }: LearningProgressProps) {
  const storiesCompleted = user.storiesCompleted || 0;
  const currentLevel = calculateUserLevel(storiesCompleted);
  const { progress, nextLevel, storiesUntilNextLevel } = calculateProgressToNextLevel(storiesCompleted);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{currentLevel.badge}</span>
          <span>{currentLevel.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {storiesCompleted} stories
            </div>
          </div>

          {nextLevel && (
            <p className="text-sm text-muted-foreground">
              Complete {storiesUntilNextLevel} more {storiesUntilNextLevel === 1 ? 'story' : 'stories'} to reach {nextLevel.name} {nextLevel.badge}
            </p>
          )}

          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-wrap gap-2"
            >
              {Object.entries(PROGRESS_LEVELS).map(([key, { badge }]) => (
                <motion.span
                  key={key}
                  className="text-2xl"
                  whileHover={{ scale: 1.2 }}
                >
                  {badge}
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}