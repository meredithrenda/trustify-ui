import type React from "react";

import { Stack, StackItem } from "@patternfly/react-core";

import {
  CryptographyInventoryTabs,
  type CryptographicAsset,
  getCryptographicAssetsForSbom,
} from "@app/cbom";

export type { CryptoEvidenceEntry, CryptographicAsset } from "@app/cbom";
export {
  CryptoDetailContent,
  getCryptographicAssetsForSbom,
  shouldShowCryptographyTab,
} from "@app/cbom";
export type { CryptoDetailViewContext } from "@app/cbom";

interface CryptographyProps {
  sbomId: string;
  onSelectAsset: (asset: CryptographicAsset | null) => void;
}

export const Cryptography: React.FC<CryptographyProps> = ({
  sbomId,
  onSelectAsset,
}) => {
  const assets = getCryptographicAssetsForSbom(sbomId);

  return (
    <Stack hasGutter>
      <StackItem>
        <CryptographyInventoryTabs
          assets={assets}
          onSelectAsset={(asset) => onSelectAsset(asset)}
        />
      </StackItem>
    </Stack>
  );
};
