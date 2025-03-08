import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, LearningAnalytics } from "@shared/schema";
import { Brain, Clock, Star, TrendingUp, Flag } from "lucide-react";

interface ChildWithAnalytics extends User {
  analytics?: LearningAnalytics;
  relationshipType: string;
}

export default function ParentDashboard() {
  const { toast } = useToast();
  
  const { data: children, isLoading } = useQuery<ChildWithAnalytics[]>({
    queryKey: ["/api/parent/children"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Parent Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children?.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{child.username}</span>
                  <span className="text-sm text-muted-foreground">
                    {child.relationshipType}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {child.analytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          Time spent: {Math.round(child.analytics.totalTimeSpent / 60)} minutes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          Average score: {child.analytics.averageScore}%
                        </span>
                      </div>
                    </div>

                    {/* Language Progress */}
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Language Progress
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(child.analytics.languageProgress).map(([lang, level]) => (
                          <div key={lang} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${level}%` }}
                              />
                            </div>
                            <span className="text-sm min-w-[4rem]">{lang}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths & Areas for Improvement */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Strengths
                        </h3>
                        <ul className="text-sm space-y-1">
                          {child.analytics.strengthAreas.map((area) => (
                            <li key={area}>{area}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          Areas to Focus
                        </h3>
                        <ul className="text-sm space-y-1">
                          {child.analytics.improvementAreas.map((area) => (
                            <li key={area}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No learning data available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
