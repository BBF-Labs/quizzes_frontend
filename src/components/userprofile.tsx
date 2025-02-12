"use client";

import { useState } from "react";
import { User, LogOut, CreditCard, BookOpen, BarChart } from "lucide-react";
import Link from "next/link";
import {
  Button,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";
interface UserProfileProps {
  name: string;
  email: string;
  credits?: number;
}

const menuItems = [
  {
    href: "/user/profile",
    label: "Profile",
    icon: <User className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/profile/payments",
    label: "Payments",
    icon: <CreditCard className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/profile/courses",
    label: "Courses",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/profile/progress",
    label: "Quiz Progress",
    icon: <BarChart className="mr-2 h-4 w-4" />,
  },
];

export function UserProfile({ name, email, credits = 0 }: UserProfileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center space-x-3 px-3 py-6 transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className="h-8 w-8 bg-gradient-to-r from-teal-500 to-blue-500">
            <AvatarFallback className="bg-brand-gradient">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div
            className={`flex flex-col items-start overflow-hidden transition-all duration-300 ${
              isHovered ? "w-48 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {name}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium text-foreground">
            Quiz Credits
          </span>
          <span className="px-2 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-teal-500 to-blue-500">
            {credits}
          </span>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        {menuItems.map((item) => (
          <DropdownMenuItem asChild key={item.label}>
            <Link href={item.href} className="flex items-center cursor-pointer">
              {item.icon}
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem>
          <Link href="/">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
