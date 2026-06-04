/** Page context passed to the agent when "Context" is on (prototype). */
export interface TpaPageContext {
  pageKey: string;
  /** Short label for the context control (e.g. SBOM details). */
  label: string;
  /** Longer description for tooltips and future prompts. */
  summary: string;
}

const matchDetail = (
  pathname: string,
  prefix: string,
  paramId: string | undefined,
  label: string,
  summaryPrefix: string,
): TpaPageContext | null => {
  if (!paramId || !pathname.startsWith(`${prefix}/`)) {
    return null;
  }
  const rest = pathname.slice(prefix.length + 1);
  if (!rest || rest.includes("/")) {
    return null;
  }
  return {
    pageKey: `${prefix.slice(1)}-details`,
    label,
    summary: `${summaryPrefix} (${paramId})`,
  };
};

/**
 * Resolve display context from the current route (no API fetch).
 */
export function resolveTpaPageContext(
  pathname: string,
  params: {
    sbomId?: string;
    advisoryId?: string;
    vulnerabilityId?: string;
    packageId?: string;
    licenseName?: string;
  },
): TpaPageContext | null {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path === "/") {
    return {
      pageKey: "home",
      label: "Home",
      summary: "Trustify home dashboard",
    };
  }

  const detail =
    matchDetail(path, "/sboms", params.sbomId, "SBOM details", "SBOM") ??
    matchDetail(
      path,
      "/advisories",
      params.advisoryId,
      "Advisory details",
      "Advisory",
    ) ??
    matchDetail(
      path,
      "/vulnerabilities",
      params.vulnerabilityId,
      "Vulnerability details",
      "Vulnerability",
    ) ??
    matchDetail(
      path,
      "/packages",
      params.packageId,
      "Package details",
      "Package",
    );

  if (detail) {
    return detail;
  }

  const listRoutes: Array<{ path: string; pageKey: string; label: string }> = [
    { path: "/sboms", pageKey: "sbom-list", label: "SBOMs" },
    { path: "/advisories", pageKey: "advisory-list", label: "Advisories" },
    {
      path: "/vulnerabilities",
      pageKey: "vulnerability-list",
      label: "Vulnerabilities",
    },
    { path: "/packages", pageKey: "package-list", label: "Packages" },
    { path: "/cbom-prototype", pageKey: "cbom", label: "Cryptography" },
    { path: "/policy", pageKey: "policy", label: "Policy" },
    { path: "/models", pageKey: "models", label: "Models" },
    { path: "/search", pageKey: "search", label: "Search" },
    { path: "/importers", pageKey: "importers", label: "Importers" },
    { path: "/licenses", pageKey: "licenses", label: "Licenses" },
    { path: "/tpa-agent/prompts", pageKey: "agent-prompts", label: "Prompt manager" },
    { path: "/tpa-agent/mcp", pageKey: "agent-mcp", label: "MCP settings" },
  ];

  const list = listRoutes.find((route) => path === route.path);
  if (list) {
    return {
      pageKey: list.pageKey,
      label: list.label,
      summary: `${list.label} page`,
    };
  }

  if (path === "/sboms/upload") {
    return {
      pageKey: "sbom-upload",
      label: "Upload SBOM",
      summary: "SBOM upload",
    };
  }

  if (path === "/sboms/scan") {
    return {
      pageKey: "sbom-scan",
      label: "Scan SBOM",
      summary: "SBOM scan",
    };
  }

  if (path.startsWith("/licenses/") && params.licenseName) {
    return {
      pageKey: "license-details",
      label: "License",
      summary: `License ${decodeURIComponent(params.licenseName)}`,
    };
  }

  return null;
}
