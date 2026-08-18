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
import type { CryptographicAsset } from "./types";

interface CryptographyInventoryTabsProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  showSbomColumn?: boolean;
}

export const CryptographyInventoryTabs: React.FC<
  CryptographyInventoryTabsProps
> = ({ assets, onSelectAsset, showSbomColumn = false }) => {
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

  const filterCategories = React.useMemo(
    () => buildCryptoAlgorithmFilterCategories(algorithmAssets),
    [algorithmAssets],
  );

  const filteredAlgorithmAssets = React.useMemo(
    () => filterCryptoAlgorithmAssets(algorithmAssets, filterValues),
    [algorithmAssets, filterValues],
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <CryptographicAlgorithmPolicies
          assets={assets}
          includeSbomsMeetingPolicy={showSbomColumn}
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
