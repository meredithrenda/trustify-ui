import type React from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  ContentVariants,
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
import ExclamationTriangleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon";
import ArrowRightIcon from "@patternfly/react-icons/dist/esm/icons/arrow-right-icon";

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
  vexStatus: VexStatus;
  primaryAction?: {
    label: string;
    linkTo: string;
  };
}

const MOCK_BRIEFS: AnalysisBrief[] = [
  {
    id: "brief-1",
    severity: "critical",
    cve: "CVE-2026-4432",
    conclusion: "Active exploitation observed",
    detail: "Found in production deployments with no mitigation.",
    vexStatus: "Affected",
    primaryAction: {
      label: "View 2 affected SBOMs",
      linkTo: Paths.sboms,
    },
  },
  {
    id: "brief-2",
    severity: "high",
    cve: "CVE-2026-3891",
    conclusion: "Patch available but not applied",
    detail: "OpenSSL 3.1.4 requires upgrade to 3.1.5.",
    vexStatus: "Under Investigation",
    primaryAction: {
      label: "Review 1 SBOM",
      linkTo: Paths.sboms,
    },
  },
  {
    id: "brief-3",
    severity: "medium",
    cve: "CVE-2025-9921",
    conclusion: "Fixed in latest patch",
    detail: "VEX documentation confirms no impact.",
    vexStatus: "Fixed",
    primaryAction: {
      label: "View 3 patched SBOMs",
      linkTo: Paths.sboms,
    },
  },
];

const severityProps: Record<
  Severity,
  { color: "red" | "orange" | "yellow"; icon: React.ReactElement }
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
    color: "yellow",
    icon: <ExclamationTriangleIcon />,
  },
};

const vexStatusColor = (
  status: VexStatus,
): "red" | "green" | "blue" | "orange" | "yellow" => {
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
      return "yellow";
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
                    <Flex
                      justifyContent={{
                        default: "justifyContentSpaceBetween",
                      }}
                      alignItems={{ default: "alignItemsCenter" }}
                      spaceItems={{ default: "spaceItemsSm" }}
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
                  </CardBody>

                  <CardTitle>{brief.conclusion}</CardTitle>

                  <CardBody isFilled={false}>
                    <Content component={ContentVariants.small}>
                      {brief.detail}
                    </Content>
                  </CardBody>

                  <CardBody>
                    <Label color={vexStatusColor(brief.vexStatus)}>
                      {brief.vexStatus}
                    </Label>
                  </CardBody>

                  {brief.primaryAction && (
                    <CardFooter>
                      <Link to={brief.primaryAction.linkTo}>
                        <Button
                          variant="link"
                          isInline
                          icon={<ArrowRightIcon />}
                          iconPosition="end"
                        >
                          {brief.primaryAction.label}
                        </Button>
                      </Link>
                    </CardFooter>
                  )}
                </Card>
              </GridItem>
            );
          })}
        </Grid>
      </StackItem>
    </Stack>
  );
};
