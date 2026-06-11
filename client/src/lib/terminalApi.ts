export interface TerminalExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export async function runTerminalCommand(command: string, cwd?: string): Promise<TerminalExecutionResult> {
  const response = await fetch("/api/terminal/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, cwd: cwd || undefined }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Terminal execution failed");
  }

  return response.json();
}
