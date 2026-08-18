import {
  getCryptoAssetPolicyVerdict,
  type CryptoAssetPolicyVerdict,
} from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

export type CryptoRecommendationGuidanceSource = "nist" | "cisa" | "eu";

export const CRYPTO_RECOMMENDATION_GUIDANCE_SOURCES: Array<{
  value: CryptoRecommendationGuidanceSource;
  label: string;
  /** Label used in recommendation help text (e.g. popover). */
  guidanceLabel: string;
}> = [
  { value: "nist", label: "NIST", guidanceLabel: "NIST" },
  { value: "cisa", label: "CISA", guidanceLabel: "CISA" },
  {
    value: "eu",
    label: "European agencies",
    guidanceLabel: "European government agencies",
  },
];

export const CRYPTO_RECOMMENDATION_GUIDANCE_STORAGE_KEY =
  "trustify.crypto.recommendationGuidanceSource";

export const DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE: CryptoRecommendationGuidanceSource =
  "nist";

export const getCryptoRecommendationGuidanceLabel = (
  guidanceSource: CryptoRecommendationGuidanceSource,
): string => {
  const match = CRYPTO_RECOMMENDATION_GUIDANCE_SOURCES.find(
    (source) => source.value === guidanceSource,
  );
  return match?.guidanceLabel ?? guidanceSource;
};

export const getCryptoRecommendationHeaderHelp = (
  guidanceSource: CryptoRecommendationGuidanceSource,
): string => {
  const guidanceLabel = getCryptoRecommendationGuidanceLabel(guidanceSource);
  return `Suggested replacement algorithms based on ${guidanceLabel} guidance configured for your organization. These recommendations are not Red Hat product guidance.`;
};

type GuidanceRecommendations = Record<
  CryptoRecommendationGuidanceSource,
  string
>;

const ALGORITHM_RECOMMENDATIONS: Record<string, GuidanceRecommendations> = {
  ECDSA: {
    nist: "ML-DSA-65",
    cisa: "ML-DSA-87",
    eu: "ML-DSA-65",
  },
  "ECDSA-P256": {
    nist: "ML-DSA-65",
    cisa: "ML-DSA-87",
    eu: "ML-DSA-65",
  },
  Ed25519: {
    nist: "ML-DSA-65",
    cisa: "ML-DSA-87",
    eu: "ML-DSA-65",
  },
  RSA: {
    nist: "ML-DSA-65",
    cisa: "ML-DSA-87",
    eu: "ML-DSA-65",
  },
  "RSA-PKCS1": {
    nist: "ML-DSA-65",
    cisa: "ML-DSA-87",
    eu: "ML-DSA-65",
  },
  ECDH: {
    nist: "ML-KEM-768",
    cisa: "ML-KEM-1024",
    eu: "ML-KEM-768",
  },
  MD5: {
    nist: "SHA-256",
    cisa: "SHA-256",
    eu: "SHA-256",
  },
  "SHA-1": {
    nist: "SHA-256",
    cisa: "SHA-256",
    eu: "SHA-256",
  },
  DES: {
    nist: "AES-256",
    cisa: "AES-256",
    eu: "AES-256",
  },
  "3DES": {
    nist: "AES-256",
    cisa: "AES-256",
    eu: "AES-256",
  },
  RC4: {
    nist: "AES-256-GCM",
    cisa: "AES-256-GCM",
    eu: "AES-256-GCM",
  },
};

const PRIMITIVE_RECOMMENDATIONS: Record<string, GuidanceRecommendations> = {
  signature: {
    nist: "ML-DSA-65",
    cisa: "ML-DSA-87",
    eu: "ML-DSA-65",
  },
  pke: {
    nist: "ML-KEM-768",
    cisa: "ML-KEM-1024",
    eu: "ML-KEM-768",
  },
  hash: {
    nist: "SHA-256",
    cisa: "SHA-256",
    eu: "SHA-256",
  },
  mac: {
    nist: "SHA-256",
    cisa: "SHA-256",
    eu: "SHA-256",
  },
  block_cipher: {
    nist: "AES-256",
    cisa: "AES-256",
    eu: "AES-256",
  },
};

