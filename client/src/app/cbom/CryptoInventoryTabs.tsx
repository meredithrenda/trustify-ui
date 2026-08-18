import React from "react";

import {
  Content,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";

import { CryptoAssetsTable } from "./CryptoAssetsTable";
import { CryptoRelatedMaterialTable } from "./CryptoRelatedMaterialTable";
import type { CryptoRecommendationGuidanceSource } from "./cryptoAlgorithmRecommendations";
import type { CryptographicAsset } from "./types";

const ALGORITHMS_TAB = 0;
const RELATED_MATERIAL_TAB = 1;

interface CryptoInventoryTabsProps {
  algorithmAssets: CryptographicAsset[];
  relatedMaterialAssets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  algorithmTabCount?: number;
  relatedMaterialTabCount?: number;
  showPackagesColumn?: boolean;
  showSbomColumn?: boolean;
  showRecommendationColumn?: boolean;
  recommendationGuidanceSource?: CryptoRecommendationGuidanceSource;
  renderSbomCell?: (asset: CryptographicAsset) => React.ReactNode;
  renderPackagesCell?: (asset: CryptographicAsset) => React.ReactNode;
  algorithmsToolbar?: React.ReactNode;
  algorithmsDescription?: React.ReactNode;
  relatedMaterialDescription?: React.ReactNode;
}

export const CryptoInventoryTabs: React.FC<CryptoInventoryTabsProps> = ({
  algorithmAssets,
  relatedMaterialAssets,
  onSelectAsset,
  algorithmTabCount,
  relatedMaterialTabCount,
  showPackagesColumn,
  showSbomColumn,
  showRecommendationColumn,
  recommendationGuidanceSource,
  renderSbomCell,
  renderPackagesCell,
  algorithmsToolbar,
  algorithmsDescription,
  relatedMaterialDescription,
}) => {
  const [activeTab, setActiveTab] = React.useState(ALGORITHMS_TAB);
  const algorithmsCount = algorithmTabCount ?? algorithmAssets.length;
  const relatedMaterialCount =
    relatedMaterialTabCount ?? relatedMaterialAssets.length;

  return (
    <Stack hasGutter>
      <StackItem>
        <Tabs
          activeKey={activeTab}
          onSelect={(_event, tabIndex) => setActiveTab(tabIndex as number)}
        >
          <Tab
            eventKey={ALGORITHMS_TAB}
            title={
              <TabTitleText>
                Algorithms ({algorithmsCount})
              </TabTitleText>
            }
          />
          <Tab
            eventKey={RELATED_MATERIAL_TAB}
            title={
              <TabTitleText>
                Keys ({relatedMaterialCount})
              </TabTitleText>
            }
          />
        </Tabs>
      </StackItem>
      <StackItem>
        {activeTab === ALGORITHMS_TAB && (
          <TabContent eventKey={ALGORITHMS_TAB}>
            <Stack hasGutter>
              {algorithmsToolbar ? (
                <StackItem>{algorithmsToolbar}</StackItem>
              ) : null}
              {algorithmsDescription ? (
                <StackItem>{algorithmsDescription}</StackItem>
              ) : null}
              <StackItem>
                <CryptoAssetsTable
                  assets={algorithmAssets}
                  onSelectAsset={onSelectAsset}
                  showPackagesColumn={showPackagesColumn}
                  showSbomColumn={showSbomColumn}
                  showRecommendationColumn={showRecommendationColumn}
                  recommendationGuidanceSource={recommendationGuidanceSource}
                  renderSbomCell={renderSbomCell}
                  renderPackagesCell={renderPackagesCell}
                />
              </StackItem>
            </Stack>
          </TabContent>
        )}
        {activeTab === RELATED_MATERIAL_TAB && (
          <TabContent eventKey={RELATED_MATERIAL_TAB}>
            <Stack hasGutter>
              {relatedMaterialDescription ? (
                <StackItem>{relatedMaterialDescription}</StackItem>
              ) : null}
              <StackItem>
                {relatedMaterialAssets.length > 0 ? (
                  <CryptoRelatedMaterialTable
                    assets={relatedMaterialAssets}
                    onSelectAsset={onSelectAsset}
                    showSbomColumn={showSbomColumn}
                    renderSbomCell={renderSbomCell}
                  />
                ) : (
                  <Content component="p">
                    No keys detected.
                  </Content>
                )}
              </StackItem>
            </Stack>
          </TabContent>
        )}
      </StackItem>
    </Stack>
  );
};
