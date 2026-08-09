import { z } from "zod";

export const PlaybookTriggerSchema = z.object({
  type: z.enum(["stripe", "analytics", "schedule", "manual"]),
  event: z.string(),
  condition: z.string().optional(),
});

export const PlaybookActionSchema = z.object({
  type: z.enum(["email", "webhook", "slack", "log", "generate"]),
  template: z.string().optional(),
  url: z.string().optional(),
  message: z.string().optional(),
});

export const PlaybookSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(["conversion", "retention", "growth", "onboarding"]).default("conversion"),
  trigger: PlaybookTriggerSchema,
  actions: z.array(PlaybookActionSchema).min(1),
  enabled: z.boolean().default(true),
});

export type Playbook = z.infer<typeof PlaybookSchema>;
export type PlaybookAction = z.infer<typeof PlaybookActionSchema>;

export interface PlaybookRunResult {
  playbookId: string;
  status: "simulated" | "executed" | "failed" | "skipped";
  actions: Array<{
    type: string;
    status: "ok" | "skipped" | "error";
    output: string;
  }>;
}
