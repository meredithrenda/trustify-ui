import type React from "react";

import { Content, Stack, StackItem, Title } from "@patternfly/react-core";

import {
  CBOM_FIXTURE_SCANNER_LABEL,
  CBOM_SPEC_LABEL,
  CryptoAssetsTable,
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
        <Title headingLevel="h3" size="lg">
          Cryptographic assets
        </Title>
        <Content component="p">
          Assets from a CycloneDX cryptographic BOM attached to this SBOM.
          Discovered by {CBOM_FIXTURE_SCANNER_LABEL} ({CBOM_SPEC_LABEL}). Click
          a row to view evidence and detection rules.
        </Content>
      </StackItem>
      <StackItem>
        <CryptoAssetsTable
          assets={assets}
          onSelectAsset={(asset) => onSelectAsset(asset)}
        />
      </StackItem>
    </Stack>
  );
};
