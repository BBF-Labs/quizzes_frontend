"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import Link from "next/link";
import { UserProfile } from "@/components/userprofile";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { logo } from "@/assets";

export function Header() {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    credits: 0,
  });

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setUserDetails({
      name: user.name,
      email: user.email,
      credits: user.credits,
    });
  }, [user]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
        <Link href="/" className="flex items-center">
          <Image
            height={100}
            width={100}
            src={logo}
            alt="BBF Logo"
            className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserProfile
            name={userDetails.name}
            email={userDetails.email}
            credits={userDetails.credits}
          />
        </div>
      </nav>
    </header>
  );
}
