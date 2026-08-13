import openshiftInstallerCbom from "./fixtures/openshift-installer.json";
import rsaSignerCbom from "./fixtures/rsa-signer-c.json";
import { getPackageLinksForAlgorithm } from "./cryptoAlgorithmPackages";
import { parseCycloneDxCbom } from "./parseCycloneDxCbom";
import { createPrototypePqcReadinessAssets } from "./prototypePqcReadinessAssets";
import type {
  CryptographicAsset,
  CryptographicAssetPackageLink,
  CryptographicAssetSbomLink,
} from "./types";

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
    packages: getPackageLinksForAlgorithm(asset.name),
  }));
}

function mergePackageLinks(
  existing: CryptographicAssetPackageLink[],
  incoming: CryptographicAssetPackageLink[],
): CryptographicAssetPackageLink[] {
  const merged = [...existing];
  for (const pkg of incoming) {
    if (!merged.some((link) => link.id === pkg.id)) {
      merged.push(pkg);
    }
  }
  return merged;
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

const prototypePqcReadinessAssets = createPrototypePqcReadinessAssets(
  OPENSHIFT_SBOM_LINK,
  RSA_SIGNER_SBOM_LINK,
);

const openshiftInventoryAssets = [
  ...openshiftAssets,
  ...prototypePqcReadinessAssets.filter((asset) =>
    asset.sboms?.some((sbom) => sbom.id === CBOM_SBOM_OPENSHIFT_INSTALLER_ID),
  ),
];

const rsaSignerInventoryAssets = [
  ...rsaSignerAssets,
  ...prototypePqcReadinessAssets.filter((asset) =>
    asset.sboms?.some((sbom) => sbom.id === CBOM_SBOM_RSA_SIGNER_ID),
  ),
];

function mergeAlgorithmInventoryRows(
  assets: CryptographicAsset[],
): CryptographicAsset[] {
  const nonAlgorithms = assets.filter(
    (asset) => asset.assetType !== "algorithm",
  );
  const merged = new Map<string, CryptographicAsset>();

  for (const asset of assets) {
    if (asset.assetType !== "algorithm") {
      continue;
    }
    const existing = merged.get(asset.name);
    if (!existing) {
      merged.set(asset.name, {
        ...asset,
        sboms: [...(asset.sboms ?? [])],
        packages: [...(asset.packages ?? [])],
      });
      continue;
    }
    const sboms = [...(existing.sboms ?? [])];
    for (const sbom of asset.sboms ?? []) {
      if (!sboms.some((link) => link.id === sbom.id)) {
        sboms.push(sbom);
      }
    }
    existing.sboms = sboms;
    existing.packages = mergePackageLinks(
      existing.packages ?? [],
      asset.packages ?? [],
    );
    existing.occurrenceCount =
      (existing.occurrenceCount ?? 0) + (asset.occurrenceCount ?? 0);
  }

  return [...merged.values(), ...nonAlgorithms];
}

/** Fixture-backed workspace inventory (both sample CBOMs). */
export const FIXTURE_CRYPTOGRAPHIC_ASSETS: CryptographicAsset[] =
  mergeAlgorithmInventoryRows([
    ...openshiftInventoryAssets,
    ...rsaSignerInventoryAssets,
  ]);

export function getCryptographicAssetsForSbom(
  sbomId: string,
): CryptographicAsset[] {
  if (sbomId === CBOM_SBOM_OPENSHIFT_INSTALLER_ID) {
    return openshiftInventoryAssets;
  }
  if (sbomId === CBOM_SBOM_RSA_SIGNER_ID) {
    return rsaSignerInventoryAssets;
  }
  return [];
}

export function shouldShowCryptographyTab(sbomId: string | undefined): boolean {
  return !!sbomId && SBOM_IDS_WITH_CBOM.has(sbomId);
}
