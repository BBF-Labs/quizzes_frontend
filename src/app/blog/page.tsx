"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { useSubscribeNewsletter } from "@/hooks/marketing/use-newsletter";
import { Loader2 } from "lucide-react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [feedback, setFeedback] = useState("");

  const subscribeMutation = useSubscribeNewsletter();

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setFeedback("");
    try {
      await subscribeMutation.mutateAsync(email.trim());
      setSubscribed(true);
      setEmail("");
      setFeedback("Subscribed! Check your inbox to confirm.");
      setTimeout(() => {
        setSubscribed(false);
        setFeedback("");
      }, 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Subscription failed.";
      setFeedback(msg);
    }
  };

  return (
    <div className="overflow-x-hidden bg-[#F7F9FC] text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Header Hero */}
        <section className="soft-grid px-5 pb-20 pt-36 lg:pt-44">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
                  The Qz Journal
                </p>
                <h1 className="mt-5 max-w-3xl display text-5xl font-bold leading-[1.03] tracking-[-.05em] sm:text-7xl">
                  Study smarter.<br />
                  <span className="text-[#0C60FC]">Build what matters.</span>
                </h1>
              </div>
              <p className="max-w-sm text-base leading-7 text-slate-600">
                Practical study systems, exam strategy, product notes and stories from students building the future of African universities.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                All stories
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("strategy")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === "strategy"
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                Study strategy
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("product")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === "product"
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                Product notes
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("campus")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === "campus"
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                Campus stories
              </button>
            </div>
          </div>
        </section>

        {/* Featured Post & Grid */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl">
            {/* Featured Post */}
            <article className="grid overflow-hidden rounded-[32px] bg-slate-950 text-white lg:grid-cols-[1.15fr_.85fr]" style={{ borderRadius: "32px" }}>
              <div className="p-7 sm:p-10">
                <span className="rounded-full bg-[#DFFF61] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                  Featured · Study strategy
                </span>
                <h2 className="mt-7 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                  The 7-day exam reset: how to stop revising everything at once
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                  A calmer system for turning one overwhelming exam week into seven focused days—without pretending every topic matters equally.
                </p>
                <div className="mt-8 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0C60FC] text-white">
                    QZ
                  </span>
                  <span>Qz Learning Team · 8 min read</span>
                </div>
              </div>
              <div className="relative flex min-h-80 items-center justify-center overflow-hidden bg-[#0C60FC] p-8">
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#DFFF61]/30 blur-2xl" />
                <div className="relative w-full max-w-xs rotate-2 rounded-[24px] bg-white p-5 text-slate-950 shadow-2xl">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">7-day reset</p>
                  <div className="mt-5 space-y-2">
                    <div className="rounded-xl bg-blue-50 p-3 text-xs font-bold">Day 1 · Map the gaps</div>
                    <div className="rounded-xl bg-violet-50 p-3 text-xs font-bold">Day 2–4 · Active practice</div>
                    <div className="rounded-xl bg-[#E9FFD3] p-3 text-xs font-bold">Day 5–6 · Mock &amp; repair</div>
                    <div className="rounded-xl bg-amber-50 p-3 text-xs font-bold">Day 7 · Calm recall</div>
                  </div>
                </div>
              </div>
            </article>

            {/* Post Grid */}
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <article className="play-card flex flex-col rounded-[26px] border border-slate-200 bg-white p-6" style={{ borderRadius: "26px" }}>
                <div className="h-40 rounded-2xl bg-blue-50 p-5">
                  <span className="text-5xl font-bold text-blue-200">01</span>
                  <div className="mt-7 h-2 rounded-full bg-blue-100">
                    <div className="h-full w-3/4 rounded-full bg-[#0C60FC]" />
                  </div>
                </div>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-wider text-[#0C60FC]">
                  Study strategy
                </p>
                <h2 className="mt-2 text-xl font-bold">Active recall works. Here’s how to actually use it.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Turn notes into questions, schedule your next review and know when a topic is truly done.
                </p>
                <p className="mt-auto pt-6 text-[11px] font-bold text-slate-400">6 min read · April 18</p>
              </article>

              <article className="play-card flex flex-col rounded-[26px] border border-slate-200 bg-white p-6" style={{ borderRadius: "26px" }}>
                <div className="relative h-40 overflow-hidden rounded-2xl bg-violet-50">
                  <div className="absolute left-8 right-8 top-9 rotate-3 rounded-xl bg-violet-200 p-5" />
                  <div className="absolute left-8 right-8 top-8 -rotate-2 rounded-xl bg-white p-5 shadow-lg">
                    <p className="text-[9px] font-bold text-violet-500">CARD 12 OF 84</p>
                    <p className="mt-3 text-center text-xs font-bold">What should you review next?</p>
                  </div>
                </div>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-wider text-violet-600">
                  Product notes
                </p>
                <h2 className="mt-2 text-xl font-bold">Why Qubi now waits for proof of mastery</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The design thinking behind verification gates, adaptive difficulty and fewer false wins.
                </p>
                <p className="mt-auto pt-6 text-[11px] font-bold text-slate-400">4 min read · April 11</p>
              </article>

              <article className="play-card flex flex-col rounded-[26px] border border-slate-200 bg-white p-6" style={{ borderRadius: "26px" }}>
                <div className="flex h-40 items-center justify-center rounded-2xl bg-[#E9FFD3]">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">AM</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-200 text-xs font-bold">KA</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-xs font-bold">ES</span>
                  </div>
                </div>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Campus stories
                </p>
                <h2 className="mt-2 text-xl font-bold">What 40 late-night study rooms taught us</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Accountability beats motivation, and other patterns from students who keep showing up.
                </p>
                <p className="mt-auto pt-6 text-[11px] font-bold text-slate-400">7 min read · April 3</p>
              </article>
            </div>
          </div>
        </section>

        {/* Newsletter Box */}
        <section className="bg-white px-5 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-[30px] bg-[#E9FFD3] p-8 sm:p-10 lg:grid-cols-[1fr_.8fr]" style={{ borderRadius: "30px" }}>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-lime-800">
                The useful email
              </p>
              <h2 className="mt-3 text-3xl font-bold">One smart study note each week.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                No noise. Just practical ideas and new Qz tools worth trying.
              </p>
            </div>
            <div>
              <form onSubmit={handleNewsletter} className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-sm sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="squishy shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-70"
                >
                  {subscribeMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Subscribing…
                    </span>
                  ) : subscribed ? (
                    "Joined! ✓"
                  ) : (
                    "Join the list →"
                  )}
                </button>
              </form>
              {feedback && (
                <p className={`mt-2 text-xs font-bold ${subscribed ? "text-emerald-700" : "text-rose-600"}`}>
                  {feedback}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
