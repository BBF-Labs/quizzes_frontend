"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion, useDragControls } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const dragControls = useDragControls()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      className="fixed z-50 cursor-move"
      initial={{ bottom: 20, right: 20 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full w-12 h-12 bg-white dark:bg-gray-800 shadow-lg"
      >
        {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      </Button>
    </motion.div>
  )
}

