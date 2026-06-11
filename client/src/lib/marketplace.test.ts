import { describe, expect, it } from "vitest";
import { buildExtensionInstallDir, normalizeExtensionName } from "./marketplace";

describe("marketplace helpers", () => {
  it("normalizes package names for install folders", () => {
    expect(normalizeExtensionName("@devos/terminal-theme")).toBe("devos-terminal-theme");
    expect(normalizeExtensionName("terminal-theme")).toBe("terminal-theme");
  });

  it("builds a stable install path under the workspace", () => {
    expect(buildExtensionInstallDir("@devos/terminal-theme", "/workspace")).toBe("/workspace/.devos/extensions/devos-terminal-theme");
  });
});
