import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Zap, GraduationCap, Globe } from "lucide-react";
import { useAuth } from "@/contexts/auth-context"; // Changed import path

interface ZIntroStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>; // Uncommented
}

export default function ZIntroStep({
  onComplete,
  initialData,
}: ZIntroStepProps) {
  // Added initialData to props
  const { user } = useAuth(); // Get user data from auth hook
  const [messageIndex, setMessageIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Derive userName and university from the user object, prioritizing initialData
  const userName =
    (initialData?.name as string)?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "there";
  const university =
    (initialData?.universityName as string) || "your university";

  const messages = [
    {
      icon: <GraduationCap className="size-10 text-primary" />,
      title: `Welcome, ${userName}.`,
      text: `Everything is ready. I've tailored Qz. to align with ${university}.`,
    },
    {
      icon: <Zap className="size-10 text-primary" />,
      title: "I am Z.",
      text: "Your hyper-personalised study companion. I'll help you master your materials with precision.",
    },
    {
      icon: <Globe className="size-10 text-primary" />,
      title: "One Mission.",
      text: "To bridge the gap between effort and excellence. Let's start the journey.",
    },
  ];

  useEffect(() => {
    // If we're on the last message, don't auto-advance
    if (messageIndex >= messages.length - 1) return;

    const timer = setTimeout(() => {
      setMessageIndex((prev) => prev + 1);
    }, 4500);

    return () => clearTimeout(timer);
  }, [messageIndex, messages.length]);

  const handleFinish = () => {
    setIsFinishing(true);
    // Add a slight delay for the final "impact" before completing
    setTimeout(() => {
      onComplete({ zIntroSeen: true });
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-112.5 relative text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 flex flex-col items-center"
        >
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl" />
            <div className="relative size-24 border border-primary/20 bg-background flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.1)]">
              {messages[messageIndex].icon}
            </div>
          </div>

          <div className="space-y-4 max-w-sm">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black tracking-[-0.05em] uppercase" // Kept original className for motion.h1
            >
              {messages[messageIndex].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed"
            >
              {messages[messageIndex].text}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 w-full flex flex-col items-center space-y-8">
        {/* Progress dots */}
        <div className="flex gap-2">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`h-1 transition-all duration-500 ${i === messageIndex ? "w-8 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>

        {messageIndex === messages.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Button
              onClick={handleFinish}
              disabled={isFinishing}
              className="w-full rounded-(--radius) font-mono text-xs tracking-[0.3em] uppercase h-14 bg-primary text-primary-foreground group overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                Enter the App{" "}
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
              {/* Impact flash on click could be added with more motion dev */}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Ambient background sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4"
        >
          <Sparkles className="size-6 text-primary/20" />
        </motion.div>
      </div>
    </div>
  );
}
