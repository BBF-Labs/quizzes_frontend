"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Send,
  Bug,
  Newspaper,
  Building2,
  MessageSquare,
  Github,
  Twitter,
  Globe,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { QUBI_PEEK_SRC } from "@/lib/constants";

const CHANNELS = [
  {
    icon: MessageSquare,
    accent: "text-[#0C60FC]",
    accentStrong: "bg-blue-50",
    label: "General & support",
    email: "support@bflabs.tech",
    desc: "Account help, billing questions, anything about using Qz.",
    responseTime: "Replies within 24 hours on weekdays",
  },
  {
    icon: Bug,
    accent: "text-rose-500",
    accentStrong: "bg-rose-50",
    label: "Bug reports",
    email: "support@bflabs.tech",
    desc: "Found something broken or off? Tell us what happened.",
    responseTime: "Acknowledged within 48 hours",
  },
  {
    icon: Newspaper,
    accent: "text-violet-600",
    accentStrong: "bg-violet-50",
    label: "Press & partnerships",
    email: "press@bflabs.tech",
    desc: "Media requests, story leads, university partnerships.",
    responseTime: "Replies within 2–3 business days",
  },
  {
    icon: Building2,
    accent: "text-emerald-600",
    accentStrong: "bg-emerald-50",
    label: "Data privacy",
    email: "privacy@bflabs.tech",
    desc: "Questions about your data, exports, deletions, GDPR-style rights.",
    responseTime: "Replies within 5 business days",
  },
];

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "bug", label: "Bug report" },
  { value: "billing", label: "Billing & subscription" },
  { value: "account", label: "Account & access" },
  { value: "press", label: "Press / partnership" },
  { value: "privacy", label: "Privacy & data" },
  { value: "other", label: "Something else" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    const label = CATEGORIES.find((c) => c.value === category)?.label ?? "Message";
    const subject = `[Qz contact] ${label}`;
    const body =
      `Name: ${name || "(not provided)"}\n` +
      `Email: ${email}\n` +
      `Category: ${label}\n\n` +
      `${message}\n\n` +
      `--\nSent from the Qz contact page.`;

    window.location.href =
      `mailto:support@bflabs.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Hero — same header shape as the donate page */}
        <section className="soft-grid relative overflow-hidden px-5 pb-24 pt-32 lg:pt-40">
          <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />
          <div className="pointer-events-none absolute right-12 top-28 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: -8, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.5 }}
              className="qubi-sticker relative"
            >
              <span className="hand absolute -left-32 top-2 hidden w-28 -rotate-6 text-xl leading-5 text-[#0C60FC] sm:block">
                we&apos;re listening ↘
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_PEEK_SRC}
                alt="Qubi peeking to say hi"
                className="h-28 w-28 object-contain"
              />
            </motion.div>
          </div>

          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              Contact / BetaForge Labs
            </p>
            <h1 className="display mt-4 max-w-4xl text-balance text-4xl font-bold leading-[1.07] tracking-[-.04em] sm:text-6xl">
              Real humans,<br />
              <span className="scribble">real replies.</span>
            </h1>
            <p className="hand mt-3 max-w-xl text-2xl text-[#0C60FC]">
              we read every message ✦
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Support, bug reports, press, partnerships, privacy — pick the
              channel that fits and we&apos;ll point you to the right inbox.
              Most messages get a reply within a day.
            </p>
          </div>
        </section>

        {/* Channel grid */}
        <section className="px-5 pb-20 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {CHANNELS.map((c) => (
                <a
                  key={c.label}
                  href={`mailto:${c.email}?subject=${encodeURIComponent("[Qz contact]")}`}
                  className="play-card group block rounded-[24px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-50"
                  style={{ borderRadius: "24px" }}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.accentStrong} ${c.accent}`}
                  >
                    <c.icon className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-base font-extrabold text-slate-950">
                    {c.label}
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    {c.desc}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className={`text-[11px] font-extrabold ${c.accent}`}>
                      {c.email}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0C60FC]" />
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    <Clock className="h-3 w-3" /> {c.responseTime}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Form + sidebar */}
        <section className="px-5 pb-24 lg:pb-32">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr]">
            {/* Form card */}
            <div
              className="play-card rounded-[28px] border border-slate-200 bg-white p-7 lg:p-9"
              style={{ borderRadius: "28px" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#0C60FC]">
                    Send a message
                  </p>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                    Tell us what&apos;s on your mind.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Fills out your mail client pre-addressed to our team —
                    nothing is sent from this page.
                  </p>
                </div>
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0C60FC] sm:flex">
                  <Send className="h-5 w-5" strokeWidth={2.25} />
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-extrabold">
                      Your name{" "}
                      <span className="font-medium text-slate-400">· optional</span>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ama Mensah"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-extrabold">
                      Your email <span className="font-medium text-rose-500">· required</span>
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-extrabold">
                    What&apos;s it about?
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-extrabold">
                    Your message <span className="font-medium text-rose-500">· required</span>
                  </span>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="The more detail you share, the faster we can help."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <button
                  type="submit"
                  className="squishy mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
                >
                  {sent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Opening your mail client…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send to support
                    </>
                  )}
                </button>

                {sent && (
                  <p className="text-center text-[11px] font-semibold text-emerald-600">
                    If your mail client didn&apos;t open, email us directly at{" "}
                    <a
                      href="mailto:support@bflabs.tech"
                      className="underline underline-offset-2"
                    >
                      support@bflabs.tech
                    </a>
                    .
                  </p>
                )}
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Where we are */}
              <div className="rounded-[24px] border border-slate-200 bg-white p-7">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Where we are
                </p>
                <p className="mt-3 flex items-center gap-2 text-base font-bold text-slate-950">
                  <MapPin className="h-4 w-4 text-[#0C60FC]" />
                  Accra, Ghana
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Built by a small remote team across Accra, Kumasi and Lagos.
                  Office hours: Mon–Fri, 09:00–17:00 GMT.
                </p>
              </div>

              {/* Find us elsewhere */}
              <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-7 text-white">
                <p className="text-xs font-extrabold uppercase tracking-widest text-blue-300">
                  Find us elsewhere
                </p>
                <p className="mt-3 text-base font-bold">
                  We&apos;re loud on the internet.
                </p>
                <div className="mt-5 space-y-2">
                  <a
                    href="https://x.com/bflabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="squishy flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:border-white/30 hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <Twitter className="h-4 w-4" /> @bflabs on X
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="https://github.com/bflabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="squishy flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:border-white/30 hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <Github className="h-4 w-4" /> bflabs on GitHub
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="https://bflabs.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="squishy flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:border-white/30 hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4" /> bflabs.tech
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* In-app nudge */}
              <div className="rounded-[24px] border border-[#DFFF61] bg-[#E9FFD3] p-7">
                <Sparkles className="h-5 w-5 text-[#0C60FC]" />
                <p className="mt-3 text-base font-bold text-slate-950">
                  Already on Qz?
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  For account-specific questions, open the in-app help widget —
                  we can pull up your session details instantly.
                </p>
                <Link
                  href="/app"
                  className="squishy mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
                >
                  Open the app <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
