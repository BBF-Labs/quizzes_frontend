"use client";

import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";

export default function PrivacyPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Header Hero */}
        <section className="soft-grid relative overflow-hidden px-5 pb-16 pt-36 lg:pb-20 lg:pt-44">
          <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-100 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.24em] text-[#0C60FC]">
              Legal / Privacy
            </p>
            <h1 className="mt-6 max-w-4xl display text-5xl font-bold leading-[1.02] tracking-[-.05em] text-slate-950 sm:text-7xl">
              Privacy &amp;<br />
              <span className="text-[#0C60FC]">Data Policy.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Your study data is your intellectual advantage. We treat it as privileged information while providing your AI-powered study experience.
            </p>
            <div className="mt-8 inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
              Last updated · April 2026
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-2 text-xs font-bold text-slate-500">
              <p className="mb-4 text-[10px] uppercase tracking-widest text-slate-400">
                On this page
              </p>
              <a href="#collect" className="block hover:text-[#0C60FC]">Information we collect</a>
              <a href="#use" className="block hover:text-[#0C60FC]">How we use data</a>
              <a href="#ai" className="block hover:text-[#0C60FC]">AI disclosure</a>
              <a href="#security" className="block hover:text-[#0C60FC]">Data security</a>
              <a href="#rights" className="block hover:text-[#0C60FC]">Your rights</a>
              <a href="#contact" className="block hover:text-[#0C60FC]">Contact</a>
            </nav>
          </aside>

          <article className="max-w-3xl space-y-12 leading-7 text-slate-600">
            <section id="collect">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">01</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Information we collect</h2>
              <p className="mt-4">
                To provide the Qz study platform, we collect information you explicitly provide and information generated during your sessions.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                  <h3 className="font-bold text-slate-900">Account information</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Email address, name, university affiliation and study programme used to personalise your context.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                  <h3 className="font-bold text-slate-900">Study materials</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    PDFs, lecture notes and diagrams you upload for AI processing and session generation.
                  </p>
                </div>
              </div>
            </section>

            <section id="use">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">02</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">How we use your data</h2>
              <p className="mt-4">We use your data strictly to facilitate your learning journey. This includes:</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                <li>Generating personalised quiz questions and flashcards from your uploads.</li>
                <li>Providing context-aware tutoring sessions through Qz Chat.</li>
                <li>Analysing duration, accuracy and streaks to explain your performance.</li>
                <li>Maintaining your learning history so you can continue where you left off.</li>
              </ul>
            </section>

            <section id="ai" className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">03 / AI disclosure</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">How AI providers process data</h2>
              <p className="mt-4">
                Qz uses advanced large language models. Information is sent to model providers only for processing during your requested sessions.
              </p>
              <p className="mt-4 font-bold text-slate-900">
                By default, your study materials are not used to train third-party global models.
              </p>
              <p className="mt-4 text-sm">
                Information is transmitted over encrypted channels and providers are bound by strict processing agreements.
              </p>
            </section>

            <section id="security">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">04</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Data security</h2>
              <p className="mt-4">We apply technical and organisational safeguards appropriate to the sensitivity of your material.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                <li>Encryption in transit using TLS/SSL and encryption of stored data.</li>
                <li>Secure authentication based on industry-standard protocols.</li>
                <li>Regular reviews of infrastructure and data access logs.</li>
              </ul>
            </section>

            <section id="rights">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">05</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Your rights &amp; control</h2>
              <div className="mt-5 space-y-4">
                <div className="border-l-2 border-[#0C60FC] pl-5">
                  <h3 className="font-bold text-slate-900">Right to deletion</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Delete specific materials, sessions or your entire account. Deleted information is removed from active databases.
                  </p>
                </div>
                <div className="border-l-2 border-[#0C60FC] pl-5">
                  <h3 className="font-bold text-slate-900">Access &amp; portability</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Access generated quizzes and summaries in your dashboard. Full study-history export is supported.
                  </p>
                </div>
              </div>
            </section>

            <section id="contact" className="rounded-[24px] bg-slate-950 p-7 text-white shadow-xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#DFFF61]">
                Contact BFLabs
              </p>
              <h2 className="mt-2 text-2xl font-bold">Questions about your data?</h2>
              <p className="mt-3 text-sm text-slate-400">
                Contact the Data Privacy Officer at BetaForge Labs.
              </p>
              <a
                href="mailto:privacy@bflabs.tech"
                className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-blue-50"
              >
                privacy@bflabs.tech
              </a>
            </section>
          </article>
        </div>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
