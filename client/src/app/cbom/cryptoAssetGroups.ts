import type { CryptographicAsset } from "./types";

export const isAlgorithmCryptoAsset = (asset: CryptographicAsset): boolean =>
  asset.assetType === "algorithm";

export const isRelatedCryptoMaterialAsset = (
  asset: CryptographicAsset,
): boolean => asset.assetType === "related-crypto-material";

export const getAlgorithmCryptoAssets = (
  assets: CryptographicAsset[],
): CryptographicAsset[] => assets.filter(isAlgorithmCryptoAsset);

export const getRelatedCryptoMaterialAssets = (
  assets: CryptographicAsset[],
): CryptographicAsset[] => assets.filter(isRelatedCryptoMaterialAsset);
