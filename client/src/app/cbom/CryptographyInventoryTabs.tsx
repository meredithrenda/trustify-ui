import React from "react";

import {
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";

import { FilterToolbar, type IFilterValues } from "@app/components/FilterToolbar";

import { CryptographicAlgorithmPolicies } from "./CryptographicAlgorithmPolicies";
import { CryptoInventoryTabs } from "./CryptoInventoryTabs";
import { CryptoPolicyReassessmentBanner } from "./CryptoPolicyReassessmentBanner";
import {
  CRYPTOGRAPHY_PAGE_VIEWS,
  type CryptographyPageView,
} from "./cryptographyPageViews";
import {
  getAlgorithmCryptoAssets,
  getRelatedCryptoMaterialAssets,
} from "./cryptoAssetGroups";
import {
  buildCryptoAlgorithmFilterCategories,
  filterCryptoAlgorithmAssets,
  type CryptoAlgorithmFilterKey,
} from "./cryptoAlgorithmTableFilters";
import {
  renderCryptoPackagesCell,
  renderCryptoSbomsCell,
} from "./cryptoInventoryTableCells";
import { useCryptoRecommendationGuidanceSource } from "./useCryptoRecommendationGuidanceSource";
import { useCryptographyPolicyReassessment } from "./useCryptographyPolicyReassessment";
import type { CryptographicAsset } from "./types";

interface CryptographyInventoryTabsProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  showSbomColumn?: boolean;
  pageView?: CryptographyPageView;
}

export const CryptographyInventoryTabs: React.FC<
  CryptographyInventoryTabsProps
> = ({
  assets,
  onSelectAsset,
  showSbomColumn = false,
  pageView = CRYPTOGRAPHY_PAGE_VIEWS.default,
}) => {
  const guidanceSource = useCryptoRecommendationGuidanceSource();
  const [filterValues, setFilterValues] = React.useState<
    IFilterValues<CryptoAlgorithmFilterKey>
  >({});

  const algorithmAssets = React.useMemo(
    () => getAlgorithmCryptoAssets(assets),
    [assets],
  );
  const relatedMaterialAssets = React.useMemo(
    () => getRelatedCryptoMaterialAssets(assets),
    [assets],
  );

  const isUpdatedPolicyView = pageView === CRYPTOGRAPHY_PAGE_VIEWS.updatedPolicy;
  const algorithmIds = React.useMemo(
    () => algorithmAssets.map((asset) => asset.id),
    [algorithmAssets],
  );
  const reassessment = useCryptographyPolicyReassessment(
    isUpdatedPolicyView,
    algorithmIds,
  );

  const filterCategories = React.useMemo(
    () => buildCryptoAlgorithmFilterCategories(algorithmAssets),
    [algorithmAssets],
  );

  const filteredAlgorithmAssets = React.useMemo(
    () => filterCryptoAlgorithmAssets(algorithmAssets, filterValues),
    [algorithmAssets, filterValues],
  );

  const showReassessmentBanner = isUpdatedPolicyView;

  const isAssetPolicyAssessed = isUpdatedPolicyView
    ? reassessment.isAssetAssessed
    : undefined;

  return (
    <Stack hasGutter>
      {showReassessmentBanner ? (
        <StackItem>
          <CryptoPolicyReassessmentBanner
            phase={reassessment.phase}
            progress={reassessment.progress}
          />
        </StackItem>
      ) : null}
      <StackItem>
        <CryptographicAlgorithmPolicies
          assets={assets}
          includeSbomsMeetingPolicy={showSbomColumn}
          isRecalculating={reassessment.isReassessmentActive}
        />
      </StackItem>
      <StackItem>
        <CryptoInventoryTabs
          algorithmAssets={filteredAlgorithmAssets}
          algorithmTabCount={algorithmAssets.length}
          relatedMaterialAssets={relatedMaterialAssets}
          onSelectAsset={onSelectAsset}
          showPackagesColumn
          showSbomColumn={showSbomColumn}
          showRecommendationColumn
          recommendationGuidanceSource={guidanceSource}
          isAssetPolicyAssessed={isAssetPolicyAssessed}
          renderPackagesCell={renderCryptoPackagesCell}
          renderSbomCell={showSbomColumn ? renderCryptoSbomsCell : undefined}
          algorithmsToolbar={
            <Toolbar clearAllFilters={() => setFilterValues({})}>
              <ToolbarContent>
                <FilterToolbar<CryptographicAsset, CryptoAlgorithmFilterKey>
                  filterCategories={filterCategories}
                  filterValues={filterValues}
                  setFilterValues={setFilterValues}
                />
              </ToolbarContent>
            </Toolbar>
          }
        />
      </StackItem>
    </Stack>
  );
};
