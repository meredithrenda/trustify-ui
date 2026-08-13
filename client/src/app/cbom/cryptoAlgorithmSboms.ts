import { FIXTURE_CRYPTOGRAPHIC_ASSETS } from "./cbomData";
import { getAlgorithmCryptoAssets } from "./cryptoAssetGroups";

const algorithmAssetsByName = new Map(
  getAlgorithmCryptoAssets(FIXTURE_CRYPTOGRAPHIC_ASSETS).map((asset) => [
    asset.name,
    asset,
  ]),
);

/** Prototype: SBOM ids that contain the given algorithms in fixture CBOM data. */
export const getSbomIdsForAlgorithms = (algorithmNames: string[]): Set<string> => {
  const ids = new Set<string>();

  for (const algorithmName of algorithmNames) {
    const asset = algorithmAssetsByName.get(algorithmName);
    for (const sbom of asset?.sboms ?? []) {
      ids.add(sbom.id);
    }
  }

  return ids;
};
