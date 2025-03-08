import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLocation } from "wouter";
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
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Only redirect after all hooks are initialized
  if (user) {
    navigate("/");
    return null;
  }

  const onSubmit = async (data: InsertUser) => {
    if (isRegistering) {
      await registerMutation.mutateAsync(data);
    } else {
      await loginMutation.mutateAsync(data);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>
              {isRegistering ? "Create an Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          autoComplete={
                            isRegistering ? "new-password" : "current-password"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRegistering ? (
                    "Sign Up"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm"
              >
                {isRegistering
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}