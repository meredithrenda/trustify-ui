import type { LabelProps } from "@patternfly/react-core";

import type { CryptographicAsset, CryptoUsageType } from "./types";

/** CycloneDX `cryptoProperties.assetType` values seen in CBOMs (1.6). */
export const KNOWN_CRYPTO_ASSET_TYPES = [
  "algorithm",
  "related-crypto-material",
] as const;

export type KnownCryptoAssetType = (typeof KNOWN_CRYPTO_ASSET_TYPES)[number];

export const isKnownCryptoAssetType = (
  assetType: string,
): assetType is KnownCryptoAssetType =>
  (KNOWN_CRYPTO_ASSET_TYPES as readonly string[]).includes(assetType);

export const getUsageTypeColor = (
  usageType: CryptoUsageType,
): NonNullable<LabelProps["color"]> => {
  return usageType === "Usage in source" ? "blue" : "grey";
};

export const getAssetTypeLabel = (assetType: string): string => {
  switch (assetType) {
    case "algorithm":
      return "Algorithm";
    case "related-crypto-material":
      return "Related material";
    default:
      return assetType;
  }
};

/** Distinct label colors per CycloneDX crypto asset type. */
export const getAssetTypeColor = (
  assetType: string,
): NonNullable<LabelProps["color"]> => {
  switch (assetType) {
    case "algorithm":
      return "blue";
    case "related-crypto-material":
      return "purple";
    default:
      return "grey";
  }
};

export const getMaterialTypeColor = (
  materialType: string,
): NonNullable<LabelProps["color"]> => {
  switch (materialType) {
    case "private-key":
      return "orange";
    case "public-key":
      return "teal";
    default:
      return "cyan";
  }
};

export const formatPrimitiveCell = (
  asset: CryptographicAsset,
): { label: string; color: NonNullable<LabelProps["color"]> } | null => {
  if (asset.assetType === "related-crypto-material" && asset.materialType) {
    return {
      label: asset.materialType,
      color: getMaterialTypeColor(asset.materialType),
    };
  }
  if (asset.primitive) {
    return { label: asset.primitive, color: "blue" };
  }
  return null;
};
