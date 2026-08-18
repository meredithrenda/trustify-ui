import React from "react";

import {
  Button,
  Content,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import type { ISortBy, OnSort, ThProps } from "@patternfly/react-table";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import {
  DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE,
  getCryptoRecommendationHeaderHelp,
} from "./cryptoAlgorithmRecommendations";
import { formatPrimitiveCell } from "./display";
import { sortCryptoAssets } from "./cryptoAssetsTableSort";
import { CryptoAssetPolicyTableCell } from "./CryptoAssetPolicyChips";
import { CryptoRecommendationTableCell } from "./CryptoRecommendationTableCell";
import type { CryptoRecommendationGuidanceSource } from "./cryptoAlgorithmRecommendations";
import type { CryptographicAsset } from "./types";

interface CryptoAssetsTableProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  showPackagesColumn?: boolean;
  showSbomColumn?: boolean;
  showPolicyColumn?: boolean;
  showRecommendationColumn?: boolean;
  recommendationGuidanceSource?: CryptoRecommendationGuidanceSource;
  renderSbomCell?: (asset: CryptographicAsset) => React.ReactNode;
  renderPackagesCell?: (asset: CryptographicAsset) => React.ReactNode;
}

type TableColumnModifier = "truncate" | "fitContent" | "nowrap";

interface TableColumnConfig {
  key: string;
  title: string;
  headerInfo?: ThProps["info"];
  width: number;
  modifier?: TableColumnModifier;
}

const getRecommendationHeaderInfo = (
  guidanceSource: CryptoRecommendationGuidanceSource,
): ThProps["info"] => ({
  popover: getCryptoRecommendationHeaderHelp(guidanceSource),
  ariaLabel: "Recommendation guidance help",
  popoverProps: {
    headerContent: "Recommendation",
  },
});

const getColumns = (
  showPackagesColumn: boolean,
  showSbomColumn: boolean,
  showPolicyColumn: boolean,
  showRecommendationColumn: boolean,
  recommendationGuidanceSource?: CryptoRecommendationGuidanceSource,
): TableColumnConfig[] => {
  const useInventoryLayout = showPackagesColumn || showSbomColumn;

  if (useInventoryLayout) {
    const columns: TableColumnConfig[] = [
      { key: "name", title: "Algorithm name", width: 26, modifier: "truncate" },
      { key: "primitive", title: "Primitive", width: 12, modifier: "truncate" },
      {
        key: "occurrences",
        title: "Occurrences",
        width: 5,
        modifier: "fitContent",
      },
      ...(showPolicyColumn
        ? [
            {
              key: "policy",
              title: "Policy",
              width: 12,
              modifier: "truncate" as const,
            },
          ]
        : []),
      ...(showRecommendationColumn
        ? [
            {
              key: "recommendation",
              title: "Recommendation",
              headerInfo: getRecommendationHeaderInfo(
                recommendationGuidanceSource ??
                  DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE,
              ),
              width: 5,
              modifier: "fitContent" as const,
            },
          ]
        : []),
      { key: "usage", title: "Usage", width: 15, modifier: "truncate" },
    ];

    if (showPackagesColumn) {
      columns.push({
        key: "packages",
        title: "Packages",
        width: 13,
        modifier: "truncate",
      });
    }

    if (showSbomColumn) {
      columns.push({
        key: "sboms",
        title: "SBOMs",
        width: 13,
        modifier: "truncate",
      });
    }

    return columns;
  }

  return [
    { key: "name", title: "Algorithm name", width: 28, modifier: "truncate" },
    { key: "primitive", title: "Primitive", width: 13, modifier: "truncate" },
    {
      key: "occurrences",
      title: "Occurrences",
      width: 5,
      modifier: "fitContent",
    },
    ...(showPolicyColumn
      ? [
          {
            key: "policy",
            title: "Policy",
            width: 12,
            modifier: "truncate" as const,
          },
        ]
      : []),
    ...(showRecommendationColumn
      ? [
          {
            key: "recommendation",
            title: "Recommendation",
            headerInfo: getRecommendationHeaderInfo(
              recommendationGuidanceSource ??
                DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE,
            ),
            width: 5,
            modifier: "fitContent" as const,
          },
        ]
      : []),
    { key: "usage", title: "Usage", width: 17, modifier: "truncate" },
  ];
};

