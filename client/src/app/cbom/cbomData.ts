import openshiftInstallerCbom from "./fixtures/openshift-installer.json";
import rsaSignerCbom from "./fixtures/rsa-signer-c.json";
import { parseCycloneDxCbom } from "./parseCycloneDxCbom";
import type { CryptographicAsset, CryptographicAssetSbomLink } from "./types";

/** SBOM that carries the openshift-installer CBOM (OpenShift product line). */
export const CBOM_SBOM_OPENSHIFT_INSTALLER_ID =
  "a1b2c3d4-0002-4000-8000-000000000002";

/** SBOM that carries the rsa-signer-c CBOM (OpenSSL/C sample). */
export const CBOM_SBOM_RSA_SIGNER_ID = "a1b2c3d4-0004-4000-8000-000000000004";

export const SBOM_IDS_WITH_CBOM = new Set<string>([
  CBOM_SBOM_OPENSHIFT_INSTALLER_ID,
  CBOM_SBOM_RSA_SIGNER_ID,
]);

const OPENSHIFT_SBOM_LINK: CryptographicAssetSbomLink = {
  id: CBOM_SBOM_OPENSHIFT_INSTALLER_ID,
  name: "openshift-installer",
};

const RSA_SIGNER_SBOM_LINK: CryptographicAssetSbomLink = {
  id: CBOM_SBOM_RSA_SIGNER_ID,
  name: "rsa-signer-c",
};

function withSbomLink(
  assets: CryptographicAsset[],
  sbom: CryptographicAssetSbomLink,
): CryptographicAsset[] {
  return assets.map((asset) => ({
    ...asset,
    sboms: [sbom],
  }));
}

const openshiftParsed = parseCycloneDxCbom(openshiftInstallerCbom);
const rsaSignerParsed = parseCycloneDxCbom(rsaSignerCbom);

export const CBOM_FIXTURE_SCANNER_LABEL = openshiftParsed.scanner
  ? `${[openshiftParsed.scanner.group, openshiftParsed.scanner.name].filter(Boolean).join(" ")} ${openshiftParsed.scanner.version ?? ""}`.trim()
  : "SCANOSS crypto-finder";

export const CBOM_SPEC_LABEL = `CycloneDX ${openshiftParsed.specVersion ?? "1.6"}`;

const openshiftAssets = withSbomLink(
  openshiftParsed.assets,
  OPENSHIFT_SBOM_LINK,
);
const rsaSignerAssets = withSbomLink(
  rsaSignerParsed.assets,
  RSA_SIGNER_SBOM_LINK,
);

/** Fixture-backed workspace inventory (both sample CBOMs). */
export const FIXTURE_CRYPTOGRAPHIC_ASSETS: CryptographicAsset[] = [
  ...openshiftAssets,
  ...rsaSignerAssets,
];

export function getCryptographicAssetsForSbom(
  sbomId: string,
): CryptographicAsset[] {
  if (sbomId === CBOM_SBOM_OPENSHIFT_INSTALLER_ID) {
    return openshiftAssets;
  }
  if (sbomId === CBOM_SBOM_RSA_SIGNER_ID) {
    return rsaSignerAssets;
  }
  return [];
}

export function shouldShowCryptographyTab(sbomId: string | undefined): boolean {
  return !!sbomId && SBOM_IDS_WITH_CBOM.has(sbomId);
}

export function mergeInventoryAssets(
  fixtureAssets: CryptographicAsset[],
  uploaded: CryptographicAsset[],
): CryptographicAsset[] {
  return [...uploaded, ...fixtureAssets];
}
