import type { MonetreadySpec } from "@monetready/core";
import { Reveal } from "@/components/ui/Reveal";
import { PricingCTA } from "@/components/marketing/PricingCTA";

interface PricingSectionProps {
  spec: MonetreadySpec;
  featuredIndex?: number;
}

export function PricingSection({ spec, featuredIndex = 1 }: PricingSectionProps) {
  const tiers = spec.pricing.tiers;

  return (
    <section className="section" id="pricing">
      <div className="section-header">
        <Reveal>
          <h2>Simple, founder-friendly pricing</h2>
          <p>Start free. Upgrade when you&apos;re ready to execute playbooks and launch.</p>
        </Reveal>
      </div>
      <div className="pricing-grid">
        {tiers.map((tier, index) => {
          const featured = index === featuredIndex;
          return (
            <Reveal key={tier.name} delay={index * 0.1}>
              <div className={`pricing-card${featured ? " featured" : ""}`}>
                {featured ? <span className="badge">Most popular</span> : null}
                <h3>{tier.name}</h3>
                <div className="price">
                  ${tier.price}
                  <span style={{ fontSize: "1rem", color: "var(--muted)" }}>/{tier.interval}</span>
                </div>
                <ul>
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <PricingCTA tierName={tier.name} price={tier.price} featured={featured} />
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
