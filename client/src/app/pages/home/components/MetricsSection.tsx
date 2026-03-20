import type React from "react";

import {
  Card,
  CardBody,
  Content,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { useFetchSBOMs } from "@app/queries/sboms";
import { useFetchVulnerabilities } from "@app/queries/vulnerabilities";

import { TopVulnerablePackagesChart } from "./TopVulnerablePackagesChart";
import { VulnerabilitySeverityChart } from "./VulnerabilitySeverityChart";
import { MostVulnerableSbomsChart } from "./MostVulnerableSbomsChart";
import { DependencyRiskOverview } from "./DependencyRiskOverview";
import { BlastRadiusHeatmap } from "./BlastRadiusHeatmap";

export const MetricsSection: React.FC = () => {
  const {
    result: { data: sboms = [], total: totalSboms },
    isFetching: isFetchingSboms,
    fetchError: fetchErrorSboms,
  } = useFetchSBOMs(undefined, {
    page: { pageNumber: 1, itemsPerPage: 50 },
    sort: { field: "ingested", direction: "desc" },
  });

  const {
    result: { data: vulnerabilities = [], total: totalVulnerabilities },
    isFetching: isFetchingVulnerabilities,
    fetchError: fetchErrorVulnerabilities,
  } = useFetchVulnerabilities(
    {
      page: { pageNumber: 1, itemsPerPage: 100 },
      sort: { field: "base_score", direction: "desc" },
    },
    false,
  );

  const isLoading = isFetchingSboms || isFetchingVulnerabilities;
  const hasError = fetchErrorSboms || fetchErrorVulnerabilities;

  return (
    <LoadingWrapper isFetching={isLoading} fetchError={hasError}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="lg">
            Security insights
          </Title>
          <Content>
            Key metrics and visualizations to help you understand your supply
            chain security posture.
          </Content>
        </StackItem>

        <StackItem>
          <Grid hasGutter>
            <GridItem md={6}>
              <Card>
                <CardBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Title headingLevel="h3" size="md">
                        Top vulnerable packages
                      </Title>
                      <Content>
                        Packages responsible for the most vulnerabilities across
                        all SBOMs.
                      </Content>
                    </StackItem>
                    <StackItem>
                      <TopVulnerablePackagesChart
                        sboms={sboms}
                        vulnerabilities={vulnerabilities}
                      />
                    </StackItem>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem md={6}>
              <Card>
                <CardBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Title headingLevel="h3" size="md">
                        Vulnerability severity distribution
                      </Title>
                      <Content>
                        Breakdown of vulnerabilities by severity level.
                      </Content>
                    </StackItem>
                    <StackItem>
                      <VulnerabilitySeverityChart
                        vulnerabilities={vulnerabilities}
                      />
                    </StackItem>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </StackItem>

        <StackItem>
          <Card>
            <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    Global blast radius topology
                  </Title>
                  <Content>
                    Top 5 most pervasive vulnerabilities ranked by impacted
                    artifact count. Select a vulnerability to view its impact
                    topology showing relationships to affected SBOMs.
                  </Content>
                </StackItem>
                <StackItem>
                  <BlastRadiusHeatmap />
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </StackItem>

        <StackItem>
          <Grid hasGutter>
            <GridItem md={6}>
              <Card>
                <CardBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Title headingLevel="h3" size="md">
                        Most vulnerable SBOMs
                      </Title>
                      <Content>
                        SBOMs with the highest number of identified
                        vulnerabilities.
                      </Content>
                    </StackItem>
                    <StackItem>
                      <MostVulnerableSbomsChart sboms={sboms} />
                    </StackItem>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem md={6}>
              <Card>
                <CardBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Title headingLevel="h3" size="md">
                        Dependency risk overview
                      </Title>
                      <Content>
                        High-level view of your dependency security posture.
                      </Content>
                    </StackItem>
                    <StackItem>
                      <DependencyRiskOverview
                        totalSboms={totalSboms}
                        totalVulnerabilities={totalVulnerabilities}
                        sboms={sboms}
                      />
                    </StackItem>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </StackItem>
      </Stack>
    </LoadingWrapper>
  );
};
