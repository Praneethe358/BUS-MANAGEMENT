"use client";

import { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import { signUp } from "@/services/authService";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Creating account...");

    try {
      const user = await signUp(email, password);
      setStatus(
        `Registered as ${user.email}. Please check your inbox to confirm your email before logging in.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Register</h1>
        <form onSubmit={handleSubmit} className="mt-4 max-w-md space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2"
            required
            minLength={6}
          />
          <button
            type="submit"
            className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
          >
            Register
          </button>
        </form>
        {status && <p className="mt-3 text-sm text-zinc-700">{status}</p>}
      </main>
    </div>
  );
}
