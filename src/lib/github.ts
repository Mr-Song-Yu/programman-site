import { site } from "../config/site";
import type { GitHubConfig, SaveTarget } from "../types";

type GitHubContentFile = {
  sha: string;
  content: string;
  encoding: string;
};

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function requestGitHub<T>(url: string, config: GitHubConfig, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export async function readContentFile<T>(target: SaveTarget, config: GitHubConfig): Promise<T> {
  const path = site.contentPaths[target];
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
  const file = await requestGitHub<GitHubContentFile>(url, config);
  return JSON.parse(fromBase64(file.content)) as T;
}

export async function writeContentFile<T>(
  target: SaveTarget,
  data: T,
  config: GitHubConfig,
) {
  const path = site.contentPaths[target];
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const file = await requestGitHub<GitHubContentFile>(
    `${url}?ref=${config.branch}`,
    config,
  );

  return requestGitHub(url, config, {
    method: "PUT",
    body: JSON.stringify({
      branch: config.branch,
      message: `Update ${target} content`,
      content: toBase64(`${JSON.stringify(data, null, 2)}\n`),
      sha: file.sha,
    }),
  });
}
