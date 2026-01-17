"use client";

import { useEffect, useState } from "react";
import {
  User,
  LogOut,
  CreditCard,
  BookOpen,
  Clipboard,
  DollarSign,
  Grid,
  UploadCloud,
  ScrollText,
} from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { logoutUser } from "@/controllers";
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
  showToast,
} from "@/components";
import { logout } from "@/lib";
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
    href: "/quizzes",
    label: "All Quizzes",
    icon: <Clipboard className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/personal-quizzes",
    label: "Personal Quizzes",
    icon: <ScrollText className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/quiz/upload",
    label: "Upload Material",
    icon: <UploadCloud className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/pay",
    label: "Make Payment",
    icon: <DollarSign className="mr-2 h-4 w-4" />,
  },
  {
    href: "/courses",
    label: "All Courses",
    icon: <Grid className="mr-2 h-4 w-4" />,
  },
  {
    href: "/user/flashcards",
    label: "Flashcards",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
];

export function UserProfile({ name, email, credits }: UserProfileProps) {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    const tokenExpiry = localStorage.getItem("aExpBff");

    if (!tokenExpiry) {
      dispatch(logout());
    }

    if (tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const currentDate = new Date();

      if (currentDate > expiryDate) {
        dispatch(logout());
        localStorage.removeItem("aExpBff");
      }
    }
  }, [dispatch]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center space-x-3 px-3 py-6 transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className="h-8 w-8 bg-teal-500">
            <AvatarFallback className="bg-teal-500">
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
          <span className="px-2 py-1 text-sm font-medium rounded-full bg-teal-500 text-white">
            {credits || 0}
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
        <DropdownMenuItem
          onClick={() => {
            dispatch(logoutUser());
            showToast("Logged Out Successfully", "success");
          }}
        >
          <div className="flex items-center cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
