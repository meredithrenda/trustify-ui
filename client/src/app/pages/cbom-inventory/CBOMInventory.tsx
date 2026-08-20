import React from "react";

import {
  Flex,
  FlexItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import {
  CryptoDetailContent,
  CryptographyInventoryTabs,
  CryptographyPageViewSwitcher,
  CRYPTOGRAPHY_PAGE_VIEWS,
  FIXTURE_CRYPTOGRAPHIC_ASSETS,
  type CryptographicAsset,
  type CryptographyPageView,
} from "@app/cbom";

export const CBOMInventory: React.FC = () => {
  const [selectedAsset, setSelectedAsset] =
    React.useState<CryptographicAsset | null>(null);
  const [pageView, setPageView] = React.useState<CryptographyPageView>(
    CRYPTOGRAPHY_PAGE_VIEWS.default,
  );

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
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          gap={{ default: "gapMd" }}
        >
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Cryptography
            </Title>
          </FlexItem>
          <FlexItem>
            <CryptographyPageViewSwitcher
              value={pageView}
              onChange={setPageView}
            />
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection variant="light" style={{ paddingTop: 0 }}>
        <Stack hasGutter>
          <StackItem>
            <CryptographyInventoryTabs
              assets={FIXTURE_CRYPTOGRAPHIC_ASSETS}
              onSelectAsset={setSelectedAsset}
              showSbomColumn
              pageView={pageView}
            />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};
