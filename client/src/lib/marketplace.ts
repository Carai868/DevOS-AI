export interface MarketplacePackage {
  id: string;
  name: string;
  version: string;
  publisher: string;
  description: string;
  downloads: number;
  isOfficial?: boolean;
}

export interface InstallResult {
  ok: boolean;
  installedPath?: string;
  message: string;
}

export function normalizeExtensionName(name: string) {
  const cleaned = name
    .trim()
    .replace(/^@/, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return cleaned || "extension";
}

export function buildExtensionInstallDir(name: string, workspaceRoot: string) {
  return `${workspaceRoot.replace(/\/$/, "")}/.devos/extensions/${normalizeExtensionName(name)}`;
}

export async function fetchMarketplaceCatalog(): Promise<MarketplacePackage[]> {
  const response = await fetch("https://raw.githubusercontent.com/YahShalom/DevOS-AI/main/ideas.md");
  if (!response.ok) {
    return [
      {
        id: "devos-terminal-theme",
        name: "DevOS Terminal Theme",
        version: "1.0.0",
        publisher: "DevOS",
        description: "Brutalist terminal theme pack for the IDE.",
        downloads: 128,
        isOfficial: true,
      },
      {
        id: "devos-python-helpers",
        name: "DevOS Python Helpers",
        version: "1.0.0",
        publisher: "DevOS",
        description: "Python linting and helper snippets for the workspace.",
        downloads: 64,
      },
    ];
  }

  const text = await response.text();
  const match = text.match(/Marketplace:[\s\S]*?\n([\s\S]*?)(?:\n\n|$)/);
  if (!match) return [];

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((line, index) => ({
      id: `market-${index + 1}`,
      name: line.replace(/^[-*]\s*/, ""),
      version: "1.0.0",
      publisher: "Community",
      description: "Marketplace item available for download.",
      downloads: 0,
    }));
}

export async function installMarketplaceExtension(name: string, workspaceRoot?: string): Promise<InstallResult> {
  const installDir = workspaceRoot ? buildExtensionInstallDir(name, workspaceRoot) : undefined;

  try {
    const response = await fetch("/api/extensions/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ...(installDir ? { installDir } : {}) }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Extension installation failed");
    }

    return {
      ok: true,
      installedPath: installDir,
      message: data.message || `Installed ${name} into ${installDir}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Extension installation failed",
    };
  }
}
