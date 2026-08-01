"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { Search, Plus } from "lucide-react";

interface FaqItem {
  id: string;
  category: "getting-started" | "qubi" | "timetable" | "billing" | "privacy";
  categoryLabel: string;
  categoryColor: string;
  question: string;
  answer: React.ReactNode;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "1",
    category: "getting-started",
    categoryLabel: "Getting started",
    categoryColor: "text-[#0C60FC]",
    question: "What is Qz, and who is it for?",
    answer: "Qz is an AI-powered study platform built around university curricula. It is designed for students who want a clearer study plan, targeted practice, useful learning materials and an honest view of their exam readiness.",
  },
  {
    id: "2",
    category: "getting-started",
    categoryLabel: "Getting started",
    categoryColor: "text-[#0C60FC]",
    question: "How do I get started?",
    answer: "Create a free account, select your university and programme, then add a course or upload material. Qz uses that context to recommend a useful first session rather than dropping you into an empty dashboard.",
  },
  {
    id: "3",
    category: "qubi",
    categoryLabel: "Studying with Qubi",
    categoryColor: "text-violet-600",
    question: "Is Qubi just another chatbot?",
    answer: "No. Qubi is a study system. It uses your curriculum and materials to identify gaps, structure a session, explain ideas, generate practice and check whether you understand a topic before moving on.",
  },
  {
    id: "4",
    category: "qubi",
    categoryLabel: "Studying with Qubi",
    categoryColor: "text-violet-600",
    question: "What study materials can I upload?",
    answer: "You can use course documents such as PDFs, lecture notes and diagrams. Only upload material you own or have permission to use, and avoid documents containing another person’s private information.",
  },
  {
    id: "5",
    category: "qubi",
    categoryLabel: "Studying with Qubi",
    categoryColor: "text-violet-600",
    question: "Are Qubi’s answers always accurate?",
    answer: "AI-generated content can contain errors or omissions. Use Qubi as educational assistance, verify important details against official course material, and follow your institution’s academic integrity rules.",
  },
  {
    id: "6",
    category: "timetable",
    categoryLabel: "Timetable",
    categoryColor: "text-emerald-600",
    question: "Do I need an account to search the exam timetable?",
    answer: "No. The public exam timetable is free to search. An account is only needed to save your courses, receive reminders, see personalised venue information and connect exams to your revision plan.",
  },
  {
    id: "7",
    category: "timetable",
    categoryLabel: "Timetable",
    categoryColor: "text-emerald-600",
    question: "Where does the exam timetable data come from?",
    answer: "Qz organises timetable information from the university source into a searchable format. Venues can change at short notice, so always confirm important details with your department or official notice board before exam day.",
  },
  {
    id: "8",
    category: "billing",
    categoryLabel: "Plans & billing",
    categoryColor: "text-amber-600",
    question: "Can I use Qz for free?",
    answer: (
      <span>
        Yes. Qz includes a free tier, and you do not need a payment card to begin. Paid plans increase usage and add capabilities for students who need more intensive support. See the{" "}
        <Link href="/pricing" className="font-extrabold text-[#0C60FC] underline">
          pricing page
        </Link>{" "}
        for current options.
      </span>
    ),
  },
  {
    id: "9",
    category: "billing",
    categoryLabel: "Plans & billing",
    categoryColor: "text-amber-600",
    question: "Can I cancel my subscription?",
    answer: (
      <span>
        Yes. You can cancel at any time and retain access until the end of the current billing period. For full details about renewals, credits and refunds, read the{" "}
        <Link href="/terms" className="font-extrabold text-[#0C60FC] underline">
          Terms &amp; Conditions
        </Link>
        .
      </span>
    ),
  },
  {
    id: "10",
    category: "privacy",
    categoryLabel: "Privacy",
    categoryColor: "text-rose-600",
    question: "Who owns the materials I upload?",
    answer: "You do. Your notes and study materials remain your intellectual property. You give Qz limited permission to process them only to provide the study experience you request.",
  },
  {
    id: "11",
    category: "privacy",
    categoryLabel: "Privacy",
    categoryColor: "text-rose-600",
    question: "Are my materials used to train third-party AI models?",
    answer: (
      <span>
        By default, your study materials are not used to train third-party global models. Information may be securely processed by AI providers during your session to produce the requested result. Read the{" "}
        <Link href="/privacy" className="font-extrabold text-[#0C60FC] underline">
          Privacy Policy
        </Link>{" "}
        for details.
      </span>
    ),
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ "1": true });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.question.toLowerCase().includes(query) ||
      (typeof item.answer === "string" && item.answer.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="overflow-x-hidden bg-[#F7F9FC] text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-16 pt-36 lg:pb-24 lg:pt-44">
          <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-7xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.24em] text-[#0C60FC]">
              Help &amp; Answers
            </p>
            <h1 className="display mt-4 text-balance text-5xl font-bold leading-[1.03] tracking-[-.05em] sm:text-6xl">
              Frequently asked questions.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Everything you need to know about Qz, Qubi, subscriptions and study materials.
            </p>

            {/* Search Input */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. billing, exam, pdf, qubi)…"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm outline-none shadow-sm transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "All questions" },
                { id: "getting-started", label: "Getting started" },
                { id: "qubi", label: "Studying with Qubi" },
                { id: "timetable", label: "Timetable" },
                { id: "billing", label: "Plans & billing" },
                { id: "privacy", label: "Privacy" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${
                    selectedCategory === cat.id
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-4xl">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm font-semibold text-slate-500">
                No matching questions found. Try a different search term or category.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="flex w-full cursor-pointer items-center justify-between text-left"
                      >
                        <div>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${item.categoryColor}`}>
                            {item.categoryLabel}
                          </span>
                          <span className="mt-1 block text-base font-extrabold text-slate-900">
                            {item.question}
                          </span>
                        </div>
                        <Plus className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-45 text-[#0C60FC]" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600 animate-in fade-in">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Contact Support Banner */}
        <section className="bg-white px-5 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-[32px] bg-[#0C60FC] p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto]" style={{ borderRadius: "32px" }}>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-200">
                Still wondering?
              </p>
              <h2 className="mt-3 text-3xl font-bold">We’re happy to help.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                For account help, billing questions or anything not covered here, contact the BetaForge Labs support team.
              </p>
            </div>
            <a
              href="mailto:support@bflabs.tech"
              className="squishy rounded-2xl bg-white px-6 py-4 text-center text-sm font-extrabold text-[#0C60FC] transition hover:-translate-y-0.5"
            >
              Email support →
            </a>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
