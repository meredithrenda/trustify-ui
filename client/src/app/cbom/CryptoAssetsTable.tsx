import type React from "react";

import {
  Button,
  Content,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import {
  formatPrimitiveCell,
  getAssetTypeColor,
  getAssetTypeLabel,
} from "./display";
import type { CryptographicAsset } from "./types";

interface CryptoAssetsTableProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  showSbomColumn?: boolean;
  renderSbomCell?: (asset: CryptographicAsset) => React.ReactNode;
}

type TableColumnModifier = "truncate" | "fitContent" | "nowrap";

interface TableColumnConfig {
  key: string;
  title: string;
  width: number;
  modifier?: TableColumnModifier;
}

const getColumns = (showSbomColumn: boolean): TableColumnConfig[] => {
  if (showSbomColumn) {
    return [
      { key: "name", title: "Name", width: 22, modifier: "truncate" },
      {
        key: "assetType",
        title: "Asset type",
        width: 10,
        modifier: "fitContent",
      },
      { key: "primitive", title: "Primitive", width: 12, modifier: "truncate" },
      { key: "occurrences", title: "Occurrences", width: 10, modifier: "fitContent" },
      { key: "usage", title: "Usage", width: 12, modifier: "nowrap" },
      { key: "sboms", title: "SBOMs", width: 14, modifier: "truncate" },
    ];
  }

  return [
    { key: "name", title: "Name", width: 28, modifier: "truncate" },
    {
      key: "assetType",
      title: "Asset type",
      width: 8,
      modifier: "fitContent",
    },
    { key: "primitive", title: "Primitive", width: 16, modifier: "truncate" },
    { key: "occurrences", title: "Occurrences", width: 8, modifier: "fitContent" },
    { key: "usage", title: "Usage", width: 18, modifier: "nowrap" },
  ];
};

const emptyCell = (
  <Content
    component="span"
    style={{ color: "var(--pf-t--global--text--color--subtle)" }}
  >
    —
  </Content>
);

const columnWidthByKey = (
  columns: TableColumnConfig[],
): Record<string, number> =>
  Object.fromEntries(columns.map((column) => [column.key, column.width]));

export const CryptoAssetsTable: React.FC<CryptoAssetsTableProps> = ({
  assets,
  onSelectAsset,
  showSbomColumn = false,
  renderSbomCell,
}) => {
  const columns = getColumns(showSbomColumn);
  const widthByKey = columnWidthByKey(columns);

  return (
    <Table aria-label="Cryptographic assets table" variant="compact">
      <Thead>
        <Tr>
          {columns.map((column) => (
            <Th
              key={column.key}
              modifier={column.modifier}
              width={column.width}
            >
              {column.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {assets.map((asset) => {
          const primitiveCell = formatPrimitiveCell(asset);

          return (
            <Tr key={asset.id} isHoverable>
              <Td
                dataLabel="Name"
                modifier="truncate"
                width={widthByKey.name}
              >
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
              <Td
                dataLabel="Asset type"
                modifier="fitContent"
                width={widthByKey.assetType}
              >
                <Label color={getAssetTypeColor(asset.assetType)} isCompact>
                  {getAssetTypeLabel(asset.assetType)}
                </Label>
              </Td>
              <Td
                dataLabel="Primitive"
                modifier="truncate"
                width={widthByKey.primitive}
              >
                {primitiveCell ? (
                  <Content component="span">{primitiveCell.label}</Content>
                ) : (
                  emptyCell
                )}
              </Td>
              <Td
                dataLabel="Occurrences"
                modifier="fitContent"
                width={widthByKey.occurrences}
              >
                {asset.occurrenceCount}
              </Td>
              <Td
                dataLabel="Usage"
                modifier="nowrap"
                width={widthByKey.usage}
              >
                {asset.usageType}
              </Td>
              {showSbomColumn ? (
                <Td
                  dataLabel="SBOMs"
                  modifier="truncate"
                  width={widthByKey.sboms}
                >
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
