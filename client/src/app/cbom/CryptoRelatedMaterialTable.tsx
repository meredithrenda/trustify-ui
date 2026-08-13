import React from "react";

import { Button, Content } from "@patternfly/react-core";
import type { ISortBy, OnSort } from "@patternfly/react-table";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { sortCryptoAssets } from "./cryptoAssetsTableSort";
import type { CryptographicAsset } from "./types";

interface CryptoRelatedMaterialTableProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  renderSbomCell?: (asset: CryptographicAsset) => React.ReactNode;
  showSbomColumn?: boolean;
}

const KEY_COLUMNS = [
  { key: "name", title: "Name", modifier: "truncate" as const },
  { key: "materialType", title: "Type", modifier: "truncate" as const },
  { key: "occurrences", title: "Occurrences", modifier: "nowrap" as const },
  { key: "usage", title: "Usage", modifier: "truncate" as const },
  { key: "sboms", title: "SBOMs", modifier: "truncate" as const },
];

const emptyCell = (
  <Content
    component="span"
    style={{ color: "var(--pf-t--global--text--color--subtle)" }}
  >
    —
  </Content>
);

/** Key material (`related-crypto-material` in CycloneDX CBOMs). */
export const CryptoRelatedMaterialTable: React.FC<
  CryptoRelatedMaterialTableProps
> = ({
  assets,
  onSelectAsset,
  renderSbomCell,
  showSbomColumn = false,
}) => {
  const columns = showSbomColumn
    ? KEY_COLUMNS
    : KEY_COLUMNS.filter((column) => column.key !== "sboms");

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
    <Table aria-label="Keys table">
      <Thead>
        <Tr>
          {columns.map((column, columnIndex) => (
            <Th
              key={column.key}
              modifier={column.modifier}
              sort={thSort(columnIndex)}
            >
              {column.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {sortedAssets.map((asset) => {
          const materialLabel = asset.materialType ?? asset.name;

          return (
            <Tr key={asset.id} isHoverable>
              <Td dataLabel="Name" modifier="truncate">
                <Button
                  variant="link"
                  isInline
                  onClick={() => onSelectAsset(asset)}
                >
                  {asset.name}
                </Button>
              </Td>
              <Td dataLabel="Type" modifier="truncate">
                <Content component="span">{materialLabel}</Content>
              </Td>
              <Td dataLabel="Occurrences" modifier="nowrap">
                {asset.occurrenceCount}
              </Td>
              <Td dataLabel="Usage" modifier="truncate">
                {asset.usageType}
              </Td>
              {showSbomColumn ? (
                <Td dataLabel="SBOMs" modifier="truncate">
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