const columnConfigByKey = (
  columns: TableColumnConfig[],
): Record<string, TableColumnConfig> =>
  Object.fromEntries(columns.map((column) => [column.key, column]));

const emptyCell = (
  <Content
    component="span"
    style={{ color: "var(--pf-t--global--text--color--subtle)" }}
  >
    --
  </Content>
);

const getTdProps = (
  columnKey: string,
  columnByKey: Record<string, TableColumnConfig>,
) => {
  const column = columnByKey[columnKey];

  return {
    dataLabel: column.title,
    modifier: column.modifier,
    width: column.width,
  };
};

export const CryptoAssetsTable: React.FC<CryptoAssetsTableProps> = ({
  assets,
  onSelectAsset,
  showPackagesColumn = false,
  showSbomColumn = false,
  showPolicyColumn = true,
  showRecommendationColumn = false,
  recommendationGuidanceSource,
  renderSbomCell,
  renderPackagesCell,
}) => {
  const columns = getColumns(
    showPackagesColumn,
    showSbomColumn,
    showPolicyColumn,
    showRecommendationColumn,
    recommendationGuidanceSource,
  );
  const columnByKey = columnConfigByKey(columns);
  const td = (columnKey: string) => getTdProps(columnKey, columnByKey);

  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 0,
    direction: "asc",
  });

  const onSort: OnSort = (_event, columnIndex, direction) => {
    setSortBy({ index: columnIndex, direction });
  };

  const thSort = (columnIndex: number) => ({
    columnIndex,
    onSort,
    sortBy: {
      index: sortBy.index,
      direction: sortBy.direction,
      defaultDirection: "asc" as const,
    },
  });

  const sortedAssets = React.useMemo(() => {
    const column = columns[sortBy.index];
    if (!column) {
      return assets;
    }
    return sortCryptoAssets(
      assets,
      column.key,
      sortBy.direction ?? "asc",
      recommendationGuidanceSource
        ? { recommendationGuidanceSource }
        : undefined,
    );
  }, [
    assets,
    columns,
    sortBy.index,
    sortBy.direction,
    recommendationGuidanceSource,
  ]);

  return (
    <Table aria-label="Cryptographic algorithms table">
      <Thead>
        <Tr>
          {columns.map((column, columnIndex) => (
            <Th
              key={column.key}
              modifier={column.modifier}
              sort={thSort(columnIndex)}
              width={column.width}
              info={column.headerInfo}
            >
              {column.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {sortedAssets.map((asset) => {
          const primitiveCell = formatPrimitiveCell(asset);

          return (
            <Tr key={asset.id} isHoverable>
              <Td {...td("name")}>
                <Stack>
                  <StackItem>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => onSelectAsset(asset)}
                    >
                      {asset.name}
                    </Button>
                  </StackItem>
                  {asset.parameterSetIdentifier ? (
                    <StackItem>
                      <Content
                        component="small"
                        style={{
                          color: "var(--pf-t--global--text--color--subtle)",
                        }}
                      >
                        Parameter set {asset.parameterSetIdentifier}
                      </Content>
                    </StackItem>
                  ) : null}
                </Stack>
              </Td>
              <Td {...td("primitive")}>
                {primitiveCell ? (
                  <Content component="span">{primitiveCell.label}</Content>
                ) : (
                  emptyCell
                )}
              </Td>
              <Td {...td("occurrences")}>{asset.occurrenceCount}</Td>
              {showPolicyColumn ? (
                <Td {...td("policy")}>
                  <CryptoAssetPolicyTableCell asset={asset} />
                </Td>
              ) : null}
              {showRecommendationColumn && recommendationGuidanceSource ? (
                <Td {...td("recommendation")}>
                  <CryptoRecommendationTableCell
                    asset={asset}
                    guidanceSource={recommendationGuidanceSource}
                  />
                </Td>
              ) : null}
              <Td {...td("usage")}>{asset.usageType}</Td>
              {showPackagesColumn ? (
                <Td {...td("packages")}>
                  {renderPackagesCell ? renderPackagesCell(asset) : emptyCell}
                </Td>
              ) : null}
              {showSbomColumn ? (
                <Td {...td("sboms")}>
                  {renderSbomCell ? renderSbomCell(asset) : emptyCell}
                </Td>
              ) : null}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
