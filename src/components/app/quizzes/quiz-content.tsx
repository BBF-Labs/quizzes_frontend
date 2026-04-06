"use client";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QuizLecture, QuizTopic, QuizQuestion } from "@/types/session";
import { BookOpen, Target, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionRowProps {
  q: QuizQuestion;
}

export function QuestionRow({ q }: QuestionRowProps) {
  const typeLabel =
    q.type === "mcq"
      ? "MCQ"
      : q.type === "true_false"
      ? "T/F"
      : q.type === "short_answer"
      ? "Short"
      : q.type === "fill_in" || q.type === "fill_in_blank"
      ? "Fill"
      : q.type === "essay"
      ? "Essay"
      : "Free";

  return (
    <div className="border border-border/30 bg-card/20 px-4 py-3">
      <div className="flex flex-col gap-1.5">
        <Badge
          variant="outline"
          className="self-start text-[8px] font-mono h-4 px-1.5 uppercase"
        >
          {typeLabel}
        </Badge>
        <p
          className="text-[12px] font-mono text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: q.question }}
        />
      </div>

      {/* Options */}
      {q.options && q.options.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {q.options.map((opt, i) => (
            <li
              key={i}
              className={`text-[10px] font-mono flex items-baseline gap-1 ${
                opt === q.correctAnswer ? "text-green-500 font-bold" : "text-muted-foreground/60"
              }`}
            >
              <span className="opacity-40 shrink-0">{String.fromCharCode(65 + i)}.</span>
              <span dangerouslySetInnerHTML={{ __html: opt }} />
            </li>
          ))}
        </ul>
      )}

      {/* Correct answer fallback for non-MCQ */}
      {q.correctAnswer && (!q.options || q.options.length === 0) && (
        <p className="mt-2 text-[10px] font-mono text-muted-foreground/50">
          Answer: <span className="text-green-500 font-bold" dangerouslySetInnerHTML={{ __html: q.correctAnswer }} />
        </p>
      )}
    </div>
  );
}

interface TopicSectionProps {
  topic: QuizTopic;
}

export function TopicSection({ topic }: TopicSectionProps) {
  const questions = topic.questions || [];

  return (
    <div className="border-l border-border/50 ml-3 pl-4 py-2 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-3 h-3 text-primary/60" />
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
          {topic.topicTitle}
        </h4>
        <Badge variant="secondary" className="text-[8px] h-4 px-1.5">
          {questions.length} Questions
        </Badge>
      </div>
      
      <div className="grid gap-1">
        {questions.map((q, idx) => (
          <QuestionRow key={q.id || `q-${idx}`} q={q} />
        ))}
      </div>
    </div>
  );
}

interface LectureSectionProps {
  lecture: QuizLecture;
  index: number;
}

export function LectureSection({ lecture, index }: LectureSectionProps) {
  const totalQuestions = (lecture.topics || []).reduce(
    (acc, t) => acc + (t.questions?.length ?? 0),
    0
  );

  return (
    <AccordionItem
      value={`lecture-${index}`}
      className="border border-border/50 bg-card/10 backdrop-blur-sm overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline group">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-tighter">
                Section {index + 1}
              </span>
              <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-60">
                {totalQuestions} Qs
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-foreground leading-none mt-1">
              {lecture.lectureTitle}
            </h3>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pt-2"
          >
            {lecture.topics.map((topic, tIdx) => (
              <TopicSection 
                key={`${topic.topicTitle}-${tIdx}`} 
                topic={topic} 
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </AccordionContent>
    </AccordionItem>
  );
}

export function QuizContent({ lectures }: { lectures: QuizLecture[] }) {
  if (!lectures?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
        <HelpCircle className="w-12 h-12 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest">No curriculum data available</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="grid gap-3">
      {lectures.map((lecture, idx) => (
        <LectureSection 
          key={`${lecture.lectureTitle}-${idx}`} 
          lecture={lecture} 
          index={idx} 
        />
      ))}
    </Accordion>
  );
}

export function QuizStatsBar({
  questionCount,
  lectureCount,
  passingScore,
  settings,
  className,
}: {
  questionCount: number;
  lectureCount: number;
  passingScore?: number;
  settings?: { timeLimit?: number } & Record<string, unknown>;
  className?: string;
}) {
  const stats = [
    { label: "Questions", value: questionCount },
    { label: "Sections", value: lectureCount },
    ...(passingScore !== undefined ? [{ label: "Pass Score", value: `${passingScore}%` }] : []),
    ...(settings?.timeLimit ? [{ label: "Time Limit", value: `${settings.timeLimit}m` }] : []),
  ];

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">
            {stat.label}
          </span>
          <span className="text-sm font-bold text-foreground leading-none">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
