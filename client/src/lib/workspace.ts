import type { FileNode } from "@/contexts/IDEContext";

const WORKSPACE_FILES_KEY = "devos-ide-files-v1";

export function loadWorkspaceFiles(defaultFiles: FileNode[]): FileNode[] {
  if (typeof window === "undefined") return defaultFiles;

  try {
    const raw = window.localStorage.getItem(WORKSPACE_FILES_KEY);
    if (!raw) return defaultFiles;

    const parsed = JSON.parse(raw) as FileNode[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFiles;
  } catch (error) {
    console.warn("Failed to load workspace files, using defaults:", error);
    return defaultFiles;
  }
}

export function saveWorkspaceFiles(files: FileNode[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WORKSPACE_FILES_KEY, JSON.stringify(files));
  } catch (error) {
    console.warn("Failed to persist workspace files:", error);
  }
}

export function clearWorkspaceFiles() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WORKSPACE_FILES_KEY);
}
