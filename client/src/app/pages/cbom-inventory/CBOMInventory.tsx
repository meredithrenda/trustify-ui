import React from "react";

import { PageSection, Stack, StackItem, Title } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import {
  CryptoDetailContent,
  CryptographyInventoryTabs,
  FIXTURE_CRYPTOGRAPHIC_ASSETS,
  type CryptographicAsset,
} from "@app/cbom";

export const CBOMInventory: React.FC = () => {
  const [selectedAsset, setSelectedAsset] =
    React.useState<CryptographicAsset | null>(null);

  return (
    <>
      <PageDrawerContent
        isExpanded={!!selectedAsset}
        onCloseClick={() => setSelectedAsset(null)}
        pageKey="cbom-inventory"
        header={
          selectedAsset ? (
            <Title headingLevel="h2" size="lg">
              {selectedAsset.name}
            </Title>
          ) : undefined
        }
      >
        {selectedAsset ? (
          <CryptoDetailContent
            key={selectedAsset.id}
            asset={selectedAsset}
            viewContext="inventory"
          />
        ) : null}
      </PageDrawerContent>

      <DocumentMetadata title="Cryptography" />
      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          Cryptography
        </Title>
      </PageSection>
      <PageSection variant="light" style={{ paddingTop: 0 }}>
        <Stack hasGutter>
          <StackItem>
            <CryptographyInventoryTabs
              assets={FIXTURE_CRYPTOGRAPHIC_ASSETS}
              onSelectAsset={setSelectedAsset}
              showSbomColumn
            />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};
