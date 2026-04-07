"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  UserCheck,
  CreditCard,
  Bot,
  Upload,
  ShieldAlert,
  Gavel,
  ArrowLeft,
  Mail,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";

const TermsSection = ({
  id,
  title,
  icon: Icon,
  children,
}: {
  id?: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-16 last:mb-0 scroll-mt-32"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 border border-primary/20 bg-primary/5">
        <Icon className="size-5 text-primary" />
      </div>
      <h2 className="text-xl font-black tracking-tighter uppercase">{title}</h2>
    </div>
    <div className="pl-0 md:pl-12 text-sm leading-relaxed text-muted-foreground font-mono space-y-4">
      {children}
    </div>
  </motion.section>
);

export default function TermsPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Eligibility", id: "eligibility" },
    { label: "Accounts", id: "accounts" },
    { label: "Billing", id: "billing" },
    { label: "AI Content", id: "ai-content" },
    { label: "Your Uploads", id: "uploads" },
    { label: "Prohibited Use", id: "prohibited" },
    { label: "Liability", id: "liability" },
    { label: "Governing Law", id: "governing-law" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 border-l-4 border-primary pl-8 py-4"
          >
            <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
                Legal / Terms
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
              Terms &amp; <br />
              <span className="text-primary">Conditions</span>
            </h1>
            <p className="max-w-2xl text-muted-foreground font-mono text-sm leading-relaxed">
              By accessing or using Qz, you agree to be bound by these terms.
              Please read them carefully before creating an account or
              purchasing a subscription.
              <br /><br />
              <span className="text-foreground/80">Last Updated: April 2026</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Sidebar */}
            <aside className="hidden md:block col-span-1 sticky top-32 h-fit space-y-4">
              <div className="border border-border/50 bg-card/40 p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-4">
                  Quick Navigation
                </p>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-[11px] font-mono uppercase text-left hover:text-primary transition-colors py-1 focus:outline-none"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </aside>

            {/* Content */}
            <div className="col-span-1 md:col-span-3">

              <TermsSection id="eligibility" title="Acceptance & Eligibility" icon={UserCheck}>
                <p>
                  These Terms of Service (&quot;Terms&quot;) constitute a legally binding
                  agreement between you and BetaForge Labs (&quot;BFLabs&quot;, &quot;we&quot;, &quot;us&quot;)
                  governing your use of the Qz platform (&quot;Service&quot;).
                </p>
                <p>
                  You must be at least 16 years of age and currently enrolled at,
                  or recently graduated from, an accredited university or
                  educational institution to create an account. By registering,
                  you represent that you meet these requirements.
                </p>
                <p>
                  If you are using Qz on behalf of an institution, you represent
                  that you have the authority to bind that institution to these Terms.
                </p>
              </TermsSection>

              <TermsSection id="accounts" title="Account Responsibilities" icon={FileText}>
                <p>
                  You are responsible for maintaining the confidentiality of your
                  login credentials and for all activity that occurs under your account.
                  Notify us immediately at{" "}
                  <span className="text-primary">support@bflabs.tech</span> if you
                  suspect unauthorized access.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="border border-border/40 p-4 bg-secondary/20">
                    <p className="text-foreground font-bold mb-2 uppercase text-[12px]">One Account Per User</p>
                    <p className="text-[12px]">
                      Each person may maintain only one active Qz account.
                      Duplicate accounts may be merged or terminated.
                    </p>
                  </div>
                  <div className="border border-border/40 p-4 bg-secondary/20">
                    <p className="text-foreground font-bold mb-2 uppercase text-[12px]">Accurate Information</p>
                    <p className="text-[12px]">
                      You must provide accurate university affiliation details.
                      Student-verified discounts are contingent on valid institutional
                      email verification.
                    </p>
                  </div>
                </div>
              </TermsSection>

              <TermsSection id="billing" title="Subscriptions & Billing" icon={CreditCard}>
                <p>
                  Qz offers a free tier and paid subscription plans (Pro, Scholar).
                  Paid plans are billed on a monthly or annual cycle as selected at
                  checkout. All fees are in the currency displayed at point of
                  purchase and are inclusive of applicable taxes where required by law.
                </p>
                <div className="space-y-4 mt-4">
                  <div className="border border-border/40 p-5">
                    <p className="text-foreground font-bold mb-1 uppercase text-[12px]">Credits & Add-Ons</p>
                    <p>
                      AI Credits purchased separately are non-refundable once
                      consumed. Unused credits carry over month-to-month but expire
                      upon account closure or plan downgrade beyond the retention
                      threshold.
                    </p>
                  </div>
                  <div className="border border-border/40 p-5">
                    <p className="text-foreground font-bold mb-1 uppercase text-[12px]">Cancellation & Refunds</p>
                    <p>
                      You may cancel your subscription at any time. Cancellation
                      takes effect at the end of the current billing period; you
                      retain access until then. We do not provide prorated refunds
                      for partial periods unless required by applicable consumer law.
                    </p>
                  </div>
                  <div className="border border-border/40 p-5">
                    <p className="text-foreground font-bold mb-1 uppercase text-[12px]">Price Changes</p>
                    <p>
                      We may adjust subscription pricing with 30 days&apos; notice
                      communicated via email or in-app notification. Continued use
                      after the effective date constitutes acceptance of the new price.
                    </p>
                  </div>
                </div>
              </TermsSection>

              <TermsSection id="ai-content" title="AI-Generated Content" icon={Bot}>
                <p>
                  The Z AI tutor generates study materials—quizzes, flashcards,
                  mind maps, lesson plans, and summaries—based on your uploaded
                  content and session context.
                </p>
                <div className="bg-primary/10 border-l-2 border-primary p-4 my-4 font-bold text-foreground">
                  IMPORTANT: AI-generated content is provided for educational
                  assistance only. It may contain errors, omissions, or
                  inaccuracies. You are solely responsible for verifying the
                  correctness of any material before relying on it academically.
                </div>
                <p>
                  BFLabs does not guarantee that AI output will be accurate,
                  complete, or appropriate for any specific assessment or
                  examination. Use of Qz does not replace professional academic
                  advice or official course materials.
                </p>
                <p>
                  AI-generated artifacts produced from your uploaded materials
                  belong to you. BFLabs retains no ownership over study content
                  generated during your sessions.
                </p>
              </TermsSection>

              <TermsSection id="uploads" title="Your Uploaded Content" icon={Upload}>
                <p>
                  You retain full ownership of any materials you upload (lecture
                  notes, PDFs, diagrams). By uploading content, you grant BFLabs
                  a limited, non-exclusive licence to process that content solely
                  for the purpose of delivering the Service to you.
                </p>
                <p>You represent and warrant that:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You own or have the right to upload the content.</li>
                  <li>
                    The content does not infringe any third-party intellectual
                    property rights.
                  </li>
                  <li>
                    The content does not contain malicious code, illegal material,
                    or personally identifiable information of third parties without
                    their consent.
                  </li>
                </ul>
                <p>
                  We reserve the right to remove content that violates these
                  Terms or applicable law without prior notice.
                </p>
              </TermsSection>

              <TermsSection id="prohibited" title="Prohibited Conduct" icon={ShieldAlert}>
                <p>You may not use Qz to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Violate any academic integrity policy, including submitting
                    AI-generated work as your own where prohibited by your institution.
                  </li>
                  <li>
                    Attempt to reverse-engineer, scrape, or extract model weights,
                    prompts, or training data from the Service.
                  </li>
                  <li>
                    Share login credentials or resell access to third parties.
                  </li>
                  <li>
                    Upload content designed to manipulate, jailbreak, or elicit
                    policy-violating responses from the Z AI.
                  </li>
                  <li>
                    Use automated tools to bulk-generate content beyond normal
                    personal study use.
                  </li>
                  <li>
                    Harass, impersonate, or collect data on other users.
                  </li>
                </ul>
                <p>
                  Violations may result in immediate account suspension or
                  termination without refund.
                </p>
              </TermsSection>

              <TermsSection id="liability" title="Limitation of Liability" icon={AlertTriangle}>
                <p>
                  To the maximum extent permitted by applicable law, BFLabs and
                  its officers, employees, and partners shall not be liable for
                  any indirect, incidental, special, consequential, or punitive
                  damages arising out of or relating to your use of the Service.
                </p>
                <p>
                  Our total aggregate liability for any claim arising under these
                  Terms shall not exceed the greater of (a) the amount you paid
                  to BFLabs in the 12 months preceding the claim, or (b) USD 50.
                </p>
                <p>
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without
                  warranties of any kind, express or implied, including fitness
                  for a particular purpose, accuracy, or uninterrupted availability.
                </p>
              </TermsSection>

              <TermsSection id="governing-law" title="Governing Law & Disputes" icon={Gavel}>
                <p>
                  These Terms are governed by and construed in accordance with the
                  laws of the jurisdiction in which BetaForge Labs is registered,
                  without regard to conflict-of-law principles.
                </p>
                <p>
                  Any dispute arising out of or in connection with these Terms that
                  cannot be resolved informally shall be submitted to binding
                  arbitration before a mutually agreed arbitrator. You waive the
                  right to participate in class-action proceedings.
                </p>
                <p>
                  Nothing in this clause prevents either party from seeking
                  injunctive or other equitable relief from a court of competent
                  jurisdiction.
                </p>
              </TermsSection>

              <TermsSection title="Changes & Contact" icon={Mail}>
                <p>
                  We may update these Terms from time to time. Material changes
                  will be communicated via email or in-app notification at least
                  14 days before they take effect. Your continued use after the
                  effective date constitutes acceptance.
                </p>
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-primary font-bold">Email: legal@bflabs.tech</p>
                  <p>Attn: Legal Team — BetaForge Labs</p>
                </div>
              </TermsSection>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
