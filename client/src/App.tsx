import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Home from "@/pages/home";
import StoryView from "@/pages/story-view";
import Quiz from "@/pages/quiz";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import LearningPreferences from "@/pages/learning-preferences";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/story/:id" component={StoryView} />
      <ProtectedRoute path="/quiz/:storyId" component={Quiz} />
      <ProtectedRoute path="/learning-preferences" component={LearningPreferences} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;