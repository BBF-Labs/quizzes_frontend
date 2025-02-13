"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  Label,
  AuthCard,
  LandingHeader,
  showToast,
} from "@/components";
import { useRouter } from "next/navigation";
import { createUser, loginUser } from "@/controllers";
import { useAppDispatch } from "@/hooks";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [returnUrl, setReturnUrl] = useState("/quizzes");
  useEffect(() => {
    setReturnUrl(localStorage.getItem("returnUrl") || "/quizzes");
    localStorage.removeItem("returnUrl");
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name: formData.fullName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
      };
      await createUser(data);
      setIsLoading(false);
      showToast("Account created successfully!", "success");
      await dispatch(loginUser(formData.username, formData.password));
      router.push(returnUrl);
    } catch (error: any) {
      setIsLoading(false);
      showToast(`${error.message}`, "error");
    }
  }

  return (
    <div>
      <LandingHeader />
      <AuthCard>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Create an account
          </h1>
          <p className="text-sm text-white">
            Enter your details to get started
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
                value={formData.username}
                onChange={handleChange}
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
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
            href="/auth/login"
            className="font-medium text-teal-500 hover:text-teal-400"
          >
            Sign in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
