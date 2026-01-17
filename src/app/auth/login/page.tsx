"use client";
import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/hooks";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loginUser } from "@/controllers";
import { Loader2, User, Lock, ArrowRight } from "lucide-react";

import {
  Button,
  Input,
  Label,
  Checkbox,
  AuthCard,
  showToast,
} from "@/components";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
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
      await dispatch(
        loginUser(
          formData.username.trim().replace(" ", "").toLowerCase(),
          formData.password
        )
      );
      setIsLoading(false);
      showToast("Login Successful!", "success");
      router.push(returnUrl);
    } catch (error: any) {
      setIsLoading(false);
      showToast(`${error.message}`, "error");
    }
  }

  return (
    <AuthCard>
      <div className="space-y-2 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
        >
          Welcome back
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          Sign in to continue your learning journey
        </motion.p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-5">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground font-medium">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="pl-10 h-12 bg-muted/50 border-border focus:border-teal-500 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 h-12 bg-muted/50 border-border focus:border-teal-500 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onClick={() => {
                setRememberMe(!rememberMe);
                localStorage.setItem(
                  "rememberMe",
                  JSON.stringify(rememberMe)
                );
              }}
              className="border-border data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/reset-password"
            className="text-sm font-medium text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            type="submit"
            className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            New to BBF Quizzes?
          </span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center hover:text-white"
      >
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center w-full h-12 rounded-lg border-2 border-teal-500 text-teal-600 dark:text-teal-500 font-semibold hover:bg-teal-500/50  transition-all duration-300 hover:text-white"
        >
          <p className="">Create an account</p>
        </Link>
      </motion.div>
    </AuthCard>
  );
}
