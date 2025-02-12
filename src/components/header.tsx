"use client";

import Link from "next/link";
import { UserProfile } from "@/components/userprofile";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { logo } from "@/assets";

export function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent"
          >
            <Image height={100} width={100} src={logo} alt="BBF Logo" />
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserProfile
              name="Nii Tettey"
              email="admin@theniitettey.live"
              credits={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
