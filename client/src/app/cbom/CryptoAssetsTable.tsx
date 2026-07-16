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
import { CryptoAssetPolicyTableCell } from "./CryptoAssetPolicyChips";
import type { CryptographicAsset } from "./types";

interface CryptoAssetsTableProps {
  assets: CryptographicAsset[];
  onSelectAsset: (asset: CryptographicAsset) => void;
  showSbomColumn?: boolean;
  showPolicyColumn?: boolean;
  renderSbomCell?: (asset: CryptographicAsset) => React.ReactNode;
}

type TableColumnModifier = "truncate" | "fitContent" | "nowrap";

interface TableColumnConfig {
  key: string;
  title: string;
  width: number;
  modifier?: TableColumnModifier;
}

const getColumns = (
  showSbomColumn: boolean,
  showPolicyColumn: boolean,
): TableColumnConfig[] => {
  if (showSbomColumn) {
    return [
      { key: "name", title: "Name", width: 20, modifier: "truncate" },
      {
        key: "assetType",
        title: "Asset type",
        width: 12,
        modifier: "truncate",
      },
      { key: "primitive", title: "Primitive", width: 10, modifier: "truncate" },
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
      { key: "usage", title: "Usage", width: 14, modifier: "truncate" },
      { key: "sboms", title: "SBOMs", width: 18, modifier: "truncate" },
    ];
  }

  return [
    { key: "name", title: "Name", width: 24, modifier: "truncate" },
    {
      key: "assetType",
      title: "Asset type",
      width: 14,
      modifier: "truncate",
    },
    { key: "primitive", title: "Primitive", width: 12, modifier: "truncate" },
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
  showSbomColumn = false,
  showPolicyColumn = true,
  renderSbomCell,
}) => {
  const columns = getColumns(showSbomColumn, showPolicyColumn);
  const columnByKey = columnConfigByKey(columns);
  const td = (columnKey: string) => getTdProps(columnKey, columnByKey);

  return (
    <Table aria-label="Cryptographic assets table">
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
              <Td {...td("assetType")}>
                <Label color={getAssetTypeColor(asset.assetType)} isCompact>
                  {getAssetTypeLabel(asset.assetType)}
                </Label>
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
