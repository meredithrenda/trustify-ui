import type React from "react";
import { Link } from "react-router-dom";

import {
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import ExclamationCircleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import ExclamationTriangleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon";
import { Paths } from "@app/Routes";

type Severity = "critical" | "high" | "medium";
type VexStatus =
  | "Affected"
  | "Not Affected"
  | "Fixed"
  | "Under Investigation"
  | "Documented";

interface AnalysisBrief {
  id: string;
  severity: Severity;
  cve: string;
  conclusion: string;
  detail: string;
  affectedProducts: string[];
  vexStatus: VexStatus;
  lifecycle: string;
}

const MOCK_BRIEFS: AnalysisBrief[] = [
  {
    id: "brief-1",
    severity: "critical",
    cve: "CVE-2026-4432",
    conclusion:
      "Actively exploited in the wild — 2 production SBOMs contain vulnerable versions.",
    detail:
      "The agent correlated CSAF advisory RHSA-2026:1234 with 4 ingested SBOMs. Two contain libxml2 2.9.12 in production deployments with no VEX mitigation documented.",
    affectedProducts: ["RHEL 9.4", "UBI 9-minimal"],
    vexStatus: "Affected",
    lifecycle: "Active support",
  },
  {
    id: "brief-2",
    severity: "high",
    cve: "CVE-2026-3891",
    conclusion:
      "Patch available but not yet applied — 1 SBOM still references the vulnerable package.",
    detail:
      "OpenSSL 3.1.4 has a fix in 3.1.5. The SBOM for Project Phoenix still pins 3.1.4. VEX status is Under Investigation.",
    affectedProducts: ["Project Phoenix"],
    vexStatus: "Under Investigation",
    lifecycle: "Maintenance",
  },
  {
    id: "brief-3",
    severity: "medium",
    cve: "CVE-2025-9921",
    conclusion:
      "Mitigated — all affected deployments have documented VEX Not Affected status.",
    detail:
      "The kernel vulnerability does not apply to containerised workloads. All 3 SBOMs that include the kernel package carry a VEX Not Affected justification.",
    affectedProducts: ["RHEL 8.9", "RHEL 9.3", "Fedora 39"],
    vexStatus: "Not Affected",
    lifecycle: "Extended support",
  },
];

const severityProps: Record<
  Severity,
  { color: "red" | "orange" | "gold"; icon: React.ReactElement }
> = {
  critical: {
    color: "red",
    icon: <ExclamationCircleIcon />,
  },
  high: {
    color: "orange",
    icon: <ExclamationTriangleIcon />,
  },
  medium: {
    color: "gold",
    icon: <ExclamationTriangleIcon />,
  },
};

const vexStatusColor = (
  status: VexStatus,
): "red" | "green" | "blue" | "orange" | "gold" => {
  switch (status) {
    case "Affected":
      return "red";
    case "Not Affected":
      return "green";
    case "Fixed":
      return "blue";
    case "Under Investigation":
      return "orange";
    case "Documented":
      return "gold";
  }
};

export const AnalysisBriefsSection: React.FC = () => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          What needs attention
        </Title>
        <Content>
          Vulnerabilities and risks across your products, ranked by severity.
        </Content>
      </StackItem>

      <StackItem>
        <Grid hasGutter>
          {MOCK_BRIEFS.map((brief) => {
            const sev = severityProps[brief.severity];
            return (
              <GridItem key={brief.id} md={4}>
                <Card isFullHeight>
                  <CardBody>
                    <Stack hasGutter>
                      <StackItem>
                        <Flex
                          justifyContent={{
                            default: "justifyContentSpaceBetween",
                          }}
                          alignItems={{ default: "alignItemsCenter" }}
                        >
                          <FlexItem>
                            <Label color={sev.color} icon={sev.icon}>
                              {brief.severity.toUpperCase()}
                            </Label>
                          </FlexItem>
                          <FlexItem>
                            <Link
                              to={Paths.vulnerabilityDetails.replace(
                                ":vulnerabilityId",
                                brief.cve,
                              )}
                            >
                              {brief.cve}
                            </Link>
                          </FlexItem>
                        </Flex>
                      </StackItem>

                      <StackItem>
                        <Content component="p">
                          <strong>{brief.conclusion}</strong>
                        </Content>
                      </StackItem>

                      <StackItem>
                        <Content
                          component="p"
                          style={{
                            fontSize: "var(--pf-v6-global--FontSize--sm)",
                            color: "var(--pf-v6-global--Color--200)",
                          }}
                        >
                          {brief.detail}
                        </Content>
                      </StackItem>

                      <StackItem>
                        <Flex
                          direction={{ default: "column" }}
                          gap={{ default: "gapXs" }}
                        >
                          <FlexItem>
                            <Content component="small">
                              <strong>Products:</strong>{" "}
                              {brief.affectedProducts.join(", ")}
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Flex
                              gap={{ default: "gapSm" }}
                              alignItems={{ default: "alignItemsCenter" }}
                            >
                              <FlexItem>
                                <Label color={vexStatusColor(brief.vexStatus)}>
                                  {brief.vexStatus}
                                </Label>
                              </FlexItem>
                              <FlexItem>
                                <Label color="blue" variant="outline">
                                  {brief.lifecycle}
                                </Label>
                              </FlexItem>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </StackItem>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            );
          })}
        </Grid>
      </StackItem>
    </Stack>
  );
};
