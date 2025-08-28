"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { Input } from "./input";
import { MarkdownRenderer } from "./markdown-renderer";

import {
  MessageCircle,
  X,
  Send,
  Loader,
  Bot,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import axios from "axios";
import Config from "@/config";

interface AIResponse {
  answer: string;
  explanation?: string;
  relatedTopics?: string[];
  confidence: number;
  usage: {
    tokensUsed: number;
    remainingCredits: number;
  };
}

interface FloatingAIWidgetProps {
  contextId?: string;
  contextType?: "flashcard" | "question" | "general";
  className?: string;
}

export function FloatingAIWidget({
  contextId,
  contextType = "general",
  className = "",
}: FloatingAIWidgetProps) {
  const { credentials } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ question: string; response: AIResponse; timestamp: Date }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const askAI = async () => {
    if (!aiQuestion.trim() || !credentials?.accessToken) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const requestBody: any = {
        question: aiQuestion,
      };

      // Add context based on type
      if (contextId) {
        if (contextType === "flashcard") {
          requestBody.flashcardId = contextId;
        } else if (contextType === "question") {
          requestBody.questionId = contextId;
        }
      }

      const response = await axios.post(
        `${Config.API_URL}/ai-assistant/ask`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      const responseData = response.data.data;

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          question: aiQuestion,
          response: responseData,
          timestamp: new Date(),
        },
      ]);

      setAiQuestion("");
    } catch (error: any) {
      setAiError(error.response?.data?.message || "Failed to get AI response");
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setAiError(null);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="mb-4"
          >
            <Button
              onClick={toggleWidget}
              className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="w-96 bg-background border border-border rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold">AI Assistant</span>
                  <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full font-medium">
                    BETA
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimize}
                    className="text-white hover:bg-white/20 p-1 h-6 w-6"
                  >
                    {isMinimized ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleWidget}
                    className="text-white hover:bg-white/20 p-1 h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Experimental Feature Notice */}
              <div className="mt-2 text-xs text-white/90 bg-white/10 rounded px-2 py-1">
                ⚠️ Experimental AI feature - responses may be slow or fail
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="min-h-[50vh] flex flex-col overflow-auto max-h-[70vh]"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                    {conversationHistory.length === 0 && (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-center text-muted-foreground text-sm">
                          <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Ask me anything about your course!</p>
                        </div>
                      </div>
                    )}

                    {conversationHistory.map((item, index) => (
                      <div key={index} className="space-y-3">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-3 py-2 rounded-lg max-w-[80%] text-sm">
                            {item.question}
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%] text-sm overflow-hidden">
                            <MarkdownRenderer content={item.response.answer} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Current AI Response */}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-3 py-2 rounded-lg flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {aiError && (
                      <div className="flex justify-start">
                        <div className="bg-red-100 border border-red-200 px-3 py-2 rounded-lg max-w-[80%] text-sm text-red-800">
                          {aiError}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-border bg-muted/30">
                    <div className="flex gap-2 w-full">
                      <Input
                        placeholder="Ask a question..."
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="text-sm flex-1 min-w-0"
                        disabled={aiLoading}
                      />
                      <Button
                        onClick={askAI}
                        disabled={!aiQuestion.trim() || aiLoading}
                        size="sm"
                        className="px-4 flex-shrink-0"
                      >
                        {aiLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Clear Conversation Button */}
                    {conversationHistory.length > 0 && (
                      <Button
                        onClick={clearConversation}
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear Conversation
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
