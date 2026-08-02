"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { LOGO_SRC, QUBI_RUN_SRC } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { useSubscribeNewsletter } from "@/hooks/marketing/use-newsletter";

export function LandingFooter() {
  const { user, isLoading } = useAuth();
  // Show the CTA block only to logged-out visitors; hide it once we know
  // the user is signed in (no point pitching "Start studying free" to
  // someone already in the app). While auth state is hydrating we
  // default to hidden to avoid flashing the CTA on, then off.
  const showCta = !isLoading && !user;

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState("");
  const subscribeMutation = useSubscribeNewsletter();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterFeedback("");
    try {
      await subscribeMutation.mutateAsync(newsletterEmail.trim());
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
      setNewsletterFeedback("You're subscribed! Check your inbox to confirm.");
      setTimeout(() => {
        setNewsletterSubmitted(false);
        setNewsletterFeedback("");
      }, 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Subscription failed. Try again.";
      setNewsletterFeedback(msg);
    }
  };

  return (
    <footer className="px-3 pb-3">
      <div
        className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 pb-7 pt-12 text-white sm:px-10 lg:px-14"
        style={{ borderRadius: "32px" }}
      >
        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#0C60FC]/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          {showCta ? (
            <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
              <div>
                <p className="hand text-3xl text-[#DFFF61]">your comeback starts here</p>
                <h2 className="mt-2 max-w-3xl text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  Tired of feeling behind?
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Bring your syllabus. Qz will help you turn it into a plan you can actually finish.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="squishy rounded-2xl bg-[#DFFF61] px-6 py-4 text-center text-sm font-extrabold text-slate-950"
                  >
                    Start studying free →
                  </Link>
                  <a
                    href="#features"
                    className="rounded-2xl border border-white/15 px-6 py-4 text-center text-sm font-extrabold text-white hover:bg-white/5"
                  >
                    See what Qz can do
                  </a>
                </div>
              </div>
              <div className="relative hidden h-52 lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_RUN_SRC}
                  alt="Qubi running toward the next study session"
                  className="qubi-run absolute -bottom-12 right-8 h-64 w-64 object-contain"
                />
                <span className="hand absolute right-56 top-3 -rotate-6 text-2xl text-blue-300">
                  race you inside! ↘
                </span>
              </div>
            </div>
          ) : (
            // Logged-in visitors — skip the pitch copy and the divider
            // entirely so mobile doesn't reserve empty space for a hidden
            // decoration. The Qubi image is desktop-only via lg:block.
            <div className="relative hidden h-44 lg:ml-auto lg:block lg:pb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_RUN_SRC}
                alt="Qubi running toward the next study session"
                className="qubi-run absolute -bottom-12 right-8 h-56 w-56 object-contain"
              />
            </div>
          )}

          {/* Compact newsletter signup — same useSubscribeNewsletter
              hook as the landing NewsletterSection, sized for a small
              column under the social icons rather than a full card. */}
          <div className={`grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,1fr)] ${showCta ? "pt-0" : "pt-2"}`}>
            <div>
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LOGO_SRC} alt="Qz" className="h-10 w-10 object-contain" />
                </span>
                <div>
                  <p className="display text-xl font-bold">Qz</p>
                  <p className="text-[10px] font-semibold text-slate-500">by BetaForge Labs</p>
                </div>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
                Study smarter. Know your rank. Master it all.
              </p>
              <div className="mt-5 flex gap-2">
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-xs font-bold hover:bg-white/15"
                >
                  in
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-xs font-bold hover:bg-white/15"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-xs font-bold hover:bg-white/15"
                >
                  ◎
                </a>
              </div>
              <form
                className="mt-6 w-full rounded-2xl bg-white p-2 shadow-[0_12px_35px_rgba(12,96,252,.12)] ring-1 ring-slate-200 lg:max-w-xs"
                onSubmit={handleNewsletterSubmit}
                aria-label="Footer newsletter signup"
              >
                <label
                  htmlFor="footer-newsletter-email"
                  className="hand block text-base leading-5 text-[#0C60FC]"
                >
                  good notes, straight to your inbox ✦
                </label>
                <div className="mt-2 flex flex-row gap-2">
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
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
                    ) : newsletterSubmitted ? (
                      "Joined! ✓"
                    ) : (
                      "Join the newsletter →"
                    )}
                  </button>
                </div>
              </form>
              {newsletterFeedback && (
                <p
                  className={`mt-2 text-xs font-bold lg:max-w-xs ${
                    newsletterSubmitted ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {newsletterFeedback}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">Product</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <Link href="/#features" className="block hover:text-white">Study tools</Link>
                <Link href="/study-rooms" className="block hover:text-white">Study rooms</Link>
                <Link href="/library" className="block hover:text-white">Public library</Link>
                <Link href="/pricing" className="block hover:text-white">Pricing</Link>
                <Link href="/donate" className="block hover:text-white">Donate</Link>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">Study</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <Link href="/quizzes" className="block hover:text-white">Quizzes</Link>
                <Link href="/library" className="block hover:text-white">Flashcards</Link>
                <Link href="/library" className="block hover:text-white">Mind maps</Link>
                <Link href="/timetable" className="block hover:text-white">Exam timetable</Link>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">Company</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <Link href="/about" className="block hover:text-white">About Qz</Link>
                <Link href="/blog" className="block hover:text-white">Blog</Link>
                <Link href="/faq" className="block hover:text-white">FAQ</Link>
                <a href="mailto:support@bflabs.tech" className="block hover:text-white">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">Legal</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <Link href="/privacy" className="block hover:text-white">Privacy</Link>
                <Link href="/terms" className="block hover:text-white">Terms</Link>
                <Link href="/login" className="block hover:text-white">Log in</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Qz · BetaForge Labs. All rights reserved.</p>
            <p>Made for students who want clarity, not chaos.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
