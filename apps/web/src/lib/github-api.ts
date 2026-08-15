import type { ProjectSignals } from "@monetready/core";

const GITHUB_API = "https://api.github.com";

function parseRepoSlug(repo: string): { owner: string; name: string } | null {
  const match = repo.trim().match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (!match) {
    return null;
  }
  return { owner: match[1], name: match[2] };
}

async function githubFileExists(
  owner: string,
  name: string,
  path: string,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${name}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return response.ok;
}

export async function fetchGithubMonetreadyYaml(
  repo: string,
  token: string,
): Promise<string | null> {
  const parsed = parseRepoSlug(repo);
  if (!parsed) {
    throw new Error("Invalid repository format. Use owner/repo (e.g. kory-kaai/monetready).");
  }

  const response = await fetch(
    `${GITHUB_API}/repos/${parsed.owner}/${parsed.name}/contents/monetready.yaml`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") {
    throw new Error("Unexpected monetready.yaml response from GitHub");
  }

  return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function detectGithubRepoSignals(
  repo: string,
  token: string,
): Promise<Partial<ProjectSignals>> {
  const parsed = parseRepoSlug(repo);
  if (!parsed) {
    return {};
  }

  const { owner, name } = parsed;

  const hasReadme =
    (await githubFileExists(owner, name, "README.md", token)) ||
    (await githubFileExists(owner, name, "readme.md", token));

  const hasLicense =
    (await githubFileExists(owner, name, "LICENSE", token)) ||
    (await githubFileExists(owner, name, "LICENSE.md", token));

  const hasCi = await githubFileExists(owner, name, ".github/workflows", token);

  return {
    hasReadme,
    hasLicense,
    hasCi,
  };
}

export async function fetchGithubUsername(token: string): Promise<string> {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to verify GitHub token");
  }

  const data = (await response.json()) as { login?: string };
  if (!data.login) {
    throw new Error("GitHub user profile missing login");
  }
  return data.login;
}
