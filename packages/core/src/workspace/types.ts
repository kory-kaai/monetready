import { z } from "zod";

export const WorkspaceProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
});

export const WorkspaceSchema = z.object({
  version: z.literal("1").default("1"),
  products: z.array(WorkspaceProductSchema).min(1),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceProduct = z.infer<typeof WorkspaceProductSchema>;
