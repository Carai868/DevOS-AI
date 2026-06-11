export function validateTerminalCommand(command: unknown): string {
  if (typeof command !== "string" || command.trim().length === 0) {
    throw new Error("A terminal command is required.");
  }

  const unsafePattern = /(?:&&|\|\||;|`|\$\(|<\s*\w+|>\s*\w+)/;
  if (unsafePattern.test(command) || /\r|\n/.test(command)) {
    throw new Error("Unsafe terminal command detected. Use a simple command only.");
  }

  return command.trim();
}

export function validateWorkspacePath(cwd: unknown): string {
  if (typeof cwd !== "string" || cwd.trim().length === 0) {
    throw new Error("A valid workspace path is required.");
  }

  return cwd.trim();
}
