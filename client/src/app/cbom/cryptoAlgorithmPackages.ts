import { mockPackages } from "@app/mocks/packages";
import { decomposePurl } from "@app/utils/utils";

import type { CryptographicAssetPackageLink } from "./types";

const packageLinkByUuid = new Map<string, CryptographicAssetPackageLink>(
  mockPackages.map((pkg) => {
    const decomposed = decomposePurl(pkg.purl);
    const name = decomposed?.name ?? pkg.purl;
    return [
      pkg.uuid,
      {
        id: pkg.uuid,
        purl: pkg.purl,
        name,
      },
    ];
  }),
);

const OPENSSL = "pkg-001";
const KERNEL = "pkg-002";
const ANGULAR = "pkg-003";
const LOG4J = "pkg-004";
const SQLITE = "pkg-005";
const REACT = "pkg-006";
const JACKSON = "pkg-007";
const HTTPD = "pkg-008";
const UBI = "pkg-009";
const PYTHON = "pkg-010";

/**
 * Prototype mapping from algorithm name to packages that use it.
 * Real linkage will come from backend CBOM ↔ package graph research.
 */
const ALGORITHM_PACKAGE_UUIDS: Record<string, string[]> = {
  CSPRNG: [OPENSSL, KERNEL, PYTHON],
  ECDH: [OPENSSL, HTTPD],
  ECDSA: [OPENSSL, HTTPD],
  "ECDSA-P256": [OPENSSL],
  MD5: [OPENSSL, LOG4J, JACKSON],
  OTR: [OPENSSL],
  RSA: [OPENSSL, HTTPD, JACKSON],
  "RSA-PKCS1": [OPENSSL],
  "SHA-1": [OPENSSL, LOG4J, JACKSON, ANGULAR],
  "SHA-256": [OPENSSL, LOG4J, JACKSON, ANGULAR, REACT],
  "SHA-512": [OPENSSL],
  bcrypt: [OPENSSL, PYTHON],
  other: [OPENSSL],
  "ML-KEM-768": [OPENSSL, UBI],
  "ML-KEM-512": [OPENSSL],
  "ML-KEM-1024": [OPENSSL, UBI],
  "ML-DSA-65": [OPENSSL, UBI],
  "ML-DSA-44": [OPENSSL],
  "ML-DSA-87": [OPENSSL, UBI],
  "SLH-DSA-SHA2-128s": [OPENSSL, UBI],
  "SLH-DSA-SHA2-256f": [OPENSSL],
  "SLH-DSA-SHA2-128f": [OPENSSL],
};

export const getPackageLinksForAlgorithm = (
  algorithmName: string,
): CryptographicAssetPackageLink[] => {
  const uuids = ALGORITHM_PACKAGE_UUIDS[algorithmName] ?? [];
  return uuids
    .map((uuid) => packageLinkByUuid.get(uuid))
    .filter((link): link is CryptographicAssetPackageLink => link != null);
};

export const getPackageUuidsForAlgorithms = (algorithmNames: string[]): Set<string> => {
  const uuids = new Set<string>();
  for (const algorithmName of algorithmNames) {
    for (const uuid of ALGORITHM_PACKAGE_UUIDS[algorithmName] ?? []) {
      uuids.add(uuid);
    }
  }
  return uuids;
};

export const getPrototypeAlgorithmFilterOptions = (): Array<{
  value: string;
  label: string;
}> =>
  Object.keys(ALGORITHM_PACKAGE_UUIDS)
    .sort((left, right) => left.localeCompare(right))
    .map((algorithm) => ({
      value: algorithm,
      label: algorithm,
    }));
