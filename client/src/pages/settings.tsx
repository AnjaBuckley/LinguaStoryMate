import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type User, insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useInterfaceLanguage } from "@/hooks/use-interface-language";
import { Home, Flame, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import LanguageToggle from "@/components/language-toggle";
import LearningProgress from "@/components/learning-progress";
import { Story } from "@shared/schema";
import { format } from "date-fns";
import { Book } from "lucide-react"; // Assuming Book is a Lucide icon


export default function SettingsPage() {
  const { toast } = useToast();
  const { texts } = useInterfaceLanguage();
  const [isResetting, setIsResetting] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      dailyGoalMinutes: 30,
    },
    values: user,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!user) return;
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Your settings have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/reset-password-request", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "If an account exists with that email, you will receive password reset instructions.",
      });
      setIsResetting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsResetting(false);
    },
  });

  const onSubmit = (data: Partial<User>) => {
    updateUserMutation.mutate(data);
  };

  const handleResetPassword = () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }
    setIsResetting(true);
    resetPasswordMutation.mutate(email);
  };

  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
    select: (data) => data.filter((story) => story.userId === user?.id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8" />
          <div className="h-96 bg-muted rounded mb-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">{texts.settings}</h1>
          <div className="flex gap-4 items-center">
            <LanguageToggle />
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {texts.backToHome}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-6 w-6" />
                {texts.profileSettings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{texts.username}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{texts.email}</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dailyGoalMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{texts.dailyGoal}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            max={240}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={updateUserMutation.isPending}
                    >
                      {texts.saveChanges}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetPassword}
                      disabled={isResetting}
                    >
                      {isResetting ? "Sending..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {user && <LearningProgress user={user} />}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-6 w-6" />
                {texts.myStories || "My Stories"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stories.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {texts.noStoriesYet || "No stories created yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div>
                        <h3 className="font-medium">{story.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {story.sourceLanguage} → {story.targetLanguage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(story.createdAt), 'PPP')}
                        </p>
                      </div>
                      <Button variant="ghost" asChild>
                        <Link href={`/story/${story.id}`}>
                          View Story →
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}