import type { CryptographicAsset } from "./types";

export type CryptoAlgorithmPolicyStatus =
  | "compliant"
  | "warning"
  | "non_compliant";

export type CryptoAssetPolicyVerdict = "compliant" | "warning" | "non_compliant";

export interface CryptoAlgorithmPolicyPosture {
  id: string;
  name: string;
  status: CryptoAlgorithmPolicyStatus;
  /** Whole-number percentage shown on the readiness summary card (0–100). */
  percent: number;
  /** Single caption under the percentage. */
  summary: string;
}

export interface CryptoAssetPolicyResult {
  id: string;
  name: string;
  status: CryptoAlgorithmPolicyStatus;
  /** Short finding label shown under Reason in the drawer (e.g. Deprecated). */
  reasonLabel: string;
  summary: string;
  applies: boolean;
}

const DEPRECATED_ALGORITHM_NAMES = new Set([
  "MD5",
  "SHA-1",
  "DES",
  "3DES",
  "RC4",
]);

const PQC_ALGORITHM_HINTS = [
  "ml-kem",
  "ml-dsa",
  "slh-dsa",
  "kyber",
  "dilithium",
  "sphincs",
  "falcon",
];

const toPercent = (part: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
};

const getAlgorithmAssets = (assets: CryptographicAsset[]): CryptographicAsset[] =>
  assets.filter((asset) => asset.assetType === "algorithm");

const readinessPercentStatus = (percent: number): CryptoAlgorithmPolicyStatus => {
  if (percent >= 80) {
    return "compliant";
  }
  if (percent >= 40) {
    return "warning";
  }
  return "non_compliant";
};

const classicalShareStatus = (percent: number): CryptoAlgorithmPolicyStatus => {
  if (percent === 0) {
    return "compliant";
  }
  if (percent <= 40) {
    return "warning";
  }
  return "non_compliant";
};

const APPROVED_ALGORITHM_NAMES = new Set([
  "AES",
  "AES-128",
  "AES-256",
  "SHA-256",
  "SHA-384",
  "SHA-512",
  "RSA",
  "ECDSA",
  "ECDH",
  "Ed25519",
  "ChaCha20",
  "Poly1305",
  "bcrypt",
  "CSPRNG",
  "ML-KEM-768",
  "ML-KEM-512",
  "ML-KEM-1024",
  "ML-DSA-65",
  "ML-DSA-44",
  "ML-DSA-87",
  "SLH-DSA-SHA2-128s",
  "SLH-DSA-SHA2-128f",
  "SLH-DSA-SHA2-256f",
]);

function assetMatchesNameSet(
  asset: CryptographicAsset,
  names: Set<string>,
): boolean {
  return names.has(asset.name) || names.has(asset.algorithm);
}

