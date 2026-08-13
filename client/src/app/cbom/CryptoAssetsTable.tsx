import React from "react";

import {
  Button,
  Content,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import type { ISortBy, OnSort } from "@patternfly/react-table";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { formatPrimitiveCell } from "./display";
import { sortCryptoAssets } from "./cryptoAssetsTableSort";
import { CryptoAssetPolicyTableCell } from "./CryptoAssetPolicyChips";
import type { CryptographicAsset } from "./types";

interface CryptoAssetsTableProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  showPackagesColumn?: boolean;
  showSbomColumn?: boolean;
  showPolicyColumn?: boolean;
  renderSbomCell?: (asset: CryptographicAsset) => React.ReactNode;
  renderPackagesCell?: (asset: CryptographicAsset) => React.ReactNode;
}

type TableColumnModifier = "truncate" | "fitContent" | "nowrap";

interface TableColumnConfig {
  key: string;
  title: string;
  width: number;
  modifier?: TableColumnModifier;
}

const getColumns = (
  showPackagesColumn: boolean,
  showSbomColumn: boolean,
  showPolicyColumn: boolean,
): TableColumnConfig[] => {
  const useInventoryLayout = showPackagesColumn || showSbomColumn;

  if (useInventoryLayout) {
    const columns: TableColumnConfig[] = [
      { key: "name", title: "Algorithm name", width: 22, modifier: "truncate" },
      { key: "primitive", title: "Primitive", width: 12, modifier: "truncate" },
      {
        key: "occurrences",
        title: "Occurrences",
        width: 10,
        modifier: "nowrap",
      },
      ...(showPolicyColumn
        ? [
            {
              key: "policy",
              title: "Policy",
              width: 16,
              modifier: "truncate" as const,
            },
          ]
        : []),
      { key: "usage", title: "Usage", width: 12, modifier: "truncate" },
    ];

    if (showPackagesColumn) {
      columns.push({
        key: "packages",
        title: "Packages",
        width: 14,
        modifier: "truncate",
      });
    }

    if (showSbomColumn) {
      columns.push({
        key: "sboms",
        title: "SBOMs",
        width: 14,
        modifier: "truncate",
      });
    }

    return columns;
  }

  return [
    { key: "name", title: "Algorithm name", width: 26, modifier: "truncate" },
    { key: "primitive", title: "Primitive", width: 14, modifier: "truncate" },
    {
      key: "occurrences",
      title: "Occurrences",
      width: 12,
      modifier: "nowrap",
    },
    ...(showPolicyColumn
      ? [
          {
            key: "policy",
            title: "Policy",
            width: 18,
            modifier: "truncate" as const,
          },
        ]
      : []),
    { key: "usage", title: "Usage", width: 20, modifier: "truncate" },
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
    —
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
  renderSbomCell,
  renderPackagesCell,
}) => {
  const columns = getColumns(
    showPackagesColumn,
    showSbomColumn,
    showPolicyColumn,
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
    );
  }, [assets, columns, sortBy.index, sortBy.direction]);

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
