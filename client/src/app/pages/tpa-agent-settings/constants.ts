export const MOCK_AGENT_PROMPTS = [
  {
    id: "cve-impact",
    name: "CVE impact",
    description: "Which products are affected by a given CVE?",
    scope: "Global",
    updatedAt: "2026-05-18",
  },
  {
    id: "critical-cves",
    name: "Critical CVEs",
    description: "List unpatched critical CVEs across evaluated SBOMs.",
    scope: "Global",
    updatedAt: "2026-05-15",
  },
  {
    id: "sbom-search",
    name: "SBOM search",
    description: "Find SBOMs that contain a specific package or version.",
    scope: "Team: supply-chain",
    updatedAt: "2026-05-10",
  },
];

export const MOCK_MCP_SERVERS = [
  {
    id: "trustify-catalog",
    name: "Trustify catalog",
    transport: "Streamable HTTP",
    endpoint: "/api/mcp/catalog",
    status: "Connected",
  },
  {
    id: "sbom-tools",
    name: "SBOM tools",
    transport: "SSE",
    endpoint: "/api/mcp/sbom",
    status: "Connected",
  },
  {
    id: "policy-conforma",
    name: "Policy (Conforma)",
    transport: "Streamable HTTP",
    endpoint: "/api/mcp/policy",
    status: "Disabled",
  },
];