const isGuidanceSource = (
  value: string,
): value is CryptoRecommendationGuidanceSource =>
  CRYPTO_RECOMMENDATION_GUIDANCE_SOURCES.some((source) => source.value === value);

export const parseCryptoRecommendationGuidanceSource = (
  value: string | null | undefined,
): CryptoRecommendationGuidanceSource => {
  if (value && isGuidanceSource(value)) {
    return value;
  }
  return DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE;
};

const lookupRecommendationTarget = (
  asset: CryptographicAsset,
  guidanceSource: CryptoRecommendationGuidanceSource,
): string | undefined => {
  const byName =
    ALGORITHM_RECOMMENDATIONS[asset.name] ??
    ALGORITHM_RECOMMENDATIONS[asset.algorithm];

  if (byName) {
    return byName[guidanceSource];
  }

  const primitive = asset.primitive?.toLowerCase();
  if (primitive && PRIMITIVE_RECOMMENDATIONS[primitive]) {
    return PRIMITIVE_RECOMMENDATIONS[primitive][guidanceSource];
  }

  return undefined;
};

const CLASSICAL_WITHOUT_PQC_REPLACEMENT = new Set([
  "AES",
  "AES-128",
  "AES-256",
  "bcrypt",
  "ChaCha20",
  "CSPRNG",
  "Poly1305",
  "SHA-256",
  "SHA-384",
  "SHA-512",
]);

const shouldSkipRecommendation = (
  asset: CryptographicAsset,
  replacement: string,
): boolean => {
  if (
    CLASSICAL_WITHOUT_PQC_REPLACEMENT.has(asset.name) ||
    CLASSICAL_WITHOUT_PQC_REPLACEMENT.has(asset.algorithm)
  ) {
    return true;
  }

  return replacement === asset.name || replacement === asset.algorithm;
};

const shouldShowRecommendation = (
  verdict: CryptoAssetPolicyVerdict,
): boolean => verdict === "warning" || verdict === "non_compliant";

/** Replacement algorithm from selected external guidance, when policy is not compliant. */
export function getCryptoAlgorithmRecommendation(
  asset: CryptographicAsset,
  guidanceSource: CryptoRecommendationGuidanceSource,
): string | undefined {
  if (asset.assetType !== "algorithm") {
    return undefined;
  }

  const verdict = getCryptoAssetPolicyVerdict(asset);
  if (!shouldShowRecommendation(verdict)) {
    return undefined;
  }

  const replacement = lookupRecommendationTarget(asset, guidanceSource);
  if (!replacement || shouldSkipRecommendation(asset, replacement)) {
    return undefined;
  }

  return replacement;
}

export function formatCryptoAlgorithmRecommendation(
  asset: CryptographicAsset,
  guidanceSource: CryptoRecommendationGuidanceSource,
): string | undefined {
  const replacement = getCryptoAlgorithmRecommendation(asset, guidanceSource);
  if (!replacement) {
    return undefined;
  }
  return `Replace with ${replacement}`;
}

export function getCryptoAlgorithmRecommendationTooltip(
  asset: CryptographicAsset,
  guidanceSource: CryptoRecommendationGuidanceSource,
): string | undefined {
  const replacement = getCryptoAlgorithmRecommendation(asset, guidanceSource);
  if (!replacement) {
    return undefined;
  }

  const guidanceLabel =
    CRYPTO_RECOMMENDATION_GUIDANCE_SOURCES.find(
      (source) => source.value === guidanceSource,
    )?.label ?? guidanceSource;

  return `${guidanceLabel} recommends replacing ${asset.name} with ${replacement}`;
}
