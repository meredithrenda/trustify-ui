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
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import type { CsafDocument, Branch } from "../types";

echarts.use([TreeChart, TooltipComponent, CanvasRenderer]);

interface Props {
  data: CsafDocument;
}

interface EChartsTreeNode {
  name: string;
  value?: string;
  itemStyle?: { color: string; borderColor: string };
  label?: { color?: string; fontWeight?: string };
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

function countLeaves(branch: Branch): number {
  if (!branch.branches || branch.branches.length === 0) return 1;
  return branch.branches.reduce((sum, b) => sum + countLeaves(b), 0);
}

function branchToEChartsNode(branch: Branch): EChartsTreeNode {
  const color = CATEGORY_COLORS[branch.category] ?? "#8A8D90";
  const hasChildren = branch.branches && branch.branches.length > 0;
  const shouldCollapse = hasChildren && countLeaves(branch) > 40;

  return {
    name: branch.name,
    value: branch.product?.product_id,
    itemStyle: { color, borderColor: color },
    children: hasChildren
      ? branch.branches!.map(branchToEChartsNode)
      : undefined,
    collapsed: shouldCollapse,
  };
}

export const ProductsTable: React.FC<Props> = ({ data }) => {
  const treeData = React.useMemo(() => {
    const roots = data.product_tree.branches.map(branchToEChartsNode);
    if (roots.length === 1) return roots[0];
    return {
      name: "Products",
      children: roots,
      itemStyle: { color: "#8A8D90", borderColor: "#8A8D90" },
    };
  }, [data.product_tree.branches]);

  const leafCount = React.useMemo(() => {
    function count(node: EChartsTreeNode): number {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.reduce((s, c) => s + count(c), 0);
    }
    return count(treeData);
  }, [treeData]);

  const chartHeight = Math.max(500, leafCount * 28);

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
          left: "8%",
          right: "24%",
          top: "2%",
          bottom: "2%",
          orient: "LR" as const,
          symbol: "circle",
          symbolSize: 10,
          edgeShape: "curve" as const,
          lineStyle: {
            width: 1.5,
            color: "#C9C9C9",
            curveness: 0.5,
          },
          label: {
            position: "right" as const,
            verticalAlign: "middle" as const,
            align: "left" as const,
            fontSize: 12,
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
          emphasis: {
            focus: "descendant" as const,
            lineStyle: { width: 3 },
          },
          expandAndCollapse: true,
          initialTreeDepth: 3,
          animationDuration: 550,
          animationDurationUpdate: 750,
          roam: true,
        },
      ],
    }),
    [treeData]
  );

  return (
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
              Click a node to expand or collapse. Scroll to zoom, drag to
              pan.
            </Content>
          </StackItem>

          <StackItem>
            <Flex
              gap={{ default: "gapSm" }}
              flexWrap={{ default: "wrap" }}
            >
              {CATEGORY_LABELS.map((cat) => (
                <FlexItem key={cat}>
                  <Label
                    variant="outline"
                    isCompact
                    icon={
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor:
                            CATEGORY_COLORS[cat] ?? "#8A8D90",
                        }}
                      />
                    }
                  >
                    {cat.replace(/_/g, " ")}
                  </Label>
                </FlexItem>
              ))}
            </Flex>
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
