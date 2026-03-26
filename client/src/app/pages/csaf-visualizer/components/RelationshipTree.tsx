import React from "react";

import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { TreeChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import {
  Card,
  CardBody,
  Content,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import type { CsafDocument, Branch, Relationship } from "../types";

echarts.use([TreeChart, TooltipComponent, CanvasRenderer]);

interface Props {
  data: CsafDocument;
}

interface EChartsTreeNode {
  name: string;
  value?: string;
  itemStyle?: { color: string; borderColor: string };
  lineStyle?: { color: string; type?: string };
  children?: EChartsTreeNode[];
  collapsed?: boolean;
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

const RELATIONSHIP_COLORS: Record<string, string> = {
  default_component_of: "#C9190B",
  external_component_of: "#EC7A08",
  installed_on: "#3E8635",
  installed_with: "#004B95",
  optional_component_of: "#8A8D90",
};

const RELATIONSHIP_LINE_STYLES: Record<string, string> = {
  default_component_of: "solid",
  external_component_of: "solid",
  installed_on: "dashed",
  installed_with: "dashed",
  optional_component_of: "dotted",
};

const NODE_CATEGORY_LABELS = [
  "vendor",
  "product_name",
  "product_version",
  "product_version_range",
  "product_family",
  "architecture",
];

const RELATIONSHIP_LABELS = [
  "default_component_of",
  "external_component_of",
  "installed_on",
  "installed_with",
  "optional_component_of",
];

function buildProductIdMap(branches: Branch[]): Map<string, { name: string; category: string }> {
  const map = new Map<string, { name: string; category: string }>();

  function walk(b: Branch) {
    if (b.product) {
      map.set(b.product.product_id, { name: b.name, category: b.category });
    }
    b.branches?.forEach(walk);
  }

  branches.forEach(walk);
  return map;
}

function findVendorName(branches: Branch[]): string {
  const vendor = branches.find((b) => b.category === "vendor");
  return vendor?.name ?? "Root";
}

function buildRelationshipTree(data: CsafDocument): EChartsTreeNode {
  const relationships = data.product_tree.relationships ?? [];
  if (relationships.length === 0) {
    return { name: "No relationships", children: [] };
  }

  const productMap = buildProductIdMap(data.product_tree.branches);
  const vendorName = findVendorName(data.product_tree.branches);

  const byRelatesToProduct = new Map<string, Relationship[]>();
  for (const rel of relationships) {
    const key = rel.relates_to_product_reference;
    if (!byRelatesToProduct.has(key)) {
      byRelatesToProduct.set(key, []);
    }
    byRelatesToProduct.get(key)!.push(rel);
  }

  const productNodes: EChartsTreeNode[] = [];

  for (const [relatesToId, rels] of byRelatesToProduct) {
    const relatesToInfo = productMap.get(relatesToId);
    const relatesToName = relatesToInfo?.name ?? relatesToId;
    const relatesToColor =
      CATEGORY_COLORS[relatesToInfo?.category ?? ""] ?? "#0066CC";

    const byComponent = new Map<string, Relationship[]>();
    for (const rel of rels) {
      const compKey = rel.product_reference;
      if (!byComponent.has(compKey)) {
        byComponent.set(compKey, []);
      }
      byComponent.get(compKey)!.push(rel);
    }

    const relationshipNodes: EChartsTreeNode[] = [];

    for (const [componentId, compRels] of byComponent) {
      const componentInfo = productMap.get(componentId);
      const componentName = componentInfo?.name ?? componentId;

      for (const rel of compRels) {
        const relColor =
          RELATIONSHIP_COLORS[rel.category] ?? "#8A8D90";
        const relLineType =
          RELATIONSHIP_LINE_STYLES[rel.category] ?? "solid";

        const componentColor =
          CATEGORY_COLORS[componentInfo?.category ?? ""] ?? "#5752D1";

        relationshipNodes.push({
          name: rel.full_product_name.name,
          value: rel.full_product_name.product_id,
          lineStyle: { color: relColor, type: relLineType },
          itemStyle: { color: relColor, borderColor: relColor },
          children: [
            {
              name: componentName,
              value: componentId,
              itemStyle: {
                color: componentColor,
                borderColor: componentColor,
              },
            },
          ],
        });
      }
    }

    productNodes.push({
      name: relatesToName,
      value: relatesToId,
      itemStyle: { color: relatesToColor, borderColor: relatesToColor },
      children: relationshipNodes,
      collapsed: relationshipNodes.length > 15,
    });
  }

  return {
    name: vendorName,
    itemStyle: {
      color: CATEGORY_COLORS.vendor,
      borderColor: CATEGORY_COLORS.vendor,
    },
    children: productNodes,
  };
}

export const RelationshipTree: React.FC<Props> = ({ data }) => {
  const treeData = React.useMemo(() => buildRelationshipTree(data), [data]);

  const leafCount = React.useMemo(() => {
    function count(node: EChartsTreeNode): number {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.reduce((s, c) => s + count(c), 0);
    }
    return count(treeData);
  }, [treeData]);

  const chartHeight = Math.max(600, leafCount * 26);

  const option = React.useMemo(
    () => ({
      tooltip: {
        trigger: "item" as const,
        triggerOn: "mousemove" as const,
        formatter: (params: { name: string; value?: string }) => {
          let html = `<strong>${params.name}</strong>`;
          if (params.value) {
            html += `<br/><span style="color:#999">ID:</span> ${params.value}`;
          }
          return html;
        },
      },
      series: [
        {
          type: "tree" as const,
          data: [treeData],
          left: "6%",
          right: "20%",
          top: "2%",
          bottom: "2%",
          orient: "LR" as const,
          symbol: "circle",
          symbolSize: 10,
          edgeShape: "curve" as const,
          lineStyle: {
            width: 1.5,
            curveness: 0.5,
          },
          label: {
            position: "right" as const,
            verticalAlign: "middle" as const,
            align: "left" as const,
            fontSize: 11,
            fontFamily:
              "RedHatText, Overpass, overpass, helvetica, arial, sans-serif",
            color: "#151515",
            distance: 8,
          },
          leaves: {
            label: {
              position: "right" as const,
              verticalAlign: "middle" as const,
              align: "left" as const,
            },
          },
          expandAndCollapse: true,
          initialTreeDepth: 2,
          animationDuration: 550,
          animationDurationUpdate: 750,
          roam: true,
        },
      ],
    }),
    [treeData]
  );

  const hasRelationships =
    (data.product_tree.relationships ?? []).length > 0;

  if (!hasRelationships) {
    return (
      <Card>
        <CardBody>
          <Content component="p">
            This document does not contain any product relationships.
          </Content>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h3" size="md">
              Relationship tree
            </Title>
            <Content
              component="small"
              style={{
                color: "var(--pf-v6-global--Color--200)",
                marginTop: "var(--pf-v6-global--spacer--xs)",
              }}
            >
              Hover to highlight path. Click a node to expand or collapse. Drag
              to pan, scroll to zoom.
            </Content>
          </StackItem>

          <StackItem>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--pf-v6-global--spacer--md)",
                marginBottom: "var(--pf-v6-global--spacer--xs)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--pf-v6-global--spacer--sm)",
                }}
              >
                {NODE_CATEGORY_LABELS.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "var(--pf-v6-global--FontSize--xs)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: CATEGORY_COLORS[cat] ?? "#8A8D90",
                        marginRight: 6,
                      }}
                    />
                    {cat.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--pf-v6-global--spacer--sm)",
                  borderLeft:
                    "1px solid var(--pf-v6-global--BorderColor--100)",
                  paddingLeft: "var(--pf-v6-global--spacer--md)",
                }}
              >
                {RELATIONSHIP_LABELS.map((rel) => (
                  <span
                    key={rel}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "var(--pf-v6-global--FontSize--xs)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 20,
                        height: 0,
                        borderTop: `2px ${RELATIONSHIP_LINE_STYLES[rel] ?? "solid"} ${RELATIONSHIP_COLORS[rel] ?? "#8A8D90"}`,
                        marginRight: 6,
                      }}
                    />
                    {rel.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </StackItem>

          <StackItem>
            <ReactEChartsCore
              echarts={echarts}
              option={option}
              style={{ height: `${chartHeight}px`, width: "100%" }}
              notMerge
              lazyUpdate
            />
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};
