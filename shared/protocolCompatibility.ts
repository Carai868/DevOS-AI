export interface ProtocolManifest {
  protocol: "MCP" | "A2A";
  transport: string;
  endpoint: string;
  capabilities: string[];
  status: "available" | "preview";
}

export function buildMcpManifest(): ProtocolManifest {
  return {
    protocol: "MCP",
    transport: "http",
    endpoint: "/api/mcp",
    capabilities: ["tools", "resources", "prompts"],
    status: "available",
  };
}

export function buildA2AManifest(): ProtocolManifest {
  return {
    protocol: "A2A",
    transport: "http",
    endpoint: "/api/a2a/message",
    capabilities: ["message", "task", "stream"],
    status: "preview",
  };
}
