"use client";

import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";

export default function TermsPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Header Hero */}
        <section className="soft-grid px-5 py-20 pt-32 lg:pt-40">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              Legal / Terms
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Terms &amp; Conditions
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              By accessing or using Qz, you agree to these terms. Please read them before creating an account or purchasing a subscription.
            </p>
            <div className="mt-8 inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
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
              <a href="#eligibility" className="block hover:text-[#0C60FC]">Acceptance &amp; eligibility</a>
              <a href="#account" className="block hover:text-[#0C60FC]">Account responsibilities</a>
              <a href="#billing" className="block hover:text-[#0C60FC]">Subscriptions &amp; billing</a>
              <a href="#ai" className="block hover:text-[#0C60FC]">AI-generated content</a>
              <a href="#uploads" className="block hover:text-[#0C60FC]">Uploaded content</a>
              <a href="#conduct" className="block hover:text-[#0C60FC]">Prohibited conduct</a>
              <a href="#liability" className="block hover:text-[#0C60FC]">Liability</a>
              <a href="#law" className="block hover:text-[#0C60FC]">Governing law</a>
              <a href="#changes" className="block hover:text-[#0C60FC]">Changes &amp; contact</a>
            </nav>
          </aside>

          <article className="max-w-3xl space-y-12 leading-7 text-slate-600">
            <section id="eligibility">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">01</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Acceptance &amp; eligibility</h2>
              <p className="mt-4">
                These Terms form a binding agreement between you and BetaForge Labs (“BFLabs”, “we”, “us”) governing your use of the Qz platform.
              </p>
              <p className="mt-4">
                You must be at least 16 and currently enrolled at, or recently graduated from, an accredited educational institution. If you use Qz for an institution, you confirm you have authority to bind that institution.
              </p>
            </section>

            <section id="account">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">02</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Account responsibilities</h2>
              <p className="mt-4">
                You are responsible for your login credentials and all activity under your account. Notify support@bflabs.tech immediately if you suspect unauthorised access.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                  <h3 className="font-bold text-slate-900">One account per user</h3>
                  <p className="mt-2 text-sm text-slate-600">Duplicate accounts may be merged or terminated.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                  <h3 className="font-bold text-slate-900">Accurate information</h3>
                  <p className="mt-2 text-sm text-slate-600">Student discounts depend on valid institutional verification.</p>
                </div>
              </div>
            </section>

            <section id="billing">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">03</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Subscriptions &amp; billing</h2>
              <p className="mt-4">
                Qz offers free and paid plans. Paid plans renew on the cycle selected at checkout, with fees and applicable taxes shown before purchase.
              </p>
              <h3 className="mt-6 font-bold text-slate-900">Credits &amp; add-ons</h3>
              <p className="mt-2 text-sm">
                Consumed AI credits are non-refundable. Unused credits may carry over but expire when an account is closed or when a plan is downgraded beyond its retention threshold.
              </p>
              <h3 className="mt-6 font-bold text-slate-900">Cancellation &amp; refunds</h3>
              <p className="mt-2 text-sm">
                Cancel at any time. Access continues until the current billing period ends. Prorated refunds are not provided unless required by law.
              </p>
            </section>

            <section id="ai" className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">04 / Important</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">AI-generated content</h2>
              <p className="mt-4">
                Qz generates quizzes, flashcards, mind maps, lesson plans and summaries from your materials and context.
              </p>
              <p className="mt-4 font-bold text-slate-900">
                AI output is educational assistance and may contain errors. You are responsible for verifying material before relying on it academically.
              </p>
            </section>

            <section id="uploads">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">05</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Your uploaded content</h2>
              <p className="mt-4">
                You retain ownership of lecture notes, PDFs and diagrams. By uploading them, you grant BFLabs a limited licence to process that content solely to deliver Qz.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                <li>You own or have permission to upload the content.</li>
                <li>The content does not infringe third-party rights.</li>
                <li>The content does not contain malicious code or unlawful material.</li>
              </ul>
            </section>

            <section id="conduct">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">06</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Prohibited conduct</h2>
              <p className="mt-4">You may not use Qz to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                <li>Violate academic integrity policies or submit AI work as your own where prohibited.</li>
                <li>Reverse-engineer, scrape or extract model weights, prompts or training data.</li>
                <li>Share credentials, resell access or automate bulk generation beyond personal study use.</li>
                <li>Upload material designed to manipulate or jailbreak AI models.</li>
              </ul>
            </section>

            <section id="changes" className="rounded-[24px] bg-slate-950 p-7 text-white shadow-xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#DFFF61]">
                07 / Questions &amp; contact
              </p>
              <h2 className="mt-2 text-2xl font-bold">Questions about these terms?</h2>
              <p className="mt-3 text-sm text-slate-400">
                Material changes will be communicated at least 14 days before they take effect.
              </p>
              <a
                href="mailto:legal@bflabs.tech"
                className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-blue-50"
              >
                legal@bflabs.tech
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
