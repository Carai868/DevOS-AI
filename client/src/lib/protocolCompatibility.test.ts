import { describe, expect, it } from "vitest";
import { buildMcpManifest, buildA2AManifest } from "../../../shared/protocolCompatibility";

describe("protocol compatibility helpers", () => {
  it("builds an MCP manifest with transport and capability metadata", () => {
    const manifest = buildMcpManifest();

    expect(manifest.protocol).toBe("MCP");
    expect(manifest.capabilities).toContain("tools");
    expect(manifest.transport).toBe("http");
  });

  it("builds an A2A manifest with agent messaging metadata", () => {
    const manifest = buildA2AManifest();

    expect(manifest.protocol).toBe("A2A");
    expect(manifest.capabilities).toContain("message");
    expect(manifest.endpoint).toContain("/api/a2a/message");
  });
});
