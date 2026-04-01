"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { login } from "@/services/authService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Signing in...");

    try {
      const user = await login(email, password);
      setStatus(`Signed in as ${user.email}`);
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      if (message.toLowerCase().includes("email not confirmed")) {
        setStatus("Please confirm your email before logging in. Check your inbox and spam folder.");
        return;
      }

      if (message.toLowerCase().includes("unable to login")) {
        setStatus("Login failed. Please check your credentials and try again.");
        return;
      }

      setStatus(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-zinc-200/60">
          <CardHeader className="space-y-2 text-center pb-8 border-b border-zinc-100">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <p className="text-sm text-zinc-500">Enter your credentials to access your account</p>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-4 shadow-none">
              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-zinc-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {status && (
                <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${
                  status.includes("Signing in") || status.includes("Signed in") 
                    ? "bg-blue-50 text-blue-700" 
                    : "bg-red-50 text-red-700"
                }`}>
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{status}</p>
                </div>
              )}

              <Button type="submit" className="w-full shadow-md font-semibold text-base py-5">
                Sign In
              </Button>
              
              <div className="mt-4 text-center text-sm text-zinc-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Register here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
