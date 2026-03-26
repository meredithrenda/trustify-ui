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
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartDonut,
  ChartStack,
  ChartTooltip,
} from "@patternfly/react-charts/victory";

import type { CsafDocument } from "../types";
import { collectProducts, collectRelationshipProducts } from "../types";

interface Props {
  data: CsafDocument;
}

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

  const SEVERITY_COLORS: Record<string, string> = {
    critical: "#C9190B",
    important: "#EC7A08",
    high: "#EC7A08",
    moderate: "#F0AB00",
    medium: "#F0AB00",
    low: "#0066CC",
    unknown: "#8A8D90",
  };

  const SEVERITY_ORDER: Record<string, number> = {
    critical: 0,
    important: 1,
    high: 1,
    moderate: 2,
    medium: 2,
    low: 3,
    unknown: 4,
  };

  const impactData = React.useMemo(() => {
    const rows: {
      severity: string;
      cveCount: number;
      productCount: number;
      color: string;
    }[] = [];
    const seen: Record<string, { cves: number; products: Set<string> }> = {};

    for (const vuln of vulnerabilities) {
      const sev = (
        vuln.scores?.[0]?.cvss_v3?.baseSeverity ?? "unknown"
      ).toLowerCase();
      if (!seen[sev]) seen[sev] = { cves: 0, products: new Set() };
      seen[sev].cves += 1;
      for (const pid of vuln.scores?.[0]?.products ?? []) {
        seen[sev].products.add(pid);
      }
    }

    for (const [severity, data] of Object.entries(seen)) {
      rows.push({
        severity,
        cveCount: data.cves,
        productCount: data.products.size,
        color: SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.unknown,
      });
    }

    return rows.sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 99) -
        (SEVERITY_ORDER[b.severity] ?? 99)
    );
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
      {/* Document metadata */}
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
                  <FlexItem>
                    <Flex gap={{ default: "gapSm" }}>
                      {doc.aggregate_severity && (
                        <FlexItem>
                          <Label
                            color={severityLabelColor(
                              doc.aggregate_severity.text
                            )}
                          >
                            Severity:{" "}
                            {doc.aggregate_severity.text}
                          </Label>
                        </FlexItem>
                      )}
                      {doc.distribution?.tlp && (
                        <FlexItem>
                          <Label>
                            TLP: {doc.distribution.tlp.label}
                          </Label>
                        </FlexItem>
                      )}
                    </Flex>
                  </FlexItem>
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
                      <Label variant="outline" isCompact>
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

      {/* Summary cards */}
      <StackItem>
        <Grid hasGutter>
          <GridItem md={6}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h3" size="md">
                      Impact summary
                    </Title>
                    <Content
                      component="small"
                      style={{ color: "var(--pf-v6-global--Color--200)" }}
                    >
                      {vulnerabilities.length} CVE
                      {vulnerabilities.length !== 1 ? "s" : ""} affecting{" "}
                      {totalProducts} product
                      {totalProducts !== 1 ? "s" : ""}
                    </Content>
                  </StackItem>
                  <StackItem>
                    <div
                      style={{
                        height: Math.max(120, impactData.length * 50 + 40),
                        width: "100%",
                      }}
                    >
                      <Chart
                        height={Math.max(
                          120,
                          impactData.length * 50 + 40
                        )}
                        padding={{
                          top: 10,
                          bottom: 35,
                          left: 90,
                          right: 30,
                        }}
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
                            grid: {
                              stroke: "#D2D2D2",
                              strokeDasharray: "3,3",
                            },
                          }}
                        />
                        <ChartStack horizontal>
                          <ChartBar
                            data={impactData.map((d) => ({
                              x:
                                d.severity.charAt(0).toUpperCase() +
                                d.severity.slice(1),
                              y: d.cveCount,
                              label: `${d.cveCount} CVE${d.cveCount !== 1 ? "s" : ""}`,
                            }))}
                            style={{
                              data: {
                                fill: ({
                                  datum,
                                }: {
                                  datum: { x: string };
                                }) =>
                                  SEVERITY_COLORS[
                                    datum.x.toLowerCase()
                                  ] ?? SEVERITY_COLORS.unknown,
                              },
                            }}
                            barWidth={20}
                            labelComponent={
                              <ChartTooltip constrainToVisibleArea />
                            }
                          />
                          <ChartBar
                            data={impactData.map((d) => ({
                              x:
                                d.severity.charAt(0).toUpperCase() +
                                d.severity.slice(1),
                              y: d.productCount,
                              label: `${d.productCount} product${d.productCount !== 1 ? "s" : ""} affected`,
                            }))}
                            style={{
                              data: {
                                fill: ({
                                  datum,
                                }: {
                                  datum: { x: string };
                                }) => {
                                  const base =
                                    SEVERITY_COLORS[
                                      datum.x.toLowerCase()
                                    ] ?? SEVERITY_COLORS.unknown;
                                  return `${base}80`;
                                },
                              },
                            }}
                            barWidth={20}
                            labelComponent={
                              <ChartTooltip constrainToVisibleArea />
                            }
                          />
                        </ChartStack>
                      </Chart>
                    </div>
                  </StackItem>
                  <StackItem>
                    <Flex gap={{ default: "gapMd" }}>
                      <FlexItem>
                        <Flex
                          gap={{ default: "gapXs" }}
                          alignItems={{ default: "alignItemsCenter" }}
                        >
                          <FlexItem>
                            <span
                              style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                backgroundColor: "#8A8D90",
                                borderRadius: 2,
                              }}
                            />
                          </FlexItem>
                          <FlexItem>
                            <Content
                              component="small"
                              style={{
                                color: "var(--pf-v6-global--Color--200)",
                              }}
                            >
                              CVEs
                            </Content>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Flex
                          gap={{ default: "gapXs" }}
                          alignItems={{ default: "alignItemsCenter" }}
                        >
                          <FlexItem>
                            <span
                              style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                backgroundColor: "#8A8D9080",
                                borderRadius: 2,
                              }}
                            />
                          </FlexItem>
                          <FlexItem>
                            <Content
                              component="small"
                              style={{
                                color: "var(--pf-v6-global--Color--200)",
                              }}
                            >
                              Products affected
                            </Content>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={6}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h3" size="md">
                      Remediation status
                    </Title>
                    <Content
                      component="small"
                      style={{ color: "var(--pf-v6-global--Color--200)" }}
                    >
                      Fix availability across affected products
                    </Content>
                  </StackItem>
                  <StackItem>
                    <div
                      style={{
                        height: "230px",
                        width: "100%",
                        maxWidth: "350px",
                        margin: "0 auto",
                      }}
                    >
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
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>

      {/* Document references */}
      {doc.references && doc.references.length > 0 && (
        <StackItem>
          <Card>
            <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    Document references
                  </Title>
                </StackItem>
                <StackItem>
                  <Flex
                    direction={{ default: "column" }}
                    gap={{ default: "gapSm" }}
                  >
                    {doc.references.map((ref) => (
                      <FlexItem key={ref.url}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {ref.summary}
                          <ExternalLinkAltIcon
                            style={{
                              fontSize: "var(--pf-v6-global--FontSize--xs)",
                            }}
                          />
                        </a>
                        {ref.category && ref.category !== "self" && (
                          <Label
                            variant="outline"
                            isCompact
                            style={{ marginLeft: 8 }}
                          >
                            {ref.category}
                          </Label>
                        )}
                      </FlexItem>
                    ))}
                  </Flex>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      )}

      {/* Revision history */}
      {doc.tracking.revision_history &&
        doc.tracking.revision_history.length > 0 && (
          <StackItem>
            <Card>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h3" size="md">
                      Revision history
                    </Title>
                  </StackItem>
                  <StackItem>
                    <DescriptionList isHorizontal isCompact>
                      {[...doc.tracking.revision_history]
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((rev) => (
                          <DescriptionListGroup key={rev.number}>
                            <DescriptionListTerm>
                              <Flex
                                gap={{ default: "gapSm" }}
                                alignItems={{
                                  default: "alignItemsCenter",
                                }}
                              >
                                <FlexItem>
                                  <Label variant="outline" isCompact>
                                    v{rev.number}
                                  </Label>
                                </FlexItem>
                                <FlexItem>
                                  <Content
                                    component="small"
                                    style={{
                                      color:
                                        "var(--pf-v6-global--Color--200)",
                                    }}
                                  >
                                    {formatDate(rev.date)}
                                  </Content>
                                </FlexItem>
                              </Flex>
                            </DescriptionListTerm>
                            <DescriptionListDescription>
                              {rev.summary}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        ))}
                    </DescriptionList>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </StackItem>
        )}
    </Stack>
  );
};
