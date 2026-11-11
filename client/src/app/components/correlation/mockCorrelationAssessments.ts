import type { VulnerabilityStatus } from "@app/api/models";

import type {
  CorrelationAssertionStatus,
  CorrelationAssessment,
  CorrelationConfidenceFactor,
  CorrelationEvidenceDetail,
  CorrelationVerdict,
} from "./types";

const verdictFromStatus = (
  status: VulnerabilityStatus | undefined,
): CorrelationVerdict => {
  switch (status) {
    case "affected":
      return "affected";
    case "fixed":
      return "fixed";
    case "not_affected":
    case "known_not_affected":
      return "not_affected";
    case "under_investigation":
      return "under_investigation";
    default:
      return "none";
  }
};

const hashKey = (key: string): number => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % 97;
  }
  return hash;
};

const factorsFor = (key: string): CorrelationConfidenceFactor[] => {
  const hash = hashKey(key);
  const matchMethod = hash % 2 === 0 ? 0.8 : 0.5;
  const versionRange = hash % 3 === 0 ? 1 : hash % 3 === 1 ? 0.7 : 0.6;
  const productContext = hash % 5 === 0 ? 0.7 : 0.8;

  return [
    {
      label:
        matchMethod >= 0.8
          ? "CPE with the exact version"
          : "CPE version in range",
      factor: matchMethod,
      description:
        matchMethod >= 0.8
          ? "The advisory's CPE states the component's version."
          : "The advisory's CPE has no version; the component's version is in the version range of the statement.",
    },
    {
      label:
        versionRange === 1
          ? "Status for this version"
          : "Range derived by a rule",
      factor: versionRange,
      description:
        versionRange === 1
          ? "The status is stated for this version directly."
          : "The advisory states a version range; this version is derived from that rule.",
    },
    {
      label: productContext >= 0.8 ? "Product match" : "Product not confirmed",
      factor: productContext,
      description:
        productContext >= 0.8
          ? "The product identified in the SBOM matches the product named in the advisory."
          : "Nothing in the SBOM confirms the product the statement is about; confidence is reduced.",
    },
  ];
};

const percentFromFactors = (factors: CorrelationConfidenceFactor[]): number =>
  Math.round(
    factors.reduce((acc, factor) => acc * factor.factor, 1) * 100,
  );

const buildEvidence = (
  vulnerabilityId: string,
  verdict: CorrelationVerdict,
  hasConflict: boolean,
  factors: CorrelationConfidenceFactor[],
): CorrelationEvidenceDetail[] => {
  if (verdict === "none") {
    return [];
  }

  const confidencePercent = percentFromFactors(factors);
  const primaryStatus = verdict as CorrelationAssertionStatus;

  if (vulnerabilityId === "CVE-2024-0232") {
    return [
      {
        id: "ev-0232-1",
        assertionStatus: "affected",
        confidencePercent,
        confidenceFactors: factors,
        advisoryId: "adv-0001-0001-0001-000000000001",
        advisoryIdentifier: "RHSA-2024:0232",
        advisoryType: "csaf",
        extractor: "cpe",
        matchedValue: {
          identifier: "cpe:/a:redhat:enterprise_linux:9",
          ranges: [">= 3.34.0, < 3.34.1"],
        },
        products: [
          {
            name: "Red Hat Enterprise Linux 9",
            category: "default_component_of",
          },
        ],
        providerName: "Red Hat",
        providerMatch: "provider",
        remediations: [
          {
            category: "vendor_fix",
            details: "Fixed in sqlite 3.34.1-1.el9",
            url: "https://access.redhat.com/errata/RHSA-2024:0232",
          },
        ],
        createdAt: "2024-01-16T14:00:00Z",
      },
      {
        id: "ev-0232-2",
        assertionStatus: "not_affected",
        confidencePercent: Math.max(20, confidencePercent - 18),
        confidenceFactors: factors.map((factor, index) =>
          index === 2 ? { ...factor, factor: 0.7 } : factor,
        ),
        advisoryId: "adv-0002-0002-0002-000000000002",
        advisoryIdentifier: "RHSA-2024:7848",
        advisoryType: "csaf",
        extractor: "purl",
        matchedValue: {
          identifier: "pkg:rpm/redhat/sqlite",
          ranges: [">= 3.34.0"],
        },
        products: [{ name: "Red Hat Enterprise Linux 9" }],
        providerName: "Red Hat",
        providerMatch: "name",
        remediations: [],
        createdAt: "2024-10-09T12:00:00Z",
      },
      {
        id: "ev-0232-3",
        assertionStatus: "affected",
        confidencePercent: Math.max(15, confidencePercent - 10),
        confidenceFactors: factors,
        advisoryId: "adv-0001-0001-0001-000000000001",
        advisoryIdentifier: "RHSA-2024:0232",
        advisoryType: "csaf",
        extractor: "purl",
        matchedValue: {
          identifier: "pkg:rpm/redhat/sqlite",
        },
        products: [{ name: "Red Hat Enterprise Linux 9" }],
        providerName: "Red Hat",
        providerMatch: "provider",
        remediations: [
          {
            category: "vendor_fix",
            details: "Fixed in sqlite 3.34.1-1.el9",
          },
        ],
        createdAt: "2024-01-16T14:00:00Z",
      },
      {
        id: "ev-0232-4",
        assertionStatus: "affected",
        confidencePercent: Math.max(10, confidencePercent - 22),
        confidenceFactors: factors,
        advisoryId: "adv-0001-0001-0001-000000000001",
        advisoryIdentifier: "RHSA-2024:0232",
        advisoryType: "csaf",
        extractor: "cpe",
        matchedValue: {
          identifier: "cpe:/a:redhat:enterprise_linux:9::appstream",
          ranges: ["< 3.34.1"],
        },
        products: [
          {
            name: "Red Hat Enterprise Linux 9 AppStream",
            category: "default_component_of",
          },
        ],
        providerName: "Red Hat",
        remediations: [],
        createdAt: "2024-01-16T14:00:00Z",
      },
    ];
  }

  const count = factors.length + (vulnerabilityId.length % 2);
  const statuses: CorrelationAssertionStatus[] = hasConflict
    ? [
        primaryStatus,
        primaryStatus === "affected" ? "not_affected" : "affected",
        primaryStatus,
      ]
    : [primaryStatus, primaryStatus, primaryStatus];

  return Array.from({ length: count }, (_, index) => {
    const status = statuses[index % statuses.length];
    return {
      id: `ev-${vulnerabilityId}-${index + 1}`,
      assertionStatus: status,
      confidencePercent: Math.max(10, confidencePercent - index * 8),
      confidenceFactors: factors,
      advisoryId:
        index % 2 === 0
          ? "adv-0001-0001-0001-000000000001"
          : "adv-0002-0002-0002-000000000002",
      advisoryIdentifier:
        index % 2 === 0 ? "RHSA-2024:0232" : "RHSA-2024:7848",
      advisoryType: "csaf",
      extractor: index % 2 === 0 ? "cpe" : "purl",
      matchedValue: {
        identifier:
          index % 2 === 0
            ? "cpe:/a:redhat:enterprise_linux:9"
            : `pkg:rpm/redhat/${vulnerabilityId.toLowerCase()}`,
        ranges: index % 2 === 0 ? [">= 1.0.0, < 1.2.0"] : undefined,
      },
      products: [{ name: "Red Hat Enterprise Linux 9" }],
      providerName: "Red Hat",
      providerMatch: index === 0 ? "provider" : undefined,
      remediations:
        status === "affected" && index === 0
          ? [
              {
                category: "vendor_fix" as const,
                details: "Update to the fixed package version",
              },
            ]
          : [],
      createdAt: "2024-06-01T12:00:00Z",
    };
  });
};

