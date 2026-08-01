"use client";

import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-24 pt-36 lg:pb-32 lg:pt-44">
          <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-100 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.24em] text-[#0C60FC]">
              About / BetaForge Labs
            </p>
            <h1 className="display mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-[-.05em] text-slate-950 sm:text-7xl">
              We built the tool<br />
              <span className="text-[#0C60FC]">we needed.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Qz is built by a small team of developers and educators who were once students frustrated by the gap between what study tools promised and what African universities actually needed. So we stopped waiting and built it ourselves.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="bg-slate-950 px-5 py-24 text-white">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.65fr_1.35fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-300">
                Our mission
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                One clear ambition keeps the work focused.
              </p>
            </div>
            <h2 className="text-balance text-4xl font-bold leading-tight sm:text-6xl">
              Make every African student <span className="text-[#DFFF61]">examination-ready.</span>
            </h2>
          </div>
        </section>

        {/* What We Believe (Six Principles) */}
        <section className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#0C60FC]">
                What we believe
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">
                Six principles shape every decision.
              </h2>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3" style={{ borderRadius: "28px" }}>
              <article className="bg-white p-7">
                <span className="text-xs font-extrabold text-blue-500">01</span>
                <h3 className="mt-8 text-xl font-bold">Intelligence over repetition</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Qz analyses weak spots, builds a targeted plan and keeps going until the material is understood.
                </p>
              </article>
              <article className="bg-white p-7">
                <span className="text-xs font-extrabold text-violet-500">02</span>
                <h3 className="mt-8 text-xl font-bold">Radical personalisation</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Qz adapts to your programme, syllabus, pace and exam schedule—not an imaginary average student.
                </p>
              </article>
              <article className="bg-white p-7">
                <span className="text-xs font-extrabold text-emerald-500">03</span>
                <h3 className="mt-8 text-xl font-bold">Built for African universities</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Designed from the ground up around Ghanaian and broader African university structures.
                </p>
              </article>
              <article className="bg-white p-7">
                <span className="text-xs font-extrabold text-rose-500">04</span>
                <h3 className="mt-8 text-xl font-bold">Your data stays yours</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Your notes remain your intellectual property and are used only to serve your study experience.
                </p>
              </article>
              <article className="bg-white p-7">
                <span className="text-xs font-extrabold text-amber-500">05</span>
                <h3 className="mt-8 text-xl font-bold">Speed without compromise</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Study sessions, quizzes, flashcards and mind maps generated in seconds through a carefully built pipeline.
                </p>
              </article>
              <article className="bg-white p-7">
                <span className="text-xs font-extrabold text-cyan-500">06</span>
                <h3 className="mt-8 text-xl font-bold">Education as infrastructure</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Quality learning tools should not depend on geography or income. Affordability is part of the product.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Our Journey Timeline */}
        <section className="bg-[#F7F9FC] px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#0C60FC]">
              Our journey
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              From frustration to infrastructure.
            </h2>
            <div className="mt-12 grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <b className="text-[#0C60FC]">2023</b>
                <h3 className="mt-5 font-bold">The frustration begins</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Two Computer Science students notice every study tool was built for somewhere else.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <b className="text-[#0C60FC]">2024</b>
                <h3 className="mt-5 font-bold">BetaForge Labs founded</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The first prototype reads a PDF and turns it into useful questions.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <b className="text-[#0C60FC]">Early 2025</b>
                <h3 className="mt-5 font-bold">Qubi comes to life</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The quiz bot becomes a syllabus-aware study agent with memory and mastery gates.
                </p>
              </div>
              <div className="rounded-2xl bg-[#0C60FC] p-5 text-white shadow-lg">
                <b className="text-blue-200">2025</b>
                <h3 className="mt-5 font-bold">Public launch</h3>
                <p className="mt-2 text-xs leading-5 text-blue-100">
                  Qz opens with curriculum support across Ghanaian universities and departments.
                </p>
              </div>
              <div className="rounded-2xl bg-[#DFFF61] p-5 text-slate-950">
                <b>2026 →</b>
                <h3 className="mt-5 font-bold">Expanding the map</h3>
                <p className="mt-2 text-xs leading-5 text-slate-700">
                  Institutional partnerships, West African expansion and stronger reasoning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Qubi System Section */}
        <section className="px-5 py-24">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[36px] bg-slate-950 text-white lg:grid-cols-2" style={{ borderRadius: "36px" }}>
            <div className="p-8 sm:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#DFFF61]">
                Qubi / The AI tutor
              </p>
              <h2 className="mt-5 text-4xl font-bold">
                Qubi isn&apos;t a chatbot.<br />
                Qubi is a study system.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-400">
                Qubi reads your curriculum, identifies knowledge gaps, builds a structured study plan, and creates lessons, quizzes, flashcards and mind maps tailored to your material.
              </p>
              <Link
                href="/signup"
                className="squishy mt-8 inline-flex rounded-2xl bg-[#DFFF61] px-6 py-4 text-sm font-extrabold text-slate-950"
              >
                Start a session →
              </Link>
            </div>
            <div className="flex min-h-80 items-center justify-center bg-[#0C60FC] p-8">
              <div className="w-full max-w-sm rounded-[28px] bg-white p-5 text-slate-900 shadow-2xl">
                <p className="text-[10px] font-bold uppercase text-slate-400">Your next best move</p>
                <h3 className="mt-3 text-xl font-bold">Master graph traversal</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  You understand BFS. Let&apos;s close the gap on DFS with a 12-minute focused session.
                </p>
                <div className="mt-5 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-[#0C60FC]" />
                </div>
                <Link
                  href="/signup"
                  className="mt-5 block w-full rounded-xl bg-slate-950 py-3 text-center text-xs font-extrabold text-white"
                >
                  Continue with Qubi →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
