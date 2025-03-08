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

export default function SettingsPage() {
  const { toast } = useToast();
  const { texts } = useInterfaceLanguage();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
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

  const onSubmit = (data: Partial<User>) => {
    updateUserMutation.mutate(data);
  };

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
          <h1 className="text-4xl font-bold text-primary">User Settings</h1>
          <div className="flex gap-4 items-center">
            <LanguageToggle />
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-6 w-6" />
                Profile Settings
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
                          <FormLabel>Username</FormLabel>
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
                          <FormLabel>Email</FormLabel>
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
                        <FormLabel>Daily Learning Goal (minutes)</FormLabel>
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateUserMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                Learning Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-orange-500">
                  {user?.currentStreak || 0}
                </div>
                <div className="text-lg text-muted-foreground">
                  days in a row
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}