const assessmentWithEvidence = (
  vulnerabilityId: string,
  verdict: CorrelationVerdict,
  hasConflict: boolean,
  factors: CorrelationConfidenceFactor[],
): CorrelationAssessment => {
  const evidence = buildEvidence(
    vulnerabilityId,
    verdict,
    hasConflict,
    factors,
  );
  return {
    verdict,
    matchConfidencePercent: percentFromFactors(factors),
    hasConflict,
    evidenceCount: evidence.length,
    evidence,
    factors,
  };
};

/**
 * Prototype-only correlation assessment for a vulnerability row.
 * Deterministic mock so designs stay stable across reloads.
 */
export const getMockCorrelationAssessment = (
  vulnerabilityId: string,
  vulnerabilityStatus?: VulnerabilityStatus,
): CorrelationAssessment => {
  // Demo states for reviewers:
  // CVE-2024-0232 → Affected + conflict
  // CVE-2024-6119 → Affected
  // CVE-2024-9680 → loading
  // CVE-2024-12747 → Failed
  if (vulnerabilityId === "CVE-2024-9680") {
    return {
      verdict: "none",
      matchConfidencePercent: 0,
      hasConflict: false,
      evidenceCount: 0,
      evidence: [],
      factors: [],
      isLoading: true,
    };
  }
  if (vulnerabilityId === "CVE-2024-12747") {
    return {
      verdict: "none",
      matchConfidencePercent: 0,
      hasConflict: false,
      evidenceCount: 0,
      evidence: [],
      factors: [],
      isFailed: true,
      failureMessage:
        "Correlation could not be completed for this vulnerability. The status is unavailable until correlation succeeds.",
    };
  }
  if (vulnerabilityId === "CVE-2024-0232") {
    return assessmentWithEvidence(
      vulnerabilityId,
      "affected",
      true,
      factorsFor(vulnerabilityId),
    );
  }
  if (vulnerabilityId === "CVE-2024-6119") {
    return assessmentWithEvidence(
      vulnerabilityId,
      "affected",
      false,
      factorsFor(vulnerabilityId),
    );
  }

  const verdict = verdictFromStatus(vulnerabilityStatus);
  const factors = factorsFor(vulnerabilityId);
  const hasConflict = verdict !== "none" && hashKey(vulnerabilityId) % 4 === 0;
  return assessmentWithEvidence(vulnerabilityId, verdict, hasConflict, factors);
};
