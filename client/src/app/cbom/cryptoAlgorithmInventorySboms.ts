import {
  getCryptoInventorySbomLinks,
  MOCK_CRYPTO_INVENTORY_SBOM_LINKS,
} from "./cryptoInventorySboms";
import type { CryptographicAssetSbomLink } from "./types";

const SBOM = {
  rhel: "a1b2c3d4-0001-4000-8000-000000000001",
  ocp: "a1b2c3d4-0002-4000-8000-000000000002",
  quarkus: "a1b2c3d4-0003-4000-8000-000000000003",
  amq: "a1b2c3d4-0004-4000-8000-000000000004",
  camel: "a1b2c3d4-0005-4000-8000-000000000005",
  ansible: "a1b2c3d4-0006-4000-8000-000000000006",
  quarkusAibom: "a1b2c3d4-0007-4000-8000-000000000007",
  acs: "a1b2c3d4-0008-4000-8000-000000000008",
  rhsso: "a1b2c3d4-0009-4000-8000-000000000009",
  serverless: "a1b2c3d4-0010-4000-8000-000000000010",
} as const;

/**
 * Prototype: which algorithms appear on which SBOMs in workspace inventory.
 * Spread across ten SBOMs; ~half meet suggested PQC policy at SBOM level.
 */
const SBOM_CRYPTO_ALGORITHM_ASSIGNMENTS: Record<string, string[]> = {
  [SBOM.rhel]: [
    "SHA-256",
    "RSA",
    "ECDH",
    "ECDSA",
    "SHA-512",
    "ML-KEM-768",
    "ML-DSA-65",
    "ML-KEM-512",
    "ML-DSA-44",
    "ML-KEM-1024",
  ],
  [SBOM.ocp]: [
    "SHA-256",
    "RSA",
    "MD5",
    "SHA-1",
    "ECDH",
    "ECDSA",
    "ECDSA-P256",
    "bcrypt",
    "CSPRNG",
    "OTR",
    "SLH-DSA-SHA2-256f",
  ],
  [SBOM.quarkus]: [
    "SHA-256",
    "RSA",
    "ECDH",
    "SHA-512",
    "ML-KEM-768",
    "ML-DSA-65",
    "ML-KEM-512",
    "ML-DSA-44",
  ],
  [SBOM.amq]: [
    "SHA-256",
    "RSA",
    "MD5",
    "SHA-1",
    "bcrypt",
    "RSA-PKCS1",
    "SHA-512",
    "other",
    "SLH-DSA-SHA2-128f",
  ],
  [SBOM.camel]: [
    "SHA-256",
    "RSA",
    "MD5",
    "SHA-1",
    "ECDSA",
    "bcrypt",
    "other",
    "SLH-DSA-SHA2-128f",
  ],
  [SBOM.ansible]: [
    "SHA-256",
    "ECDH",
    "ECDSA-P256",
    "ML-KEM-768",
    "ML-DSA-65",
    "ML-KEM-1024",
    "ML-DSA-87",
  ],
  [SBOM.quarkusAibom]: [
    "ML-KEM-768",
    "ML-DSA-65",
    "ML-KEM-512",
    "ML-DSA-44",
    "ML-DSA-87",
  ],
  [SBOM.acs]: [
    "SHA-256",
    "RSA",
    "MD5",
    "SHA-1",
    "ECDH",
    "ECDSA",
    "CSPRNG",
  ],
  [SBOM.rhsso]: [
    "SHA-256",
    "RSA",
    "MD5",
    "SHA-1",
    "RSA-PKCS1",
    "CSPRNG",
  ],
  [SBOM.serverless]: [
    "SHA-256",
    "ML-KEM-768",
    "ML-DSA-65",
    "SLH-DSA-SHA2-128s",
    "ML-KEM-512",
    "ML-KEM-1024",
  ],
};

const algorithmToSbomIds = new Map<string, string[]>();

for (const [sbomId, algorithms] of Object.entries(
  SBOM_CRYPTO_ALGORITHM_ASSIGNMENTS,
)) {
  for (const algorithm of algorithms) {
    const existing = algorithmToSbomIds.get(algorithm) ?? [];
    if (!existing.includes(sbomId)) {
      existing.push(sbomId);
    }
    algorithmToSbomIds.set(algorithm, existing);
  }
}

export const getSbomLinksForAlgorithm = (
  algorithmName: string,
): CryptographicAssetSbomLink[] => {
  const sbomIds = algorithmToSbomIds.get(algorithmName) ?? [];
  return getCryptoInventorySbomLinks(sbomIds);
};

export const getSbomIdsForAlgorithms = (algorithmNames: string[]): Set<string> => {
  const ids = new Set<string>();
  for (const algorithmName of algorithmNames) {
    for (const sbomId of algorithmToSbomIds.get(algorithmName) ?? []) {
      ids.add(sbomId);
    }
  }
  return ids;
};

export const isAlgorithmOnInventorySbom = (
  algorithmName: string,
  sbomId: string,
): boolean => SBOM_CRYPTO_ALGORITHM_ASSIGNMENTS[sbomId]?.includes(algorithmName) ?? false;

export const MOCK_CRYPTO_INVENTORY_SBOM_COUNT =
  MOCK_CRYPTO_INVENTORY_SBOM_LINKS.length;
