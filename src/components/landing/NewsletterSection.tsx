"use client";

import { useState } from "react";
import { useSubscribeNewsletter } from "@/hooks/marketing/use-newsletter";
import { Loader2 } from "lucide-react";
import { QUBI_STUDY_SRC } from "@/lib/constants";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");

  const subscribeMutation = useSubscribeNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setFeedback("");
    try {
      await subscribeMutation.mutateAsync(email.trim());
      setSubmitted(true);
      setEmail("");
      setFeedback("You're subscribed! Check your inbox to confirm.");
      setTimeout(() => {
        setSubmitted(false);
        setFeedback("");
      }, 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Subscription failed. Try again.";
      setFeedback(msg);
    }
  };

  return (
    <section id="newsletter" className="px-5 pt-20">
      <div
        className="relative mx-auto max-w-7xl overflow-visible rounded-[32px] border border-blue-100 bg-[#F1F6FF] px-6 py-10 sm:px-10 lg:px-14 lg:py-12"
        style={{ borderRadius: "32px" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#DFFF61]/60 blur-3xl" />
        <div className="qubi-sticker absolute -right-2 -top-16 hidden sm:block">
          <span className="hand absolute -left-24 top-3 w-28 -rotate-6 text-xl leading-5 text-[#0C60FC]">
            tiny notes, big wins ↘
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QUBI_STUDY_SRC}
            alt="Qubi writing down study tips"
            className="qubi-study h-24 w-24 object-contain"
          />
        </div>
        <div
          className="relative grid items-center gap-8 overflow-hidden rounded-[24px] lg:grid-cols-[1fr_.9fr]"
          style={{ borderRadius: "24px" }}
        >
          <div>
            <p className="hand text-2xl text-[#0C60FC]">
              good notes, straight to your inbox ✦
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              The smarter-study newsletter.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Fresh study tips, useful resources and product updates — thoughtfully packed, never spammy.
            </p>
          </div>
          <div>
            <form
              className="rounded-2xl bg-white p-2 shadow-[0_12px_35px_rgba(12,96,252,.12)] ring-1 ring-slate-200"
              onSubmit={handleSubmit}
              aria-label="Newsletter signup"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#0C60FC]/20"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="squishy shrink-0 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0C60FC] disabled:opacity-70"
                >
                  {subscribeMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" /> Subscribing…
                    </span>
                  ) : submitted ? (
                    "Joined! ✓"
                  ) : (
                    "Join the newsletter →"
                  )}
                </button>
              </div>
            </form>
            {feedback && (
              <p
                className={`mt-2 text-xs font-bold ${
                  submitted ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {feedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
