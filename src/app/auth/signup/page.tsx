"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  Label,
  AuthCard,
  showToast,
} from "@/components";
import { useRouter } from "next/navigation";
import { createUser, loginUser } from "@/controllers";
import { useAppDispatch } from "@/hooks";
import { motion } from "framer-motion";
import { Loader2, User, Lock, Mail, UserCircle, ArrowRight } from "lucide-react";

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
        name: formData.fullName.trim(),
        username: formData.username.trim().replace(" ", "").toLowerCase(),
        password: formData.password,
        email: formData.email.trim().toLowerCase(),
      };
      await createUser(data);
      setIsLoading(false);
      showToast("Account created successfully!", "success");
      await dispatch(
        loginUser(formData.username.trim().toLowerCase(), formData.password)
      );
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
          Create your account
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          Join thousands of students acing their exams
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
            <Label htmlFor="fullName" className="text-foreground font-medium">
              Full Name
            </Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10 h-12 bg-muted/50 border-border focus:border-teal-500 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground font-medium">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
                value={formData.username}
                onChange={handleChange}
                className="pl-10 h-12 bg-muted/50 border-border focus:border-teal-500 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 h-12 bg-muted/50 border-border focus:border-teal-500 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground"
        >
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-teal-600 dark:text-teal-500 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-teal-600 dark:text-teal-500 hover:underline">
            Privacy Policy
          </Link>
        </motion.p>

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
                Creating account...
              </>
            ) : (
              <>
                Create account
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
            Already have an account?
          </span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center w-full h-12 rounded-lg border-2 border-teal-500 text-teal-600 dark:text-teal-500 font-semibold hover:bg-teal-500/50 hover:text-white transition-all duration-300"
        >
          Sign in instead
        </Link>
      </motion.div>
    </AuthCard>
  );
}
