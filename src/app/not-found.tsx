"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Home, Search } from "lucide-react";
import { LandingHeader, LandingFooter } from "@/components/landing";
import { QUBI_RUN_SRC, QUBI_PEEK_SRC } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        {/* Soft-grid background blobs */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-5 pt-32 pb-24 lg:pt-40">
          {/* Header */}
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
              <Compass className="h-3.5 w-3.5" />
              Error · 404
            </div>

            <h1 className="display text-balance text-6xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-7xl">
              Off the <span className="text-[#0C60FC]">map.</span>
            </h1>

            <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-[#0C60FC]">
              we looked everywhere ↘
            </p>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
              The page you&rsquo;re looking for either moved, got renamed, or never
              existed in the first place. Let&rsquo;s get you back to the study path.
            </p>
          </div>

          {/* Status card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mx-auto mt-12 max-w-md overflow-visible rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-blue-50/50 sm:p-10"
            style={{ borderRadius: "32px" }}
          >
            {/* Qubi running on top-right (the "searching" posture) */}
            <div className="qubi-sticker absolute -right-2 -top-14 hidden sm:block">
              <span className="hand absolute -left-28 top-2 w-28 -rotate-6 text-xl leading-5 text-[#0C60FC]">
                still looking!
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_RUN_SRC}
                alt="Qubi running off to find the missing page"
                className="h-24 w-24 object-contain"
              />
            </div>

            {/* Big 404 marker */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <span className="display text-3xl font-extrabold text-[#0C60FC]">
                404
              </span>
            </div>

            <p className="mt-6 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Status · Page missing
            </p>

            {/* Suggested links */}
            <div className="mt-6 grid gap-2">
              {[
                { href: "/", label: "Home", icon: Home },
                { href: "/pricing", label: "Pricing", icon: Compass },
                { href: "/library", label: "Public Library", icon: Search },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#0C60FC]/40 hover:bg-blue-50/50 hover:text-[#0C60FC]"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#0C60FC]" />
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/"
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>Back to home</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Secondary peek */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={QUBI_PEEK_SRC} alt="" className="h-5 w-5" />
              <span>Tip — check the URL for typos</span>
            </div>
          </motion.div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}