import React from "react";

import dayjs from "dayjs";

import {
  Card,
  CardBody,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { ChartDonut } from "@patternfly/react-charts/victory";
import { Chart, ChartBar, ChartAxis } from "@patternfly/react-charts/victory";

import type { CsafDocument } from "../types";
import { collectProducts, collectRelationshipProducts } from "../types";

interface Props {
  data: CsafDocument;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#C9190B",
  important: "#EC7A08",
  high: "#EC7A08",
  moderate: "#F0AB00",
  medium: "#F0AB00",
  low: "#0066CC",
  unknown: "#8A8D90",
};

const severityLabelColor = (
  severity?: string
): "red" | "orange" | "gold" | "blue" | "grey" => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "red";
    case "important":
    case "high":
      return "orange";
    case "moderate":
    case "medium":
      return "gold";
    case "low":
      return "blue";
    default:
      return "grey";
  }
};

const statusColor = (status: string): "blue" | "green" | "gold" | "grey" => {
  switch (status.toLowerCase()) {
    case "final":
      return "green";
    case "draft":
      return "gold";
    case "interim":
      return "blue";
    default:
      return "grey";
  }
};

const formatDate = (dateStr: string) => dayjs(dateStr).format("MMM D, YYYY");

export const DocumentOverview: React.FC<Props> = ({ data }) => {
  const { document: doc, product_tree, vulnerabilities } = data;
  const branchProducts = collectProducts(product_tree);
  const relationshipProducts = collectRelationshipProducts(product_tree);
  const totalProducts = branchProducts.length + relationshipProducts.length;

  const severityCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const vuln of vulnerabilities) {
      const sev = (
        vuln.scores?.[0]?.cvss_v3?.baseSeverity ?? "unknown"
      ).toLowerCase();
      counts[sev] = (counts[sev] || 0) + 1;
    }
    return Object.entries(counts).map(([severity, count]) => ({
      severity,
      count,
      color: SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.unknown,
    }));
  }, [vulnerabilities]);

  const remediationCounts = React.useMemo(() => {
    const counts: Record<string, Set<string>> = {};
    for (const vuln of vulnerabilities) {
      for (const rem of vuln.remediations ?? []) {
        if (!counts[rem.category]) counts[rem.category] = new Set();
        for (const pid of rem.product_ids) {
          counts[rem.category].add(pid);
        }
      }
    }
    return Object.entries(counts).map(([category, productSet]) => ({
      category: category.replace(/_/g, " "),
      count: productSet.size,
    }));
  }, [vulnerabilities]);

  const donutData = React.useMemo(() => {
    if (remediationCounts.length === 0) {
      return {
        data: [{ x: "Known affected", y: totalProducts }],
        legendData: [{ name: `Known affected: ${totalProducts}` }],
        colorScale: ["#C9190B"],
        total: totalProducts,
      };
    }
    const colors = ["#C9190B", "#EC7A08", "#F0AB00", "#0066CC", "#8A8D90"];
    return {
      data: remediationCounts.map((r) => ({ x: r.category, y: r.count })),
      legendData: remediationCounts.map((r) => ({
        name: `${r.category}: ${r.count}`,
      })),
      colorScale: remediationCounts.map((_, i) => colors[i % colors.length]),
      total: remediationCounts.reduce((sum, r) => sum + r.count, 0),
    };
  }, [remediationCounts, totalProducts]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <Flex
                  justifyContent={{
                    default: "justifyContentSpaceBetween",
                  }}
                  alignItems={{ default: "alignItemsFlexStart" }}
                >
                  <FlexItem>
                    <Title headingLevel="h2" size="xl">
                      {doc.title}
                    </Title>
                  </FlexItem>
                  {doc.distribution?.tlp && (
                    <FlexItem>
                      <Label>TLP: {doc.distribution.tlp.label}</Label>
                    </FlexItem>
                  )}
                </Flex>
              </StackItem>

              <StackItem>
                <DescriptionList isHorizontal isCompact>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Tracking ID</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Label color="blue">{doc.tracking.id}</Label>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Status</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Label color={statusColor(doc.tracking.status)}>
                        {doc.tracking.status}
                      </Label>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Version</DescriptionListTerm>
                    <DescriptionListDescription>
                      {doc.tracking.version}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Category</DescriptionListTerm>
                    <DescriptionListDescription>
                      {doc.category}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Publisher</DescriptionListTerm>
                    <DescriptionListDescription>
                      {doc.publisher.name}{" "}
                      <Label variant="outline" color="gold">
                        {doc.publisher.category}
                      </Label>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Initial release</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatDate(doc.tracking.initial_release_date)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Current release</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatDate(doc.tracking.current_release_date)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  {doc.tracking.generator && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Generator</DescriptionListTerm>
                      <DescriptionListDescription>
                        {doc.tracking.generator.engine.name} v
                        {doc.tracking.generator.engine.version}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                </DescriptionList>
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Grid hasGutter>
          <GridItem md={4}>
            <Card isFullHeight>
              <CardBody>
                <Title headingLevel="h3" size="md">
                  Vulnerabilities
                </Title>
                <Content
                  component="p"
                  style={{ fontSize: "var(--pf-v6-global--FontSize--3xl)" }}
                >
                  <strong>{vulnerabilities.length}</strong>{" "}
                  <Content
                    component="small"
                    style={{ color: "var(--pf-v6-global--Color--200)" }}
                  >
                    total
                  </Content>
                </Content>
                {severityCounts.length > 0 && (
                  <div style={{ height: "120px", width: "100%" }}>
                    <Chart
                      height={120}
                      padding={{ top: 10, bottom: 30, left: 80, right: 20 }}
                      domainPadding={{ x: 15 }}
                    >
                      <ChartAxis
                        style={{
                          tickLabels: { fontSize: 12 },
                          axis: { stroke: "transparent" },
                        }}
                      />
                      <ChartAxis
                        dependentAxis
                        style={{
                          tickLabels: { fontSize: 10 },
                          axis: { stroke: "transparent" },
                          grid: { stroke: "#D2D2D2", strokeDasharray: "3,3" },
                        }}
                      />
                      <ChartBar
                        horizontal
                        data={severityCounts.map((s) => ({
                          x: s.severity.charAt(0).toUpperCase() + s.severity.slice(1),
                          y: s.count,
                        }))}
                        style={{
                          data: {
                            fill: ({ datum }: { datum: { x: string } }) => {
                              return (
                                SEVERITY_COLORS[datum.x.toLowerCase()] ??
                                SEVERITY_COLORS.unknown
                              );
                            },
                          },
                        }}
                        barWidth={18}
                      />
                    </Chart>
                  </div>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={4}>
            <Card isFullHeight>
              <CardBody>
                <Title headingLevel="h3" size="md">
                  Products
                </Title>
                <Content
                  component="p"
                  style={{ fontSize: "var(--pf-v6-global--FontSize--3xl)" }}
                >
                  <strong>{totalProducts}</strong>{" "}
                  <Content
                    component="small"
                    style={{ color: "var(--pf-v6-global--Color--200)" }}
                  >
                    total
                  </Content>
                </Content>
                <DescriptionList isCompact>
                  <DescriptionListGroup>
                    <DescriptionListTerm>From branches</DescriptionListTerm>
                    <DescriptionListDescription>
                      {branchProducts.length}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      From relationships
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {relationshipProducts.length}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={4}>
            <Card isFullHeight>
              <CardBody>
                <Title headingLevel="h3" size="md">
                  Product status
                </Title>
                <div style={{ height: "230px", width: "100%", maxWidth: "350px", margin: "0 auto" }}>
                  <ChartDonut
                    constrainToVisibleArea
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 140,
                      top: 20,
                    }}
                    title={`${donutData.total}`}
                    subTitle="entries"
                    width={350}
                    height={230}
                    legendData={donutData.legendData}
                    data={donutData.data}
                    labels={({ datum }) => `${datum.x}: ${datum.y}`}
                    colorScale={donutData.colorScale}
                  />
                </div>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};
