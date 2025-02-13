"use client";
import { useState, useEffect } from "react";
import { logo } from "@/assets";
import { ThemeToggle } from "./theme-toggle";
import { UserProfile } from "./userprofile";
import { RootState } from "@/lib"; // Import RootState for type safety
import { useSelector } from "react-redux"; // Corrected import for useSelector
import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
  // Use useSelector to get the user's authentication state
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    credits: 0,
  });

  useEffect(() => {
    setUserDetails({
      name: user.name,
      email: user.email,
      credits: user.credits,
    });
  }, [user]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Image height={100} width={100} src={logo} alt="BBF Logo" />
          <div className="hidden md:flex md:flex-row md:gap-6 md:items-start md:justify-center">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 sm:h-9 sm:rounded-md sm:px-3 lg:h-11 lg:rounded-md lg:px-8 text-muted-foreground"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-10 px-4 py-2 sm:h-9 sm:rounded-md sm:px-3 lg:h-11 lg:rounded-md lg:px-8"
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
