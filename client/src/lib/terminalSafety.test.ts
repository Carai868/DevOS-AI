import { describe, expect, it } from "vitest";
import { validateTerminalCommand, validateWorkspacePath } from "../../../shared/terminalSafety";

describe("terminal safety helpers", () => {
  it("rejects shell metacharacters and unsafe command input", () => {
    expect(() => validateTerminalCommand("python script.py && rm -rf /tmp")).toThrow(/unsafe/i);
    expect(() => validateTerminalCommand("echo hi; cat /etc/passwd")).toThrow(/unsafe/i);
    expect(() => validateTerminalCommand("python script.py | grep ERROR")).toThrow(/unsafe/i);
    expect(() => validateTerminalCommand("python script.py > output.txt")).toThrow(/unsafe/i);
    expect(() => validateTerminalCommand("python script.py\nrm -rf /tmp")).toThrow(/unsafe/i);
  });

  it("accepts simple commands and stays inside the workspace root", () => {
    const command = validateTerminalCommand('python "./scripts/example.py"');
    expect(command).toContain("python");

    const cwd = validateWorkspacePath(process.cwd(), process.cwd());
    expect(typeof cwd).toBe("string");
    expect(cwd.length).toBeGreaterThan(0);

    expect(() => validateWorkspacePath("/tmp", process.cwd())).toThrow(/workspace/i);
  });
});
