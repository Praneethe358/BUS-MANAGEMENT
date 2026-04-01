"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { signUp } from "@/services/authService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus("Passwords do not match");
      setIsSuccess(false);
      return;
    }

    setStatus("Creating account...");
    setIsSuccess(false);

    try {
      const user = await signUp(email, password);
      setIsSuccess(true);
      setStatus(
        `Registered as ${user.email}. Please check your inbox to confirm your email before logging in.`
      );
    } catch (error) {
      setIsSuccess(false);
      setStatus(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-zinc-200/60">
          <CardHeader className="space-y-2 text-center pb-8 border-b border-zinc-100">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
            <p className="text-sm text-zinc-500">Sign up to track your bus in real-time</p>
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
                  minLength={6}
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-zinc-700">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {status && (
                <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${
                  isSuccess 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {isSuccess ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p>{status}</p>
                </div>
              )}

              <Button type="submit" className="w-full shadow-md font-semibold text-base py-5 mt-2">
                Register
              </Button>
              
              <div className="mt-4 text-center text-sm text-zinc-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Log in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