function isPqcAsset(asset: CryptographicAsset): boolean {
  const haystack = [
    asset.name,
    asset.algorithm,
    asset.primitive,
    asset.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return PQC_ALGORITHM_HINTS.some((hint) => haystack.includes(hint));
}

function isWeakKeyMaterial(asset: CryptographicAsset): boolean {
  if (asset.assetType === "related-crypto-material") {
    const material = (asset.materialType ?? asset.name).toLowerCase();
    return material.includes("private-key") || material.includes("secret");
  }

  return false;
}

function isDeprecatedAsset(asset: CryptographicAsset): boolean {
  return assetMatchesNameSet(asset, DEPRECATED_ALGORITHM_NAMES);
}

/** Matches the “Algorithms meeting PQC policy” inventory metric. */
function passesSuggestedPqcReadinessPolicy(
  asset: CryptographicAsset,
): boolean {
  if (asset.assetType !== "algorithm" || isDeprecatedAsset(asset)) {
    return false;
  }
  return isPqcAsset(asset);
}

const sbomAlgorithmReadinessPercent = (
  sbomAssets: CryptographicAsset[],
): number => {
  const algorithms = getAlgorithmAssets(sbomAssets);
  if (algorithms.length === 0) {
    return 0;
  }
  const meeting = algorithms.filter((asset) =>
    passesSuggestedPqcReadinessPolicy(asset),
  ).length;
  return toPercent(meeting, algorithms.length);
};

/** SBOM meets suggested policy when a meaningful share of its algorithms are PQC-ready. */
const sbomPassesReadinessPolicy = (sbomAssets: CryptographicAsset[]): boolean => {
  return sbomAlgorithmReadinessPercent(sbomAssets) >= 40;
};

function isUnlistedAlgorithm(asset: CryptographicAsset): boolean {
  return (
    asset.assetType === "algorithm" &&
    !assetMatchesNameSet(asset, APPROVED_ALGORITHM_NAMES) &&
    !isDeprecatedAsset(asset)
  );
}

function evaluateDeprecatedPolicy(
  asset: CryptographicAsset,
): CryptoAssetPolicyResult {
  const applies = asset.assetType === "algorithm";
  const flagged = applies && isDeprecatedAsset(asset);

  return {
    id: "deprecated-algorithms",
    name: "Deprecated algorithms",
    reasonLabel: "Deprecated",
    applies,
    status: flagged ? "non_compliant" : "compliant",
    summary: flagged
      ? `${asset.name} is a deprecated primitive`
      : "Not a deprecated primitive",
  };
}

function evaluateKeyStrengthPolicy(
  asset: CryptographicAsset,
): CryptoAssetPolicyResult {
  const applies = asset.assetType === "related-crypto-material";
  const flagged = applies && isWeakKeyMaterial(asset);

  return {
    id: "minimum-key-strength",
    name: "Minimum key strength",
    reasonLabel: "Key strength",
    applies,
    status: flagged ? "warning" : "compliant",
    summary: flagged
      ? "Private key material below minimum strength"
      : "Key material meets minimum strength",
  };
}

function evaluatePostQuantumPolicy(
  asset: CryptographicAsset,
): CryptoAssetPolicyResult {
  const applies = asset.assetType === "algorithm";
  const flagged = applies && !isPqcAsset(asset);

  return {
    id: "post-quantum-readiness",
    name: "Post-quantum readiness",
    reasonLabel: "Classical only",
    applies,
    status: flagged ? "warning" : "compliant",
    summary: flagged
      ? "Classical algorithm; not post-quantum"
      : "Post-quantum algorithm",
  };
}

function evaluateCatalogPolicy(
  asset: CryptographicAsset,
): CryptoAssetPolicyResult {
  const applies = asset.assetType === "algorithm";
  const flagged = applies && isUnlistedAlgorithm(asset);

  return {
    id: "approved-algorithm-catalog",
    name: "Approved algorithm catalog",
    reasonLabel: "Unlisted",
    applies,
    status: flagged ? "warning" : "compliant",
    summary: flagged
      ? "Algorithm is not on the approved catalog"
      : "Algorithm is on the approved catalog",
  };
}

const evaluateAssetPolicies = (
  asset: CryptographicAsset,
): CryptoAssetPolicyResult[] => [
  evaluateDeprecatedPolicy(asset),
  evaluateKeyStrengthPolicy(asset),
  evaluatePostQuantumPolicy(asset),
  evaluateCatalogPolicy(asset),
];

/** Per-asset policy results for policies that apply to this asset. */
export function getCryptoAssetPolicyResults(
  asset: CryptographicAsset,
): CryptoAssetPolicyResult[] {
  return evaluateAssetPolicies(asset).filter((result) => result.applies);
}

/** Whether this asset is compliant, has warnings, or is non-compliant. */
export function getCryptoAssetPolicyVerdict(
  asset: CryptographicAsset,
): CryptoAssetPolicyVerdict {
  if (asset.assetType === "related-crypto-material") {
    return evaluateKeyStrengthPolicy(asset).status === "warning"
      ? "warning"
      : "compliant";
  }

  if (asset.assetType === "algorithm") {
    if (isDeprecatedAsset(asset)) {
      return "non_compliant";
    }
    if (passesSuggestedPqcReadinessPolicy(asset)) {
      return "compliant";
    }
    return "warning";
  }

  return "compliant";
}

/** Drawer reasons: findings that explain the overall verdict (not secondary advisories). */
export function getCryptoAssetPolicyReasons(
  asset: CryptographicAsset,
): CryptoAssetPolicyResult[] {
  const verdict = getCryptoAssetPolicyVerdict(asset);
  const findings = getCryptoAssetPolicyResults(asset).filter(
    (result) => result.status !== "compliant",
  );

  if (verdict === "non_compliant") {
    return findings.filter((result) => result.status === "non_compliant");
  }

  if (verdict === "warning") {
    return findings.filter((result) => result.status === "warning");
  }

  return [];
}

export const cryptoAssetPolicyVerdictLabel: Record<
  CryptoAssetPolicyVerdict,
  { text: string; color: "green" | "orange" | "red" }
> = {
  compliant: { text: "Compliant", color: "green" },
  warning: { text: "Warning", color: "orange" },
  non_compliant: { text: "Non-compliant", color: "red" },
};

export const cryptoAssetPolicyPendingLabel = {
  text: "Pending",
  color: "grey" as const,
};

/** Prototype PQC readiness summary for the Cryptography inventory page. */
export function getCryptographicAlgorithmPolicyPosture(
  assets: CryptographicAsset[],
  options?: { includeSbomsMeetingPolicy?: boolean },
): CryptoAlgorithmPolicyPosture[] {
  const includeSbomsMeetingPolicy = options?.includeSbomsMeetingPolicy ?? true;
  const algorithmAssets = getAlgorithmAssets(assets);
  const algorithmTotal = algorithmAssets.length;

  const algorithmsMeetingPolicy = algorithmAssets.filter((asset) =>
    passesSuggestedPqcReadinessPolicy(asset),
  ).length;
  const algorithmsMeetingPolicyPercent = toPercent(
    algorithmsMeetingPolicy,
    algorithmTotal,
  );

  const sbomAssetMap = new Map<string, CryptographicAsset[]>();
  if (includeSbomsMeetingPolicy) {
    for (const asset of assets) {
      for (const sbom of asset.sboms ?? []) {
        const existing = sbomAssetMap.get(sbom.id) ?? [];
        existing.push(asset);
        sbomAssetMap.set(sbom.id, existing);
      }
    }
  }
  const sbomIds = [...sbomAssetMap.keys()];
  const sbomTotal = sbomIds.length;
  const sbomsMeetingPolicy = sbomIds.filter((sbomId) =>
    sbomPassesReadinessPolicy(sbomAssetMap.get(sbomId) ?? []),
  ).length;
  const sbomsMeetingPolicyPercent = toPercent(sbomsMeetingPolicy, sbomTotal);

  const classicalAlgorithms = algorithmAssets.filter(
    (asset) =>
      !isDeprecatedAsset(asset) && !passesSuggestedPqcReadinessPolicy(asset),
  ).length;
  const classicalAlgorithmPercent = toPercent(
    classicalAlgorithms,
    algorithmTotal,
  );

  const postures: CryptoAlgorithmPolicyPosture[] = [
    {
      id: "algorithms-meeting-readiness-policy",
      name: "Algorithms meeting PQC",
      status: readinessPercentStatus(algorithmsMeetingPolicyPercent),
      percent: algorithmsMeetingPolicyPercent,
      summary:
        algorithmTotal > 0
          ? `${algorithmsMeetingPolicy} of ${algorithmTotal} inventoried algorithms are compliant with the suggested PQC policy`
          : "No algorithm assets in inventory",
    },
    {
      id: "classical-algorithm-share",
      name: "Classical algorithm share",
      status: classicalShareStatus(classicalAlgorithmPercent),
      percent: classicalAlgorithmPercent,
      summary:
        algorithmTotal > 0
          ? `${classicalAlgorithms} of ${algorithmTotal} algorithms use classical primitives only`
          : "No algorithm assets in inventory",
    },
    ...(includeSbomsMeetingPolicy
      ? [
          {
            id: "sboms-meeting-readiness-policy",
            name: "SBOMs meeting PQC",
            status: readinessPercentStatus(sbomsMeetingPolicyPercent),
            percent: sbomsMeetingPolicyPercent,
            summary:
              sbomTotal > 0
                ? `${sbomsMeetingPolicy} of ${sbomTotal} SBOMs with cryptographic assets are compliant with the suggested PQC policy`
                : "No SBOMs linked to cryptographic assets",
          },
        ]
      : []),
  ];

  return postures;
}

export const CRYPTO_POLICY_VERDICT_FILTER_OPTIONS: Array<{
  value: CryptoAssetPolicyVerdict;
  label: string;
}> = [
  { value: "compliant", label: "Compliant" },
  { value: "warning", label: "Warning" },
  { value: "non_compliant", label: "Non-compliant" },
];

export const CRYPTO_COMPLIANCE_ISSUE_FILTER_OPTIONS = [
  { value: "Deprecated", label: "Deprecated" },
  { value: "Classical only", label: "Classical only" },
] as const;

export type CryptoComplianceIssueFilter = (
  typeof CRYPTO_COMPLIANCE_ISSUE_FILTER_OPTIONS
)[number]["value"];

export const cryptoAlgorithmPolicyStatusLabel: Record<
  CryptoAlgorithmPolicyStatus,
  { text: string; color: "green" | "orange" | "red" }
> = {
  compliant: { text: "Compliant", color: "green" },
  warning: { text: "Warning", color: "orange" },
  non_compliant: { text: "Non-compliant", color: "red" },
};
