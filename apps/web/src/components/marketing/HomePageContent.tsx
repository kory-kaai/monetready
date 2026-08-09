"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { MonetreadySpec } from "@monetready/core";
import { Reveal } from "@/components/ui/Reveal";

interface HomePageContentProps {
  spec: MonetreadySpec;
}

const features = [
  {
    title: "Monetready Score",
    description: "Audit pricing, GTM, analytics, and email readiness across six revenue categories.",
  },
  {
    title: "Revenue playbooks",
    description: "Six automation playbooks for trial endings, churn winback, inactive nudges, and more.",
  },
  {
    title: "Launch assets",
    description: "Generate landing pages, pricing, and legal docs from your monetready.yaml spec.",
  },
];

const steps = [
  { title: "Define your product", body: "Run monetready setup — product, pricing, and GTM in one YAML file." },
  { title: "Audit & improve", body: "Get your Monetready Score and fix gaps before you launch." },
  { title: "Launch & automate", body: "Generate pages, connect Stripe + SES, and run playbooks on autopilot." },
];

export function HomePageContent({ spec }: HomePageContentProps) {
  return (
    <>
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-eyebrow">Open-source product forge</span>
          <h1>{spec.product.tagline}</h1>
          <p className="lead">{spec.product.solution}</p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary">
              Start for free
            </Link>
            <Link href="/pricing" className="btn btn-secondary">
              View pricing
            </Link>
          </div>
        </motion.div>

        <Reveal delay={0.2}>
          <div className="stats-row">
            <div className="stat-card">
              <strong>6</strong>
              <span>Revenue playbooks</span>
            </div>
            <div className="stat-card">
              <strong>100</strong>
              <span>Max Monetready Score</span>
            </div>
            <div className="stat-card">
              <strong>MIT</strong>
              <span>Open source core</span>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <div className="section-header">
          <Reveal>
            <h2>How it works</h2>
            <p>From idea to revenue-ready in three steps.</p>
          </Reveal>
        </div>
        <div className="steps">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="step-card">
                <div className="step-num">{i + 1}</div>
                <h3>{step.title}</h3>
                <p style={{ color: "var(--muted)" }}>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <Reveal>
            <h2>Built for indie hackers</h2>
            <p>{spec.gtm.unfair_advantage}</p>
          </Reveal>
        </div>
        <div className="feature-grid">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.08}>
              <div className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <div className="container">
          <div className="cta-banner">
            <h2 style={{ fontFamily: "var(--display)", marginBottom: "0.75rem" }}>
              Ready to forge your product?
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
              Join founders using Monetready to ship with pricing, playbooks, and launch assets from day one.
            </p>
            <Link href="/signup" className="btn btn-primary">
              Create free account
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
