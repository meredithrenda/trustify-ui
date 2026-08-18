import { mockSboms } from "@app/mocks/sboms";

import type { CryptographicAssetSbomLink } from "./types";

/** First ten workspace SBOMs used for Cryptography inventory drill-down mockups. */
export const MOCK_CRYPTO_INVENTORY_SBOM_LINKS: CryptographicAssetSbomLink[] =
  mockSboms.slice(0, 10).map((sbom) => ({
    id: sbom.id,
    name: sbom.name,
  }));

const sbomLinkById = new Map(
  MOCK_CRYPTO_INVENTORY_SBOM_LINKS.map((link) => [link.id, link]),
);

export const getCryptoInventorySbomLink = (
  sbomId: string,
): CryptographicAssetSbomLink | undefined => sbomLinkById.get(sbomId);

export const getCryptoInventorySbomLinks = (
  sbomIds: string[],
): CryptographicAssetSbomLink[] =>
  sbomIds
    .map((id) => sbomLinkById.get(id))
    .filter((link): link is CryptographicAssetSbomLink => link != null);
