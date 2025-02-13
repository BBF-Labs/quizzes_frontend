import { motion } from "framer-motion";
import { BookOpen, Users } from "lucide-react";
import Link from "next/link";

function QuizCard({
  title,
  category,
  duration,
  questions,
  completions,
  id,
}: {
  title: string;
  category: string;
  duration: string;
  questions: number;
  completions: number;
  id: string | number;
}) {
  return (
    <Link href={`/user/quiz/${id}/`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
      >
        <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 p-6 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-white text-center group-hover:scale-105 transition-transform duration-300 flex-wrap">
            {title}
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {category}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">
              {duration} mins
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-gradient-brand transition-all duration-300">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {questions} questions
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {completions} completions
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
}

export { QuizCard };
