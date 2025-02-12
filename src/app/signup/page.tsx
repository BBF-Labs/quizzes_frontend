"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";

import { Button, Input, Label, AuthCard } from "@/components";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // Add your signup logic here
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <AuthCard>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          Create an account
        </h1>
        <p className="text-sm text-white">Enter your details to get started</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              required
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              placeholder="johndoe"
              required
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
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

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold text-base"
          disabled={isLoading}
        >
          Create account
        </Button>
      </form>
      <div className="text-center text-sm text-white mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-teal-500 hover:text-teal-400"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
