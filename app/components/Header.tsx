"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Sun, Moon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isAuthenticated: boolean
  onLogout: () => void
}

export default function Header({ isAuthenticated, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <motion.header
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-bbf-gold via-bbf-green to-bbf-purple bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            BBF LABS
          </motion.h1>
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </motion.div>
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" onClick={onLogout} className="rounded-full">
                  Logout
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
        {isMenuOpen && (
          <motion.div
            className="mt-4 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Add mobile menu items here */}
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-bbf-purple dark:hover:text-bbf-gold">
                Home
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-bbf-purple dark:hover:text-bbf-gold">
                Courses
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-bbf-purple dark:hover:text-bbf-gold">
                About
              </a>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

