import type { CryptographicAsset } from "./types";

export type CryptoAlgorithmPolicyStatus =
  | "compliant"
  | "warning"
  | "non_compliant";

export type CryptoAssetPolicyVerdict = "allowed" | "review" | "not_allowed";

export interface CryptoAlgorithmPolicyPosture {
  id: string;
  name: string;
  status: CryptoAlgorithmPolicyStatus;
  metric: number;
  /** Single caption under the metric. */
  summary: string;
}

export interface CryptoAssetPolicyResult {
  id: string;
  name: string;
  status: CryptoAlgorithmPolicyStatus;
  /** Short label for table chips. */
  chipLabel: string;
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
    chipLabel: "Deprecated",
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
    chipLabel: "Key strength",
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
    chipLabel: "Classical only",
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
    chipLabel: "Unlisted",
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

/** Non-compliant or warning policy results — used for table chips and drawer detail. */
export function getCryptoAssetPolicyIssues(
  asset: CryptographicAsset,
  options: { forTable?: boolean } = {},
): CryptoAssetPolicyResult[] {
  return getCryptoAssetPolicyResults(asset).filter(
    (result) =>
      result.status !== "compliant" &&
      (!options.forTable || result.id !== "post-quantum-readiness"),
  );
}

/** Whether this asset is allowed, needs review, or is not allowed. */
export function getCryptoAssetPolicyVerdict(
  asset: CryptographicAsset,
): CryptoAssetPolicyVerdict {
  const results = getCryptoAssetPolicyResults(asset);

  if (results.some((result) => result.status === "non_compliant")) {
    return "not_allowed";
  }

  if (results.some((result) => result.status === "warning")) {
    return "review";
  }

  return "allowed";
}

export const cryptoAssetPolicyVerdictLabel: Record<
  CryptoAssetPolicyVerdict,
  { text: string; color: "green" | "orange" | "red" }
> = {
  allowed: { text: "Allowed", color: "green" },
  review: { text: "Review required", color: "orange" },
  not_allowed: { text: "Not allowed", color: "red" },
};

/** Prototype posture for organizational cryptographic algorithm policies. */
export function getCryptographicAlgorithmPolicyPosture(
  assets: CryptographicAsset[],
): CryptoAlgorithmPolicyPosture[] {
  const deprecatedAssets = assets.filter(
    (asset) => evaluateDeprecatedPolicy(asset).status === "non_compliant",
  );
  const deprecatedNames = [
    ...new Set(deprecatedAssets.map((asset) => asset.name)),
  ].sort();

  const weakKeyAssets = assets.filter(
    (asset) => evaluateKeyStrengthPolicy(asset).status === "warning",
  );
  const pqcAssets = assets.filter((asset) => {
    const result = evaluatePostQuantumPolicy(asset);
    return result.applies && result.status === "compliant";
  });

  const unapprovedAssets = assets.filter(
    (asset) => evaluateCatalogPolicy(asset).status === "warning",
  );

  return [
    {
      id: "deprecated-algorithms",
      name: "Deprecated algorithms",
      status:
        deprecatedAssets.length > 0 ? "non_compliant" : "compliant",
      metric: deprecatedAssets.length,
      summary:
        deprecatedAssets.length > 0
          ? `Assets using ${deprecatedNames.join(", ")}`
          : "No weak or deprecated primitives",
    },
    {
      id: "minimum-key-strength",
      name: "Minimum key strength",
      status: weakKeyAssets.length > 0 ? "warning" : "compliant",
      metric: weakKeyAssets.length,
      summary:
        weakKeyAssets.length > 0
          ? "Private key below minimum strength"
          : "All key material meets minimums",
    },
    {
      id: "post-quantum-readiness",
      name: "Post-quantum readiness",
      status: pqcAssets.length > 0 ? "compliant" : "warning",
      metric: pqcAssets.length,
      summary:
        pqcAssets.length > 0
          ? "Post-quantum algorithms inventoried"
          : "Classical crypto only; no PQC in scope",
    },
    {
      id: "approved-algorithm-catalog",
      name: "Approved algorithm catalog",
      status: unapprovedAssets.length > 0 ? "warning" : "compliant",
      metric: unapprovedAssets.length,
      summary:
        unapprovedAssets.length > 0
          ? "Assets outside the approved catalog"
          : "All algorithms on approved list",
    },
  ];
}

export const cryptoAlgorithmPolicyStatusLabel: Record<
  CryptoAlgorithmPolicyStatus,
  { text: string; color: "green" | "orange" | "red" }
> = {
  compliant: { text: "Compliant", color: "green" },
  warning: { text: "Warning", color: "orange" },
  non_compliant: { text: "Non-compliant", color: "red" },
};
