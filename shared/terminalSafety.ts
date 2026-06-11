export function validateTerminalCommand(command: unknown): string {
  if (typeof command !== "string" || command.trim().length === 0) {
    throw new Error("A terminal command is required.");
  }

  const unsafePattern = /(?:&&|\|\||;|`|\$\(|<\s*\w+|>\s*\w+|\|\s*grep|\|\s*cat)/i;
  if (unsafePattern.test(command) || /\r|\n/.test(command)) {
    throw new Error("Unsafe terminal command detected. Use a simple command only.");
  }

  return command.trim();
}

export function validateWorkspacePath(cwd: unknown, workspaceRoot?: string): string {
  if (typeof cwd !== "string" || cwd.trim().length === 0) {
    throw new Error("A valid workspace path is required.");
  }

  const normalized = cwd.trim();
  if (workspaceRoot) {
    const root = workspaceRoot.trim();
    const resolved = normalized.startsWith(root) || normalized === root;
    if (!resolved) {
      throw new Error("Workspace path must stay within the project root.");
    }
  }

  return normalized;
}
