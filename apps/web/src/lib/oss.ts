export const GITHUB_REPO = "kory-kaai/monetready";

export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export const README_QUICK_START_URL = `${GITHUB_URL}#quick-start`;

export const CLI_COMMANDS = {
  init: "npx monetready-cli init",
  score: "npx monetready-cli score",
  create: "npx create-monetready my-saas",
  dashboard: "monetready dashboard",
} as const;
