import { getPackageLinksForAlgorithm } from "./cryptoAlgorithmPackages";
import type { CryptographicAsset, CryptographicAssetSbomLink } from "./types";

/** Illustrative PQC algorithm rows for Cryptography inventory mockups. */
export function createPrototypePqcReadinessAssets(
  openshiftSbom: CryptographicAssetSbomLink,
  rsaSignerSbom: CryptographicAssetSbomLink,
): CryptographicAsset[] {
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
    sboms: CryptographicAssetSbomLink[],
    description: string,
  ): CryptographicAsset => ({
    ...base,
    id,
    name,
    algorithm: name,
    primitive,
    description,
    sboms,
    packages: getPackageLinksForAlgorithm(name),
  });

  return [
    algorithmRow(
      "prototype-pqc-ml-kem-openshift",
      "ML-KEM-768",
      "pke",
      [openshiftSbom],
      "NIST ML-KEM (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-dsa-openshift",
      "ML-DSA-65",
      "signature",
      [openshiftSbom],
      "NIST ML-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-slh-dsa-openshift",
      "SLH-DSA-SHA2-128s",
      "signature",
      [openshiftSbom],
      "NIST SLH-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-kem-rsa",
      "ML-KEM-512",
      "pke",
      [rsaSignerSbom],
      "NIST ML-KEM (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-dsa-rsa",
      "ML-DSA-44",
      "signature",
      [rsaSignerSbom],
      "NIST ML-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-kem-1024-openshift",
      "ML-KEM-1024",
      "pke",
      [openshiftSbom],
      "NIST ML-KEM (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-ml-dsa-87-openshift",
      "ML-DSA-87",
      "signature",
      [openshiftSbom],
      "NIST ML-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-slh-dsa-256f-openshift",
      "SLH-DSA-SHA2-256f",
      "signature",
      [openshiftSbom],
      "NIST SLH-DSA (prototype inventory sample)",
    ),
    algorithmRow(
      "prototype-pqc-slh-dsa-128f-rsa",
      "SLH-DSA-SHA2-128f",
      "signature",
      [rsaSignerSbom],
      "NIST SLH-DSA (prototype inventory sample)",
    ),
  ];
}
