"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Database, Share2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";

const SECTION_ICON_SIZE = 20;

const PrivacySection = ({ 
  id,
  title, 
  icon: Icon, 
  children 
}: { 
  id?: string;
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode 
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

export default function PrivacyPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Collection", id: "collection" },
    { label: "Usage", id: "usage" },
    { label: "AI Disclosure", id: "ai-disclosure" },
    { label: "Security", id: "security" },
    { label: "Rights", id: "rights" },
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
                Legal / Privacy
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
              Privacy & <br />
              <span className="text-primary">Data Policy</span>
            </h1>
            <p className="max-w-2xl text-muted-foreground font-mono text-sm leading-relaxed">
              Your study data is your intellectual advantage. We treat it as 
              privileged information, ensuring that your privacy is protected 
              while providing you with the ultimate AI-powered study experience.
              <br /><br />
              <span className="text-foreground/80">Last Updated: April 2026</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Sidebar / Quick Links */}
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
              
              <PrivacySection id="collection" title="Information We Collect" icon={Database}>
                <p>To provide the Z study platform, we collect information that you explicitly provide and data generated during your sessions.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="border border-border/40 p-4 bg-secondary/20">
                    <p className="text-foreground font-bold mb-2 uppercase text-[12px]">Account Information</p>
                    <p className="text-[12px]">Email address, name, university affiliation, and study program to personalize your context.</p>
                  </div>
                  <div className="border border-border/40 p-4 bg-secondary/20">
                    <p className="text-foreground font-bold mb-2 uppercase text-[12px]">Study Materials</p>
                    <p className="text-[12px]">PDFs, lecture notes, and diagrams you upload for AI processing and session generation.</p>
                  </div>
                </div>
              </PrivacySection>

              <PrivacySection id="usage" title="How We Use Your Data" icon={Eye}>
                <p>We use your data strictly to facilitate your learning journey. This includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Generating personalized quiz questions and flashcards based on your uploads.</li>
                  <li>Providing context-aware AI Tutoring sessions through the Z Chat.</li>
                  <li>Analyzing study sessions (duration, accuracy, streaks) to provide you with insights into your performance.</li>
                  <li>Maintaining your learning history so you can pick up where you left off.</li>
                </ul>
              </PrivacySection>

              <PrivacySection id="ai-disclosure" title="AI Disclosure" icon={Shield}>
                <p>Z leverages advanced Large Language Models (LLMs) from providers like OpenAI and Anthropic.</p>
                <p className="bg-primary/10 border-l-2 border-primary p-4 my-4 font-bold text-foreground">
                  IMPORTANT: Your data is sent to these providers only for processing during your sessions. By default, your study materials are NOT used to train these third-party global models.
                </p>
                <p>We transmit information over secure, encrypted channels. These providers are bound by strict privacy agreements to ensure your data is processed only as instructed for your specific sessions.</p>
              </PrivacySection>

              <PrivacySection id="security" title="Data Security" icon={Lock}>
                <p>We implement robust security measures to protect your material:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Encryption of data at rest and during transit (TLS/SSL).</li>
                  <li>Secure authentication systems powered by industry-standard protocols.</li>
                  <li>Regular auditing of our infrastructure and data access logs.</li>
                </ul>
              </PrivacySection>

              <PrivacySection id="rights" title="Your Rights & Control" icon={Share2}>
                <p>You have full control over your study data:</p>
                <div className="space-y-4 mt-4">
                  <div className="border border-border/40 p-5">
                    <p className="text-foreground font-bold mb-1 uppercase">Right to Deletion</p>
                    <p>You can delete specific study materials, sessions, or your entire account at any time. Once deleted, your data is scrubbed from our active databases.</p>
                  </div>
                  <div className="border border-border/40 p-5">
                    <p className="text-foreground font-bold mb-1 uppercase">Access & Portability</p>
                    <p>You can access all your generated quizzes and summaries through the dashboard. We are working on features to allow exporting your full study history.</p>
                  </div>
                </div>
              </PrivacySection>

              <PrivacySection title="Contact BFLabs" icon={Mail}>
                <p>If you have questions about this policy or how your data is handled, reach out to our privacy team at BetaForge Labs.</p>
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-primary font-bold">Email: privacy@bflabs.tech</p>
                  <p>Attn: Data Privacy Officer</p>
                </div>
              </PrivacySection>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
