"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";

import { Button, Input, Label, Checkbox, AuthCard } from "@/components";
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // Add your login logic here
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <AuthCard>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          Sign in to BBF Quizzes
        </h1>
        <p className="text-sm text-white">
          Welcome back! Please enter your details.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              required
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/reset-password"
            className="text-sm font-medium text-teal-500 hover:text-teal-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold text-base"
          disabled={isLoading}
        >
          Sign in
        </Button>
      </form>
      <div className="text-center text-sm text-white mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-teal-500 hover:text-teal-400"
        >
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}
