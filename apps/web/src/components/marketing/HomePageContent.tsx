"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { MonetreadySpec } from "@monetready/core";
import { IconChart, IconPlaybook, IconRocket } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SelfHostedSection } from "@/components/marketing/SelfHostedSection";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface HomePageContentProps {
  spec: MonetreadySpec;
}

const features = [
  {
    icon: IconChart,
    title: "Monetready Score",
    description: "Audit pricing, GTM, analytics, and email readiness across six revenue categories.",
  },
  {
    icon: IconPlaybook,
    title: "Revenue playbooks",
    description: "Six automation playbooks for trial endings, churn winback, inactive nudges, and more.",
  },
  {
    icon: IconRocket,
    title: "Launch assets",
    description: "Generate landing pages, pricing, and legal docs from your monetready.yaml spec.",
  },
];

const steps = [
  {
    title: "Define your product",
    body: "Create a free account and edit monetready.yaml in your dashboard — or run npx monetready-cli init locally.",
  },
  {
    title: "Audit & improve",
    body: "Get your Monetready Score and fix gaps before you launch. Sync spec from GitHub when your repo is the source of truth.",
  },
  {
    title: "Launch & automate",
    body: "Generate pages, connect Stripe + SES, and run playbooks on autopilot — or use the self-hosted CLI on your machine.",
  },
];

const trustItems = ["Firebase Auth", "Stripe billing", "Amazon SES", "Open source MIT core"];

export function HomePageContent({ spec }: HomePageContentProps) {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section className="hero">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1>{spec.product.tagline}</h1>
          <p className="lead">{spec.product.solution}</p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary">
              Start for free
            </Link>
            <Link href="/pricing" className="btn btn-secondary">
              View pricing
            </Link>
            <Link href="/cli" className="btn btn-secondary">
              Self-hosted CLI
            </Link>
          </div>
        </motion.div>

        <Reveal delay={0.15}>
          <div className="stats-row">
            {[
              { value: "6", label: "Revenue playbooks" },
              { value: "100", label: "Max Monetready Score" },
              { value: "MIT", label: "Open source core" },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Reveal>
        <section className="trust-strip" aria-label="Integrations">
          <p className="trust-line">
            {trustItems.join(" · ")}
          </p>
        </section>
      </Reveal>

      <section className="section">
        <div className="section-header">
          <Reveal>
            <h2>How it works</h2>
            <p>From idea to revenue-ready in three steps — hosted or self-hosted.</p>
          </Reveal>
        </div>
        <div className="steps">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="step-card">
                <div className="step-num">{i + 1}</div>
                <h3>{step.title}</h3>
                <p className="step-body">{step.body}</p>
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
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.08}>
                <div className="feature-card">
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <SelfHostedSection spec={spec} />

      <Reveal>
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-title">Ready to forge your product?</h2>
            <p className="cta-lead">
              Join founders using Monetready to ship with pricing, playbooks, and launch assets from day one.
            </p>
            <div className="hero-actions" style={{ marginBottom: 0 }}>
              <Link href="/signup" className="btn btn-primary">
                Create free account
              </Link>
              <Link href="/cli" className="btn btn-secondary">
                Use the CLI instead
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
