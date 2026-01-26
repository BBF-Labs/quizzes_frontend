"use client";
import { useState, useEffect } from "react";
import { logo } from "@/assets";
import { ThemeToggle } from "./theme-toggle";
import { UserProfile } from "./userprofile";
import { useAuth } from "@/context";
import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
  // Use useAuth to get the user's authentication state
  const { user, isAuthenticated } = useAuth();

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    credits: 0,
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setUserDetails({
      name: user.name,
      email: user.email,
      credits: user.credits,
    });
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "border-b border-border bg-background/95 backdrop-blur-xl shadow-sm" 
          : "bg-transparent border-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <Image height={100} width={100} src={logo} alt="BBF Logo" />
          </Link>
          <div className="hidden md:flex md:flex-row md:gap-6 md:items-start md:justify-center">
            <Link
              href="/#features"
              className={`text-sm font-medium transition-colors ${
                isScrolled 
                  ? "text-muted-foreground hover:text-foreground" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              Features
            </Link>
            <Link
              href="/packages"
              className={`text-sm font-medium transition-colors ${
                isScrolled 
                  ? "text-muted-foreground hover:text-foreground" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link
                href="/auth/login"
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 sm:h-9 sm:rounded-md sm:px-3 lg:h-11 lg:rounded-md lg:px-8 ${
                  isScrolled ? "text-muted-foreground hover:text-foreground" : "text-gray-800 dark:text-white/90 hover:text-teal-500 hover:dark:text-white hover:bg-white/10"
                }`}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 sm:h-9 sm:rounded-md sm:px-3 lg:h-11 lg:rounded-md lg:px-8 ${
                  isScrolled 
                    ? "bg-teal-500 text-white hover:bg-teal-600" 
                    : "bg-white text-gray-900 hover:bg-white/90"
                }`}
              >
                Join Now
              </Link>
            </>
          ) : (
            <UserProfile
              name={userDetails.name}
              email={userDetails.email}
              credits={userDetails.credits}
            />
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
