import React from "react";

import {
  Card,
  CardBody,
  Content,
  Label,
  Stack,
  StackItem,
  Title,
  TreeView,
  type TreeViewDataItem,
} from "@patternfly/react-core";

import type { CsafDocument, Branch, Relationship } from "../types";

interface Props {
  data: CsafDocument;
}

const CATEGORY_COLORS: Record<string, string> = {
  vendor: "#C9190B",
  product_family: "#EC7A08",
  product_name: "#0066CC",
  product_version: "#5752D1",
  product_version_range: "#009596",
  architecture: "#F0AB00",
  language: "#004B95",
  patch_level: "#8A8D90",
  service_pack: "#3E8635",
  host_name: "#470000",
  legacy: "#6A6E73",
  specification: "#2B9AF3",
};

const CategoryDot: React.FC<{ category: string }> = ({ category }) => (
  <span
    style={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      backgroundColor: CATEGORY_COLORS[category] ?? "#8A8D90",
      marginRight: 6,
      flexShrink: 0,
    }}
  />
);

function branchToTreeData(branch: Branch): TreeViewDataItem {
  const hasChildren = branch.branches && branch.branches.length > 0;
  const product = branch.product;

  const nameNode = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <CategoryDot category={branch.category} />
      <strong>{branch.name}</strong>
      {product && (
        <Content
          component="small"
          style={{
            color: "var(--pf-v6-global--Color--200)",
            marginLeft: 8,
            fontFamily: "var(--pf-v6-global--FontFamily--mono)",
            fontSize: "var(--pf-v6-global--FontSize--xs)",
          }}
        >
          {product.product_id}
        </Content>
      )}
      {product?.product_identification_helper?.cpe && (
        <Label
          variant="outline"
          isCompact
          style={{ marginLeft: 8 }}
        >
          {product.product_identification_helper.cpe}
        </Label>
      )}
    </span>
  );

  return {
    name: nameNode,
    id: product?.product_id ?? `${branch.category}-${branch.name}`,
    defaultExpanded: true,
    children: hasChildren
      ? branch.branches!.map(branchToTreeData)
      : undefined,
  };
}

const CATEGORY_LABELS = [
  "vendor",
  "product_name",
  "product_version",
  "product_version_range",
  "product_family",
  "architecture",
  "language",
  "patch_level",
  "service_pack",
  "host_name",
  "legacy",
  "specification",
];

export const ProductsTable: React.FC<Props> = ({ data }) => {
  const treeData = React.useMemo(
    () => data.product_tree.branches.map(branchToTreeData),
    [data.product_tree.branches]
  );

  const relationships = data.product_tree.relationships ?? [];

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h3" size="md">
                  Product tree
                </Title>
                <Content
                  component="small"
                  style={{
                    color: "var(--pf-v6-global--Color--200)",
                    marginTop: "var(--pf-v6-global--spacer--xs)",
                  }}
                >
                  Click a node to expand or collapse
                </Content>
              </StackItem>

              <StackItem>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--pf-v6-global--spacer--sm)",
                    marginBottom: "var(--pf-v6-global--spacer--md)",
                  }}
                >
                  {CATEGORY_LABELS.map((cat) => (
                    <span
                      key={cat}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "var(--pf-v6-global--FontSize--xs)",
                      }}
                    >
                      <CategoryDot category={cat} />
                      {cat.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </StackItem>

              <StackItem>
                <TreeView
                  data={treeData}
                  hasGuides
                  defaultAllExpanded
                  aria-label="Product tree"
                />
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </StackItem>

      {relationships.length > 0 && (
        <StackItem>
          <Card>
            <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    Relationships ({relationships.length})
                  </Title>
                </StackItem>
                <StackItem>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom:
                            "1px solid var(--pf-v6-global--BorderColor--100)",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "8px" }}>Product</th>
                        <th style={{ padding: "8px" }}>Relationship</th>
                        <th style={{ padding: "8px" }}>Relates to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relationships.map((rel: Relationship) => (
                        <tr
                          key={rel.full_product_name.product_id}
                          style={{
                            borderBottom:
                              "1px solid var(--pf-v6-global--BorderColor--100)",
                          }}
                        >
                          <td style={{ padding: "8px" }}>
                            {rel.full_product_name.name}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <Label variant="outline" isCompact>
                              {rel.category.replace(/_/g, " ")}
                            </Label>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <Content
                              component="small"
                              style={{
                                fontFamily:
                                  "var(--pf-v6-global--FontFamily--mono)",
                              }}
                            >
                              {rel.relates_to_product_reference}
                            </Content>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      )}
    </Stack>
  );
};
