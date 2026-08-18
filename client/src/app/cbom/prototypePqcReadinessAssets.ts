import { getPackageLinksForAlgorithm } from "./cryptoAlgorithmPackages";
import type { CryptographicAsset } from "./types";

/** Illustrative PQC algorithm rows for Cryptography inventory mockups. */
export function createPrototypePqcReadinessAssets(): CryptographicAsset[] {
  const base = {
    assetType: "algorithm",
    usageType: "Declared capability" as const,
    discoverySource: "prototype-pqc-readiness",
    scannerName: "crypto-finder",
    occurrenceCount: 1,
  };

  const algorithmRow = (
    id: string,
    name: string,
    primitive: string,
    description: string,
  ): CryptographicAsset => ({
    ...base,
    id,
    name,
    algorithm: name,
    primitive,
    description,
    packages: getPackageLinksForAlgorithm(name),
  });

  return [
    algorithmRow(
      "prototype-pqc-ml-kem-768",
      "ML-KEM-768",
      "pke",
      "NIST ML-KEM (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-dsa-65",
      "ML-DSA-65",
      "signature",
      "NIST ML-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-slh-dsa-128s",
      "SLH-DSA-SHA2-128s",
      "signature",
      "NIST SLH-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-kem-512",
      "ML-KEM-512",
      "pke",
      "NIST ML-KEM (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-dsa-44",
      "ML-DSA-44",
      "signature",
      "NIST ML-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-kem-1024",
      "ML-KEM-1024",
      "pke",
      "NIST ML-KEM (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-dsa-87",
      "ML-DSA-87",
      "signature",
      "NIST ML-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-slh-dsa-256f",
      "SLH-DSA-SHA2-256f",
      "signature",
      "NIST SLH-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-slh-dsa-128f",
      "SLH-DSA-SHA2-128f",
      "signature",
      "NIST SLH-DSA (prototype inventory sample)",
    ),
  ];
}
