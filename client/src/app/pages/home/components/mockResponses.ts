export interface AgentResponse {
  answer: string;
  detail: string;
  sources: string[];
  severity?: "critical" | "high" | "medium" | "low";
  items?: string[];
}

interface ResponseRule {
  keywords: string[];
  response: AgentResponse;
}

const RESPONSE_RULES: ResponseRule[] = [
  {
    keywords: ["cve-2024-12345", "cve"],
    response: {
      answer:
        "2 products are directly affected by CVE-2024-12345, with 1 requiring immediate action.",
      detail:
        "The vulnerability in libxml2 (versions < 2.9.14) is present in 4 ingested SBOMs. Two are in production deployments running RHEL 9.4 and UBI 9-minimal. A CSAF advisory (RHSA-2026:1234) has been published with a fix. One deployment has no VEX mitigation documented.",
      sources: [
        "RHSA-2026:1234",
        "SBOM: RHEL 9.4",
        "SBOM: UBI 9-minimal",
        "VEX: CSAF",
      ],
      severity: "critical",
      items: ["RHEL 9.4 (production)", "UBI 9-minimal (production)"],
    },
  },
  {
    keywords: ["log4j", "blast radius"],
    response: {
      answer:
        "Log4j (CVE-2021-44228) affects 3 SBOMs across 2 products. All instances have been patched or mitigated.",
      detail:
        "Log4Shell was found in transitive dependencies of 3 SBOMs. Two have been updated to log4j 2.17.1+. The remaining instance in Project-Phoenix carries a VEX 'Not Affected' justification because the vulnerable JNDI lookup feature is disabled.",
      sources: [
        "CVE-2021-44228",
        "SBOM: Project-Phoenix",
        "SBOM: RHEL 9.3",
        "VEX: Red Hat",
      ],
      severity: "medium",
      items: [
        "RHEL 9.3 — patched (2.17.1)",
        "RHEL 9.4 — patched (2.17.1)",
        "Project-Phoenix — mitigated (JNDI disabled)",
      ],
    },
  },
  {
    keywords: ["sbom", "inventory", "how many"],
    response: {
      answer:
        "You have 10 SBOMs ingested, covering 6 products and 12,483 total packages.",
      detail:
        "The most recent upload was Red Hat Enterprise Linux 9.4 (ingested Nov 16, 2025). 8 SBOMs are in CycloneDX format and 2 are SPDX. The largest SBOM (RHEL 9.4) contains 1,842 packages.",
      sources: [
        "SBOM: RHEL 9.4",
        "SBOM: UBI 9-minimal",
        "SBOM: Fedora 39",
      ],
      items: [
        "RHEL 9.4 — 1,842 packages",
        "UBI 9-minimal — 287 packages",
        "Fedora 39 — 2,104 packages",
      ],
    },
  },
  {
    keywords: ["unpatched", "critical", "patch"],
    response: {
      answer:
        "There are 2 unpatched critical CVEs across your ingested SBOMs.",
      detail:
        "CVE-2026-4432 affects libxml2 in RHEL 9.4 and UBI 9-minimal with no fix applied yet. CVE-2026-3891 affects OpenSSL 3.1.4 in Project-Phoenix — a patch (3.1.5) is available but not yet applied.",
      sources: ["CVE-2026-4432", "CVE-2026-3891", "SBOM: Project-Phoenix"],
      severity: "critical",
      items: [
        "CVE-2026-4432 — libxml2 (RHEL 9.4, UBI 9-minimal)",
        "CVE-2026-3891 — OpenSSL 3.1.4 (Project-Phoenix)",
      ],
    },
  },
  {
    keywords: ["vex", "rhel 9", "rhel"],
    response: {
      answer:
        "RHEL 9 has 12 VEX statements across 3 advisories. 9 are marked 'Not Affected', 2 are 'Fixed', and 1 is 'Under Investigation'.",
      detail:
        "The most recent VEX update was for RHSA-2026:1234, covering CVE-2026-4432. The 'Under Investigation' item relates to a kernel vulnerability (CVE-2025-9921) in containerized workloads.",
      sources: [
        "RHSA-2026:1234",
        "RHSA-2026:0987",
        "SBOM: RHEL 9.4",
        "VEX: CSAF",
      ],
      items: [
        "Not Affected — 9 statements",
        "Fixed — 2 statements",
        "Under Investigation — 1 statement",
      ],
    },
  },
  {
    keywords: ["license", "conflict", "gpl"],
    response: {
      answer:
        "1 license conflict detected: a GPL-3.0 dependency in Project-Phoenix conflicts with your commercial distribution policy.",
      detail:
        "The transitive dependency lib-helper-alpha (v2.1.0) introduced GPL-3.0 in the latest SBOM upload. This package is pulled in through express-utils and is not directly declared.",
      sources: ["SBOM: Project-Phoenix", "Policy: Commercial Distribution"],
      severity: "high",
      items: [
        "lib-helper-alpha@2.1.0 — GPL-3.0 (transitive via express-utils)",
      ],
    },
  },
];

const FALLBACK_RESPONSE: AgentResponse = {
  answer:
    "I searched across your SBOMs, advisories, and VEX data but didn't find a specific match for that query.",
  detail:
    "Try asking about a specific CVE, product name, or topic like 'unpatched critical CVEs' or 'license conflicts'. You can also browse the SBOMs and Vulnerabilities pages directly.",
  sources: [],
};

export function getAgentResponse(query: string): AgentResponse {
  const lowerQuery = query.toLowerCase();

  for (const rule of RESPONSE_RULES) {
    if (rule.keywords.some((kw) => lowerQuery.includes(kw))) {
      return rule.response;
    }
  }

  return FALLBACK_RESPONSE;
}
