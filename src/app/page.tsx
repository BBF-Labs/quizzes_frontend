"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrganizationJsonLd, WebAppJsonLd } from "@/components/common";
import { LandingHeader, LandingFooter, MobileNav, NewsletterSection, DonationSection } from "@/components/landing";
import { LOGO_SRC, QUBI_WAVE_SRC, QUBI_PEEK_SRC } from "@/lib/constants";

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = document.querySelectorAll(
      "main section > div, main article, footer > div"
    );
    revealTargets.forEach((el, index) => {
      (el as HTMLElement).classList.add("motion-reveal");
      (el as HTMLElement).style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    });

    if (!reduceMotion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          }),
        { threshold: 0.08, rootMargin: "0px 0px -40px" }
      );
      revealTargets.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    } else {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      setTimeout(() => setNewsletterSubmitted(false), 3000);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <OrganizationJsonLd />
      <WebAppJsonLd />

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-20 pt-32 lg:pb-28 lg:pt-40">
          <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#0C60FC]" /> Built around your actual university syllabus
                </div>
                <h1 className="display text-balance text-5xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                  Know what to study.<br />
                  <span className="text-[#0C60FC]">Master it.</span> Move on.
                </h1>
                <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-[#0C60FC] lg:mx-0">
                  finally, studying that makes sense ↓
                </p>
                <p className="mx-auto mt-4 max-w-xl text-balance text-lg leading-8 text-slate-600 lg:mx-0">
                  Qz turns your syllabus, lecture notes and weak spots into a clear study path — with every tool you need to learn, practise and feel ready.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href="/signup"
                    className="group squishy flex items-center justify-center gap-2 rounded-2xl bg-[#0C60FC] px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Try Qz free <span className="transition group-hover:translate-x-1">→</span>
                  </Link>
                  <a
                    href="#how"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white">▶</span> See how it works
                  </a>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 lg:justify-start">
                  <span className="flex items-center gap-1.5">
                    <b className="text-emerald-500">✓</b> Free to start
                  </span>
                  <span className="flex items-center gap-1.5">
                    <b className="text-emerald-500">✓</b> No card needed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <b className="text-emerald-500">✓</b> Works on any device
                  </span>
                </div>
              </div>

              {/* Student Dashboard Mockup Card - rounded-[28px] & rounded-[22px] */}
              <div className="relative mx-auto w-full max-w-2xl">
                <div className="blue-glow overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2.5 sm:p-3" style={{ borderRadius: "28px" }}>
                  <div className="rounded-[22px] bg-[#F5F7FB] p-3 sm:p-5" style={{ borderRadius: "22px" }}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={LOGO_SRC} alt="" className="h-8 w-8 object-contain" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today</p>
                          <p className="text-sm font-extrabold">Good afternoon, Ama</p>
                        </div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFFF61] text-xs font-extrabold">
                        AK
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1.45fr_.75fr]">
                      <div className="rounded-2xl bg-[#0C60FC] p-5 text-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-blue-100">Your next best move</p>
                            <h3 className="mt-2 text-xl font-bold">Algorithms · Lecture 03</h3>
                          </div>
                          <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold">14 min</span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-blue-100">
                          You’re almost there. Let’s tighten up Big-O notation before moving on.
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                          <Link
                            href="/signup"
                            className="rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-700"
                          >
                            Start quick quiz
                          </Link>
                          <span className="text-[11px] font-semibold text-blue-100">6 questions</span>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Weekly goal</span>
                          <span className="text-xs font-extrabold text-[#0C60FC]">82%</span>
                        </div>
                        <div className="mt-5 flex justify-center">
                          <div
                            className="relative flex h-24 w-24 items-center justify-center rounded-full"
                            style={{ background: "conic-gradient(#0C60FC 0 82%, #E8EDF5 82%)" }}
                          >
                            <div className="flex h-18 w-18 flex-col items-center justify-center rounded-full bg-white">
                              <b className="text-xl">4.1h</b>
                              <span className="text-[9px] text-slate-400">of 5h</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-center text-[10px] font-semibold text-slate-400">
                          One more session to go
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2.5">
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mastery</p>
                        <p className="mt-1 text-lg font-extrabold">74%</p>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                          <div className="h-full w-3/4 rounded-full bg-[#0C60FC]" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Class rank</p>
                        <p className="mt-1 text-lg font-extrabold">#12</p>
                        <p className="mt-2 text-[9px] font-bold text-emerald-500">↑ 4 this week</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Study streak</p>
                        <p className="mt-1 text-lg font-extrabold">🔥 8 days</p>
                        <p className="mt-2 text-[9px] font-semibold text-slate-400">Personal best</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qubi Popover */}
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl sm:absolute sm:-bottom-12 sm:-left-7 sm:mt-0">
                  <div className="qubi-cycle flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_WAVE_SRC}
                      alt="Qubi, the Qz study companion, waving"
                      className="qubi-bob h-16 w-16 object-contain"
                    />
                  </div>
                  <div className="pr-3">
                    <p className="hand text-lg leading-none text-[#0C60FC]">Nice one, Ama!</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Big-O is looking stronger.</p>
                  </div>
                </div>

                <div className="absolute -right-4 -top-8 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
                  <p className="text-[10px] font-bold text-slate-400">NEXT EXAM</p>
                  <p className="text-sm font-extrabold">18 days · Algorithms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Marquee */}
        <section className="border-y border-slate-200 bg-white py-5" aria-label="Universities using Qz">
          <div className="mx-auto max-w-7xl">
            <div className="campus-marquee overflow-hidden">
              <div className="campus-track flex w-max items-center gap-3 px-3">
                <div className="campus-set flex items-center gap-3" aria-label="Featured universities">
                  <div className="campus-logo"><span className="bg-[#7A0019] text-white">UG</span><b>University of Ghana</b></div>
                  <div className="campus-logo"><span className="bg-[#F4C300] text-slate-950">K</span><b>KNUST</b></div>
                  <div className="campus-logo"><span className="bg-[#17365D] text-white">UC</span><b>University of Cape Coast</b></div>
                  <div className="campus-logo"><span className="bg-[#A6192E] text-white">A</span><b>Ashesi University</b></div>
                  <div className="campus-logo"><span className="bg-[#145DA0] text-white">GI</span><b>GIMPA</b></div>
                  <div className="campus-logo"><span className="bg-[#0C60FC] text-white">UP</span><b>UPSA</b></div>
                </div>
                <div className="campus-set flex items-center gap-3" aria-hidden="true">
                  <div className="campus-logo"><span className="bg-[#7A0019] text-white">UG</span><b>University of Ghana</b></div>
                  <div className="campus-logo"><span className="bg-[#F4C300] text-slate-950">K</span><b>KNUST</b></div>
                  <div className="campus-logo"><span className="bg-[#17365D] text-white">UC</span><b>University of Cape Coast</b></div>
                  <div className="campus-logo"><span className="bg-[#A6192E] text-white">A</span><b>Ashesi University</b></div>
                  <div className="campus-logo"><span className="bg-[#145DA0] text-white">GI</span><b>GIMPA</b></div>
                  <div className="campus-logo"><span className="bg-[#0C60FC] text-white">UP</span><b>UPSA</b></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section - rounded-[28px] */}
        <section id="why" className="relative px-5 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="relative mx-auto max-w-3xl text-center">
              <p className="hand hand-wiggle text-3xl text-[#0C60FC]">less chaos, more clarity ✦</p>
              <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Studying hard isn’t the problem.<br />
                Studying <span className="text-[#0C60FC]">without direction</span> is.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Qz connects the scattered parts of university life and turns them into one simple, personalized plan.
              </p>
              <div className="qubi-sticker absolute -right-48 -top-10 hidden xl:block">
                <span className="qubi-spark absolute -left-4 top-2 text-xl text-[#0C60FC]">✦</span>
                <span className="qubi-spark absolute right-0 top-8 text-sm text-[#DFFF61]">✦</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_WAVE_SRC}
                  alt="Qubi pointing toward the next study step"
                  className="qubi-bob h-32 w-32 object-contain"
                />
                <span className="hand absolute -right-12 top-24 w-32 -rotate-6 text-xl leading-5 text-[#0C60FC]">
                  I found your next step! ↙
                </span>
              </div>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              <article className="play-card rounded-[28px] border border-slate-200 bg-[#FFF8EF] p-7" style={{ borderRadius: "28px" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE6CC] text-xl">🗂️</div>
                <h3 className="mt-8 text-xl font-bold">Everything in one place</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Courses, lecture notes, quizzes, exam dates and progress — organized around your degree.
                </p>
              </article>
              <article className="play-card rounded-[28px] border border-slate-200 bg-[#F1F6FF] p-7" style={{ borderRadius: "28px" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-200 text-xl">🎯</div>
                <h3 className="mt-8 text-xl font-bold">Always know what’s next</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Qz spots the gaps, prioritizes the right topics and builds your next study session for you.
                </p>
              </article>
              <article className="play-card rounded-[28px] border border-slate-200 bg-[#F7F4FF] p-7" style={{ borderRadius: "28px" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DED7FF] text-xl">📈</div>
                <h3 className="mt-8 text-xl font-bold">See real progress</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Track mastery, compare your rank and walk into exams knowing exactly where you stand.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Feature Flow Section - rounded-[30px] */}
        <section id="features" className="bg-[#F7F9FC] px-5 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="hand hand-wiggle text-3xl text-[#0C60FC]">your whole study flow ↘</p>
                <h2 className="mt-2 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                  From feeling lost to <span className="scribble">I’ve got this.</span>
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-slate-600">
                Not another folder of AI tools. One connected workspace that learns how you learn.
              </p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-12">
              <article className="card-shadow play-card overflow-hidden rounded-[30px] border border-slate-200 bg-white p-7 lg:col-span-7" style={{ borderRadius: "30px" }}>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  Adaptive quizzes
                </span>
                <h3 className="mt-5 text-2xl font-bold">
                  Practice the parts you haven’t mastered — not the parts you already know.
                </h3>
                <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold text-slate-400">QUESTION 4 OF 8 · DATA STRUCTURES</p>
                  <p className="mt-3 font-bold">Which structure follows Last In, First Out?</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold">
                    <span className="rounded-xl border border-slate-200 bg-white p-3">A. Queue</span>
                    <span className="rounded-xl border-2 border-[#0C60FC] bg-blue-50 p-3 text-blue-700">B. Stack ✓</span>
                    <span className="rounded-xl border border-slate-200 bg-white p-3">C. Tree</span>
                    <span className="rounded-xl border border-slate-200 bg-white p-3">D. Graph</span>
                  </div>
                </div>
              </article>
              <article className="play-card relative overflow-hidden rounded-[30px] bg-[#0C60FC] p-7 text-white lg:col-span-5" style={{ borderRadius: "30px" }}>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider">
                  Know your rank
                </span>
                <h3 className="mt-5 text-2xl font-bold">Clear performance. No guesswork.</h3>
                <p className="mt-3 text-sm leading-6 text-blue-100">
                  See your mastery by course, topic and cohort — without confusing dashboards.
                </p>
                <div className="mt-8 flex items-end gap-3">
                  <div>
                    <p className="text-5xl font-bold">#12</p>
                    <p className="mt-2 text-xs text-blue-100">of 184 in your course</p>
                  </div>
                  <span className="mb-1 rounded-lg bg-[#DFFF61] px-2.5 py-1 text-xs font-extrabold text-slate-900">
                    ↑ 4 places
                  </span>
                </div>
                <div className="mt-7 flex h-24 items-end gap-2">
                  <i className="h-[35%] flex-1 rounded-t-lg bg-white/20" />
                  <i className="h-[48%] flex-1 rounded-t-lg bg-white/25" />
                  <i className="h-[43%] flex-1 rounded-t-lg bg-white/30" />
                  <i className="h-[68%] flex-1 rounded-t-lg bg-white/50" />
                  <i className="h-[82%] flex-1 rounded-t-lg bg-[#DFFF61]" />
                </div>
              </article>
              <article className="play-card rounded-[30px] border border-slate-200 bg-white p-7 lg:col-span-4" style={{ borderRadius: "30px" }}>
                <div className="text-2xl">🗓️</div>
                <h3 className="mt-5 text-xl font-bold">Exam plan, handled</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your timetable becomes a realistic plan with reminders at the right time.
                </p>
                <div className="mt-6 rounded-2xl bg-[#FFF8EF] p-4">
                  <p className="text-[10px] font-bold text-amber-700">NEXT UP · 18 DAYS</p>
                  <p className="mt-1 font-bold">DCIT 205 Algorithms</p>
                  <p className="text-xs text-slate-500">Mon 12 Jan · 9:00 AM</p>
                </div>
              </article>
              <article className="play-card rounded-[30px] border border-slate-200 bg-white p-7 lg:col-span-4" style={{ borderRadius: "30px" }}>
                <div className="text-2xl">🧠</div>
                <h3 className="mt-5 text-xl font-bold">Memory that adapts</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Qz remembers what you forget and brings it back before it slips away.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span>Big-O notation</span>
                    <b className="text-amber-600">Review today</b>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span>Binary trees</span>
                    <b className="text-emerald-600">Mastered</b>
                  </div>
                </div>
              </article>
              <article className="play-card relative overflow-hidden rounded-[30px] border border-slate-200 bg-[#E9FFD3] p-7 lg:col-span-4" style={{ borderRadius: "30px" }}>
                <div className="text-2xl">👋</div>
                <h3 className="mt-5 text-xl font-bold">Find your study people</h3>
                <p className="mt-2 max-w-[75%] text-sm leading-6 text-slate-600">
                  Match with peers who complement your strengths, share your courses and actually show up.
                </p>
                <div className="mt-6 flex -space-x-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-200 text-xs font-bold">KA</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-violet-200 text-xs font-bold">EM</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-200 text-xs font-bold">JO</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_PEEK_SRC}
                  alt="Qubi peeking into a study group"
                  className="qubi-peek absolute -bottom-4 -right-2 h-28 w-28 object-contain"
                />
                <span className="hand absolute right-3 top-4 -rotate-6 text-lg text-[#0C60FC]">
                  found your crew!
                </span>
              </article>
            </div>
          </div>
        </section>

        {/* Connected Ecosystem - rounded-[26px] */}
        <section className="overflow-hidden px-5 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="hand text-3xl text-[#0C60FC]">one app. your whole semester.</p>
              <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Every way you study, connected.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Start with a lecture, a document or a topic. Qz turns it into the right study experience — and keeps everything in sync.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">⏱️</span>
                  <span className="text-xs font-bold text-slate-300">01</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Study sessions</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Focused sessions that pick the right activity, time and difficulty for you.
                </p>
                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 text-white">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#DFFF61" strokeWidth="4" strokeLinecap="round" strokeDasharray="92 126" />
                      </svg>
                      <span className="text-[9px] font-bold">73%</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deep focus</p>
                      <p className="font-mono text-lg font-bold">24:59</p>
                    </div>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#DFFF61]" />
                  </div>
                </div>
              </article>

              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">🗂️</span>
                  <span className="text-xs font-bold text-slate-300">02</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Smart flashcards</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Active recall cards made from your material and scheduled before you forget.
                </p>
                <div className="relative mt-auto h-20 pt-5">
                  <div className="absolute inset-x-2 bottom-0 h-14 rotate-2 rounded-xl border border-violet-200 bg-violet-100" />
                  <div className="absolute inset-x-0 bottom-1 h-14 -rotate-1 rounded-xl border border-violet-200 bg-white px-3 py-2 shadow-sm">
                    <div className="flex items-center justify-between text-[8px] font-bold text-violet-500">
                      <span>12 DUE</span>
                      <span>↻ FLIP</span>
                    </div>
                    <p className="mt-1 text-center text-[10px] font-bold">What is a binary tree?</p>
                  </div>
                </div>
              </article>

              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-2xl">🕸️</span>
                  <span className="text-xs font-bold text-slate-300">03</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Visual mind maps</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  See how ideas connect instead of memorising isolated facts.
                </p>
                <div className="relative mt-auto h-24 overflow-hidden rounded-xl bg-gradient-to-br from-lime-50 to-cyan-50">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 220 96" fill="none" aria-hidden="true">
                    <path d="M110 48 49 21M110 48 45 73M110 48l62-28M110 48l65 27" stroke="#94A3B8" strokeWidth="1.5" />
                    <circle cx="110" cy="48" r="15" fill="#0C60FC" />
                    <circle cx="49" cy="21" r="4" fill="#93C5FD" />
                    <circle cx="45" cy="73" r="4" fill="#C4B5FD" />
                    <circle cx="172" cy="20" r="4" fill="#FCD34D" />
                    <circle cx="175" cy="75" r="4" fill="#BEF264" />
                  </svg>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-extrabold text-white">DATA</span>
                  <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-[8px] font-bold shadow-sm">Arrays</span>
                  <span className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 text-[8px] font-bold shadow-sm">Graphs</span>
                  <span className="absolute right-2 top-2 rounded-md bg-white px-2 py-1 text-[8px] font-bold shadow-sm">Stacks</span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-white px-2 py-1 text-[8px] font-bold shadow-sm">Trees</span>
                </div>
              </article>

              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">💬</span>
                  <span className="text-xs font-bold text-slate-300">04</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">AI study partner</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ask questions, simplify a concept or build a quiz — grounded in your course.
                </p>
                <div className="mt-auto space-y-2 pt-5">
                  <div className="ml-7 rounded-xl rounded-br-sm bg-orange-50 px-3 py-2 text-[9px] font-semibold text-slate-700">
                    Explain recursion simply.
                  </div>
                  <div className="mr-5 flex gap-2 rounded-xl rounded-bl-sm bg-slate-950 px-3 py-2 text-[9px] text-white">
                    <span className="text-[#DFFF61]">✦</span>
                    <span>A function solving a smaller version of itself…</span>
                  </div>
                </div>
              </article>

              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl">📝</span>
                  <span className="text-xs font-bold text-slate-300">05</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Quizzes &amp; mock exams</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  From two-minute checks to timed exam simulations with instant explanations.
                </p>
                <div className="mt-auto pt-5">
                  <div className="rounded-xl bg-rose-50 p-3">
                    <div className="flex justify-between text-[8px] font-bold text-rose-500">
                      <span>QUESTION 4/10</span>
                      <span>02:18</span>
                    </div>
                    <p className="mt-2 text-[10px] font-bold">Which answer is correct?</p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 text-[8px] font-semibold">
                      <span className="rounded-md bg-white p-1.5 ring-1 ring-rose-100">A. Queue</span>
                      <span className="rounded-md bg-rose-500 p-1.5 text-white">B. Stack ✓</span>
                    </div>
                  </div>
                </div>
              </article>

              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">📅</span>
                  <span className="text-xs font-bold text-slate-300">06</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Timetable &amp; reminders</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Classes, study blocks and exam reminders in one clean calendar.
                </p>
                <div className="mt-auto pt-5">
                  <div className="grid grid-cols-[32px_1fr] gap-x-2 rounded-xl bg-cyan-50 p-3 text-[8px]">
                    <div className="space-y-2 pt-1 text-slate-400">
                      <p>9 AM</p>
                      <p>11 AM</p>
                      <p>1 PM</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="rounded-md bg-cyan-500 px-2 py-1.5 font-bold text-white">Algorithms lecture</div>
                      <div className="ml-5 rounded-md bg-white px-2 py-1.5 font-bold text-cyan-800 ring-1 ring-cyan-100">Study block</div>
                      <div className="rounded-md bg-[#DFFF61] px-2 py-1.5 font-bold">Quiz reminder</div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="play-card group flex flex-col rounded-[26px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">📊</span>
                  <span className="text-xs font-bold text-slate-300">07</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Course &amp; degree tracker</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Follow every course, credit, prerequisite and mastery score across your degree.
                </p>
                <div className="mt-auto space-y-2 pt-5">
                  <div>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span>Algorithms</span>
                      <span>82%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-amber-100">
                      <div className="h-full w-[82%] rounded-full bg-amber-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span>Databases</span>
                      <span>64%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-amber-100">
                      <div className="h-full w-[64%] rounded-full bg-[#0C60FC]" />
                    </div>
                  </div>
                  <div className="flex justify-between rounded-lg bg-amber-50 px-2 py-1.5 text-[8px] font-bold text-amber-800">
                    <span>18 / 24 credits</span>
                    <span>On track ✓</span>
                  </div>
                </div>
              </article>

              <article className="play-card group rounded-[26px] border border-slate-200 bg-[#DFFF61] p-5 transition hover:-translate-y-1 hover:shadow-xl" style={{ borderRadius: "26px" }}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-2xl">✨</span>
                  <span className="text-xs font-bold text-slate-500">+ MORE</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">Built to work together</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  A quiz can become flashcards. A weak topic can become a session. Progress updates everywhere.
                </p>
                <Link href="/signup" className="mt-5 inline-flex text-xs font-extrabold">
                  Explore Qz →
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Study Rooms Section - rounded-[32px] */}
        <section id="rooms" className="bg-slate-950 px-5 py-24 text-white lg:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="hand text-3xl text-[#DFFF61]">better together ✦</p>
              <h2 className="mt-2 text-balance text-4xl font-bold sm:text-5xl">
                Study rooms that make showing up easier.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
                Join a live room, invite your course mates or lock in solo. Shared timers, goals and quiet accountability keep everyone moving.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold">
                <span className="rounded-full bg-white/10 px-4 py-2">Live focus timers</span>
                <span className="rounded-full bg-white/10 px-4 py-2">Course-based rooms</span>
                <span className="rounded-full bg-white/10 px-4 py-2">Shared streaks</span>
              </div>
              <Link
                href="/signup"
                className="squishy mt-9 inline-flex rounded-2xl bg-[#DFFF61] px-6 py-4 text-sm font-extrabold text-slate-950"
              >
                Find a study room →
              </Link>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/6 p-4 sm:p-6" style={{ borderRadius: "32px" }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold text-[#DFFF61]">LIVE NOW</p>
                  <h3 className="mt-1 text-xl font-bold">Late Night Algorithms</h3>
                </div>
                <span className="rounded-full bg-red-400/15 px-3 py-1.5 text-[10px] font-bold text-red-300">
                  ● 8 studying
                </span>
              </div>
              <div className="grid gap-3 py-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/8 p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-300 font-bold text-slate-900">
                    AM
                  </div>
                  <p className="mt-3 text-xs font-bold">Ama</p>
                  <p className="text-[10px] text-slate-500">45 min focus</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-300 font-bold text-slate-900">
                    KA
                  </div>
                  <p className="mt-3 text-xs font-bold">Kwame</p>
                  <p className="text-[10px] text-slate-500">23 min focus</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-300 font-bold text-slate-900">
                    ES
                  </div>
                  <p className="mt-3 text-xs font-bold">Esi</p>
                  <p className="text-[10px] text-slate-500">31 min focus</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#0C60FC] p-4">
                <div>
                  <p className="text-[10px] font-bold text-blue-200">ROOM GOAL</p>
                  <p className="mt-1 text-sm font-bold">Finish Dynamic Programming</p>
                </div>
                <div className="font-mono text-2xl font-bold">24:59</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - rounded-[28px] */}
        <section id="how" className="px-5 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="hand hand-wiggle text-3xl text-[#0C60FC]">simple by design, seriously ✦</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                Set up once. Qz does the organizing.
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              <div className="play-card relative rounded-[28px] border border-slate-200 p-7" style={{ borderRadius: "28px" }}>
                <span className="display text-5xl font-bold text-blue-100">01</span>
                <h3 className="mt-5 text-xl font-bold">Add your course</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Choose your university and program, then upload your syllabus or lecture notes.
                </p>
                <div className="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-5 text-center text-xs font-bold text-blue-700">
                  ↑ Drop your syllabus here
                </div>
              </div>
              <div className="play-card relative rounded-[28px] border border-slate-200 p-7" style={{ borderRadius: "28px" }}>
                <span className="display text-5xl font-bold text-violet-100">02</span>
                <h3 className="mt-5 text-xl font-bold">Get your study path</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Qz maps every topic, finds your starting point and recommends what to do next.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="rounded-xl bg-[#DFFF61] p-3 text-xs font-bold">1. Complexity analysis</div>
                  <div className="ml-3 rounded-xl bg-slate-100 p-3 text-xs font-bold">2. Sorting algorithms</div>
                  <div className="ml-6 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-400">3. Graph traversal</div>
                </div>
              </div>
              <div className="play-card relative rounded-[28px] border border-slate-200 p-7" style={{ borderRadius: "28px" }}>
                <span className="display text-5xl font-bold text-orange-100">03</span>
                <h3 className="mt-5 text-xl font-bold">Study. Improve. Repeat.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Take quick adaptive sessions, watch your mastery grow and know when you’re exam-ready.
                </p>
                <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-950 p-4 text-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0C60FC] font-bold">
                    86%
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Exam readiness</p>
                    <p className="text-sm font-bold">You’re on track 🎉</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Public Library Section - rounded-[26px] */}
        <section id="explore" className="bg-[#F7F9FC] px-5 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="hand text-3xl text-[#0C60FC]">borrow a head start</p>
                <h2 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">Explore the public library.</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Browse quizzes, flashcard decks, notes and mind maps shared by students and reviewed by the Qz team.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold shadow-sm hover:bg-slate-50"
              >
                Open the library →
              </Link>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <article className="play-card flex rounded-[26px] border border-slate-200 bg-white p-5" style={{ borderRadius: "26px" }}>
                <div className="flex w-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                      OFFICIAL QUIZ
                    </span>
                    <span className="text-slate-300">•••</span>
                  </div>
                  <div className="mt-6 h-40 overflow-hidden rounded-2xl bg-[#0C60FC] p-4 text-white">
                    <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-blue-100">
                      <span>Question 3 of 20</span>
                      <span>01:24</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/20">
                      <div className="h-full w-[15%] rounded-full bg-[#DFFF61]" />
                    </div>
                    <p className="mt-4 text-xs font-bold">Where does glycolysis occur?</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] font-semibold">
                      <span className="rounded-lg bg-white/12 px-2 py-2">Nucleus</span>
                      <span className="rounded-lg bg-[#DFFF61] px-2 py-2 text-slate-950">Cytoplasm ✓</span>
                      <span className="rounded-lg bg-white/12 px-2 py-2">Mitochondria</span>
                      <span className="rounded-lg bg-white/12 px-2 py-2">Ribosome</span>
                    </div>
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Biology · 20 questions
                  </p>
                  <h3 className="mt-2 text-lg font-bold">Cellular Respiration Essentials</h3>
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-slate-500">
                    <span>4.9 ★ · 1.2k takes</span>
                    <span className="font-bold text-slate-900">Take quiz →</span>
                  </div>
                </div>
              </article>

              <article className="play-card flex rounded-[26px] border border-slate-200 bg-white p-5" style={{ borderRadius: "26px" }}>
                <div className="flex w-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-extrabold text-violet-700">
                      FLASHCARDS
                    </span>
                    <span className="text-slate-300">•••</span>
                  </div>
                  <div className="relative mt-6 h-40 overflow-hidden rounded-2xl bg-[#F5F0FF] p-4">
                    <div className="absolute left-8 right-8 top-5 h-28 rotate-3 rounded-xl border border-violet-200 bg-violet-200/60" />
                    <div className="absolute left-8 right-8 top-5 h-28 -rotate-2 rounded-xl border border-violet-200 bg-white p-4 shadow-lg">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-violet-500">
                        Card 12 of 84
                      </span>
                      <p className="mt-3 text-center text-sm font-bold">Marbury v. Madison</p>
                      <p className="mt-1 text-center text-[10px] text-slate-400">Tap to reveal the ruling</p>
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-100 px-2 py-1 text-[8px] font-bold text-violet-700">
                        ↻ FLIP
                      </span>
                    </div>
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Law · 84 cards</p>
                  <h3 className="mt-2 text-lg font-bold">Constitutional Law: Key Cases</h3>
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-slate-500">
                    <span>Saved by 682</span>
                    <span className="font-bold text-slate-900">Study deck →</span>
                  </div>
                </div>
              </article>

              <article className="play-card flex rounded-[26px] border border-slate-200 bg-white p-5 md:col-span-2 lg:col-span-1" style={{ borderRadius: "26px" }}>
                <div className="flex w-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-lime-100 px-3 py-1.5 text-[10px] font-extrabold text-lime-800">
                      MIND MAP
                    </span>
                    <span className="text-slate-300">•••</span>
                  </div>
                  <div className="relative mt-6 h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-lime-50 to-cyan-50">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 160" fill="none" aria-hidden="true">
                      <path d="M150 80 76 38M150 80 66 126M150 80l84-48M150 80l82 48" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
                    </svg>
                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-slate-950 text-center text-[9px] font-extrabold text-white shadow-lg">
                      DATA<br />STRUCTURES
                    </span>
                    <span className="absolute left-4 top-5 rounded-lg bg-blue-100 px-3 py-2 text-[9px] font-bold text-blue-800">Arrays</span>
                    <span className="absolute bottom-4 left-3 rounded-lg bg-violet-100 px-3 py-2 text-[9px] font-bold text-violet-800">Graphs</span>
                    <span className="absolute right-3 top-4 rounded-lg bg-orange-100 px-3 py-2 text-[9px] font-bold text-orange-800">Stacks</span>
                    <span className="absolute bottom-4 right-2 rounded-lg bg-[#DFFF61] px-3 py-2 text-[9px] font-bold text-slate-800">Trees</span>
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Computer Science · Visual guide
                  </p>
                  <h3 className="mt-2 text-lg font-bold">Data Structures at a Glance</h3>
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-slate-500">
                    <span>Updated 2 days ago</span>
                    <span className="font-bold text-slate-900">View map →</span>
                  </div>
                </div>
              </article>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <span className="mr-2 text-slate-400">Popular:</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Medicine</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Computer Science</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Business</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Engineering</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Law</span>
            </div>
          </div>
        </section>

        {/* Timetable Section - rounded-[28px] */}
        <section id="timetable" className="px-5 py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <p className="hand hand-wiggle text-3xl text-[#0C60FC]">never “wait, that exam is when?” again ↘</p>
              <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Your whole semester, <span className="scribble">already planned.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Qz pulls your lecture schedule and exam timetable, fills the gaps with realistic study blocks, and reminds you 7, 3 and 1 day before every paper.
              </p>
              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-lg">🗓️</span>
                  <p className="text-sm font-bold">Classes, labs and study blocks in one week view</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg">⏰</span>
                  <p className="text-sm font-bold">Exam reminders by email and push — on your schedule</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 text-lg">⚠️</span>
                  <p className="text-sm font-bold">Clash and gap warnings before they cost you</p>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="squishy rounded-2xl bg-[#0C60FC] px-6 py-4 text-center text-sm font-extrabold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Check the exam timetable →
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  See it inside Qz
                </Link>
              </div>
              <p className="hand mt-3 text-xl text-[#0C60FC]">the public lookup is free — no account needed</p>
            </div>

            {/* Next Exam Card - rounded-[28px] */}
            <div className="card-shadow play-card rounded-[28px] border border-slate-200 bg-white p-6" style={{ borderRadius: "28px" }}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Next exam</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <h3 className="display text-3xl font-bold">DCIT 205</h3>
                  <p className="text-sm font-semibold text-slate-500">Algorithms</p>
                </div>
                <div className="rounded-2xl bg-[#0C60FC] px-5 py-3 text-center text-white">
                  <p className="text-3xl font-extrabold leading-none">18</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-200">days left</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-[#F7F9FC] p-4">
                  <p className="text-sm font-extrabold">9:00 AM</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Start</p>
                </div>
                <div className="rounded-2xl bg-[#F7F9FC] p-4">
                  <p className="text-sm font-extrabold">2 hours</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                </div>
                <div className="rounded-2xl bg-[#F7F9FC] p-4">
                  <p className="text-sm font-extrabold">Great Hall</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
                <p className="hand text-xl leading-none text-[#0C60FC]">reminders are already set ✓</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className="rounded-full bg-white px-3 py-1.5 text-blue-700 ring-1 ring-blue-200">7 days</span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-blue-700 ring-1 ring-blue-200">3 days</span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-blue-700 ring-1 ring-blue-200">1 day</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0C60FC] text-sm font-bold">72%</span>
                <div>
                  <p className="text-xs text-slate-400">Exam readiness</p>
                  <p className="text-sm font-bold">3 topics left to master</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - rounded-[26px] */}
        <section className="bg-slate-950 px-5 py-24 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-400">Built for students, not robots</p>
                <h2 className="mt-4 text-balance text-4xl font-bold sm:text-5xl">
                  Serious results.<br />A much better vibe.
                </h2>
                <p className="mt-5 max-w-md leading-7 text-slate-400">
                  Qz keeps the rigor, drops the intimidating system-speak and gives you a study companion that feels human.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <blockquote className="rounded-[26px] bg-white/7 p-6" style={{ borderRadius: "26px" }}>
                  <div className="text-[#DFFF61]">★★★★★</div>
                  <p className="mt-4 text-sm leading-7 text-slate-200">
                    “I finally know what to focus on. My revision feels calm now — not like I’m opening ten tabs and hoping.”
                  </p>
                  <footer className="mt-5 text-xs font-bold">Ama · Computer Science</footer>
                </blockquote>
                <blockquote className="rounded-[26px] bg-white/7 p-6" style={{ borderRadius: "26px" }}>
                  <div className="text-[#DFFF61]">★★★★★</div>
                  <p className="mt-4 text-sm leading-7 text-slate-200">
                    “The quizzes caught my weak spots early. I walked into the exam actually knowing I was ready.”
                  </p>
                  <footer className="mt-5 text-xs font-bold">Kojo · Engineering</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <NewsletterSection />

        {/* Pricing Section - rounded-[28px] */}
        <section id="pricing" className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="hand hand-wiggle text-3xl text-[#0C60FC]">student prices, student honesty ✦</p>
              <h2 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">Pick your grind level.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Start free forever. Upgrade for more daily actions, or top up with credits when you just need a push.
              </p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <article className="play-card rounded-[28px] border border-slate-200 bg-white p-7" style={{ borderRadius: "28px" }}>
                <h3 className="display text-xl font-bold">Cooked</h3>
                <p className="mt-1 text-sm text-slate-500">All-nighter mode. One shot.</p>
                <p className="mt-6 flex items-end gap-1">
                  <span className="text-xs font-bold text-slate-400">GHS</span>
                  <span className="display text-4xl font-bold">4.99</span>
                  <span className="mb-1 text-xs font-bold text-slate-400">/ weekly</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2"><b className="text-emerald-500">✓</b> 1 Z session / day</li>
                  <li className="flex gap-2"><b className="text-emerald-500">✓</b> 2 quizzes + 2 flashcard sets / day</li>
                  <li className="flex gap-2"><b className="text-emerald-500">✓</b> Basic analytics</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-7 block rounded-2xl border border-slate-200 py-3.5 text-center text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                >
                  See what’s included
                </Link>
              </article>

              <article className="play-card relative rounded-[28px] bg-[#0C60FC] p-7 text-white shadow-2xl shadow-blue-200" style={{ borderRadius: "28px" }}>
                <span className="absolute -top-3 left-7 rounded-full bg-[#DFFF61] px-3 py-1 text-[10px] font-extrabold text-slate-900">
                  Most popular
                </span>
                <h3 className="display text-xl font-bold">Cruising</h3>
                <p className="mt-1 text-sm text-blue-100">Steady grind. Mid-semester flow.</p>
                <p className="mt-6 flex items-end gap-1">
                  <span className="text-xs font-bold text-blue-200">GHS</span>
                  <span className="display text-4xl font-bold">6.99</span>
                  <span className="mb-1 text-xs font-bold text-blue-200">/ weekly</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-blue-50">
                  <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 3 Z sessions / day</li>
                  <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 5 quizzes + 5 flashcard sets / day</li>
                  <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> Full analytics, PDF export, 10 credits</li>
                </ul>
                <Link
                  href="/signup"
                  className="squishy mt-7 block rounded-2xl bg-white py-3.5 text-center text-sm font-extrabold text-blue-700"
                >
                  Get started
                </Link>
              </article>

              <article className="play-card rounded-[28px] border border-slate-200 bg-white p-7" style={{ borderRadius: "28px" }}>
                <h3 className="display text-xl font-bold">Locked In</h3>
                <p className="mt-1 text-sm text-slate-500">Unlimited. Zero excuses.</p>
                <p className="mt-6 flex items-end gap-1">
                  <span className="text-xs font-bold text-slate-400">GHS</span>
                  <span className="display text-4xl font-bold">9.99</span>
                  <span className="mb-1 text-xs font-bold text-slate-400">/ weekly</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2"><b className="text-emerald-500">✓</b> Unlimited everything</li>
                  <li className="flex gap-2"><b className="text-emerald-500">✓</b> Priority processing</li>
                  <li className="flex gap-2"><b className="text-emerald-500">✓</b> Early features + 25 credits</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-7 block rounded-2xl bg-slate-950 py-3.5 text-center text-sm font-extrabold text-white hover:bg-slate-800"
                >
                  Compare all plans
                </Link>
              </article>
            </div>
            <p className="mx-auto mt-6 max-w-3xl rounded-2xl bg-[#F7F9FC] px-5 py-4 text-center text-xs font-semibold text-slate-500">
              Free tier included — 1 Z session, 2 quizzes, 2 flashcard sets and 1 mind map per day. No card required.{" "}
              <Link href="/signup" className="font-extrabold text-[#0C60FC]">
                Full pricing →
              </Link>
            </p>
          </div>
        </section>

        {/* Donation Section - rounded-[36px] & rounded-[26px] */}
        <section id="donate" className="px-5 pb-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[36px] bg-slate-950 px-6 py-14 text-white sm:px-12 lg:grid-cols-[1.05fr_.95fr]" style={{ borderRadius: "36px" }}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#DFFF61]">Keep Qz free</p>
              <h2 className="mt-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
                Not everyone can pay GHS 4.99 a week.
              </h2>
              <p className="hand mt-3 text-2xl text-[#DFFF61]">so some of us cover the rest ✦</p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
                Donations cover our AI costs and fund free accounts for students who can’t afford a subscription. No perks, no tiers — just keeping the door open.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-[11px] font-extrabold">
                <span className="rounded-full bg-white/10 px-3 py-2">COVER API COSTS</span>
                <span className="rounded-full bg-white/10 px-3 py-2">FUND STUDENT ACCESS</span>
                <span className="rounded-full bg-white/10 px-3 py-2">BUILD BETTER MODELS</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-6 text-sm">
                <div><p className="display text-2xl font-bold">312</p><p className="text-[11px] text-slate-500">students sponsored</p></div>
                <div><p className="display text-2xl font-bold">1,480</p><p className="text-[11px] text-slate-500">supporters</p></div>
                <div><p className="display text-2xl font-bold">68%</p><p className="text-[11px] text-slate-500">goes straight to AI costs</p></div>
              </div>
            </div>
            <div className="rounded-[26px] bg-white p-7 text-slate-900 shadow-2xl" style={{ borderRadius: "26px" }}>
              <p className="text-sm font-extrabold">Support Qz</p>
              <p className="mt-1 text-xs text-slate-500">Give once, any amount. Anonymous if you prefer.</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
                <span className="rounded-xl bg-[#F7F9FC] py-3">GHS 50</span>
                <span className="rounded-xl bg-[#0C60FC] py-3 text-white">GHS 100</span>
                <span className="rounded-xl bg-[#F7F9FC] py-3">GHS 200</span>
              </div>
              <p className="hand mt-4 text-center text-xl text-[#0C60FC]">GHS 50 ≈ one student, one free week</p>
              <Link href="/signup" className="mt-4 block rounded-2xl bg-slate-950 py-3.5 text-center text-sm font-extrabold text-white">
                Donate to Qz →
              </Link>
              <p className="mt-3 text-center text-[10px] text-slate-400">Can’t give? Sharing Qz with your class helps just as much.</p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner - rounded-[36px] */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-6xl rounded-[36px] bg-[#0C60FC] px-6 py-14 text-center text-white shadow-2xl shadow-blue-200 sm:px-12" style={{ borderRadius: "36px" }}>
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest">
              Start free
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Your next study session can be your best one.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-blue-100">
              Create your account, add your course and let Qz show you exactly where to begin. No card required.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="squishy rounded-2xl bg-white px-7 py-4 text-sm font-extrabold text-blue-700 transition hover:-translate-y-0.5"
              >
                Create free account →
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-white/25 bg-white/10 px-7 py-4 text-sm font-extrabold text-white hover:bg-white/15"
              >
                I already use Qz
              </Link>
            </div>
          </div>
        </section>

        <DonationSection />
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
