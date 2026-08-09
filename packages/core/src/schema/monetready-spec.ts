import { z } from "zod";

export const PricingTierSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative(),
  interval: z.enum(["month", "year", "one_time"]).default("month"),
  features: z.array(z.string()).default([]),
});

export const PricingSchema = z.object({
  model: z.enum(["free", "freemium", "paid", "usage"]).default("freemium"),
  currency: z.string().default("usd"),
  tiers: z.array(PricingTierSchema).default([]),
});

export const GtmChannelSchema = z.enum([
  "github",
  "hackernews",
  "reddit",
  "devto",
  "twitter",
  "producthunt",
  "seo",
  "email",
  "community",
]);

export const GtmSchema = z.object({
  channels: z.array(GtmChannelSchema).default([]),
  launch_date: z.string().optional(),
  unfair_advantage: z.string().optional(),
  target_audience: z.string().optional(),
});

export const ProductSchema = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  problem: z.string(),
  solution: z.string().optional(),
  url: z.string().url().optional(),
});

export const IntegrationsSchema = z.object({
  stripe: z.boolean().default(false),
  analytics: z.enum(["posthog", "plausible", "mixpanel", "none"]).default("none"),
  email: z.enum(["resend", "sendgrid", "postmark", "none"]).default("none"),
  github: z.string().optional(),
});

export const MonetreadySpecSchema = z.object({
  version: z.literal("1").default("1"),
  product: ProductSchema,
  pricing: PricingSchema.default({}),
  gtm: GtmSchema.default({}),
  integrations: IntegrationsSchema.default({}),
  playbooks: z.array(z.string()).default([]),
});

export type MonetreadySpec = z.infer<typeof MonetreadySpecSchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type GtmChannel = z.infer<typeof GtmChannelSchema>;

export const DEFAULT_PLAYBOOK_IDS = [
  "trial-ending-upgrade",
  "inactive-user-nudge",
  "new-subscriber-welcome",
  "churn-risk-winback",
  "star-spike-launch",
  "weekly-revenue-check",
] as const;

export type DefaultPlaybookId = (typeof DEFAULT_PLAYBOOK_IDS)[number];

export const DEFAULT_MONETREADY_SPEC: MonetreadySpec = {
  version: "1",
  product: {
    name: "My Product",
    tagline: "Solve a real problem for a specific audience",
    problem: "Describe the pain your users feel today",
    solution: "How your product removes that pain",
  },
  pricing: {
    model: "freemium",
    currency: "usd",
    tiers: [
      { name: "Free", price: 0, interval: "month", features: ["Core features"] },
      {
        name: "Pro",
        price: 19,
        interval: "month",
        features: ["Everything in Free", "Priority support"],
      },
    ],
  },
  gtm: {
    channels: ["github", "hackernews"],
    unfair_advantage: "What do you know or have that competitors don't?",
    target_audience: "Who specifically pays for this?",
  },
  integrations: {
    stripe: false,
    analytics: "none",
    email: "none",
  },
  playbooks: [...DEFAULT_PLAYBOOK_IDS],
};
