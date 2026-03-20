import type React from "react";

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";

import type { SbomHead } from "@app/client";
import { useVulnerabilitiesOfSboms } from "@app/hooks/domain-controls/useVulnerabilitiesOfSbom";

interface DependencyRiskOverviewProps {
  totalSboms: number;
  totalVulnerabilities: number;
  sboms: SbomHead[];
}

export const DependencyRiskOverview: React.FC<DependencyRiskOverviewProps> = ({
  totalSboms,
  totalVulnerabilities,
  sboms,
}) => {
  const recentSboms = sboms.slice(0, 10);
  const sbomIds = recentSboms.map((sbom) => sbom.id);

  const {
    data: vulnerabilitiesData = [],
  } = useVulnerabilitiesOfSboms(sbomIds.length > 0 ? sbomIds : []);

  // Calculate metrics
  const totalAffected = vulnerabilitiesData.reduce(
    (sum, vuln) => sum + vuln.summary.vulnerabilityStatus.affected.total,
    0,
  );

  const totalFixed = vulnerabilitiesData.reduce(
    (sum, vuln) => sum + vuln.summary.vulnerabilityStatus.fixed.total,
    0,
  );

  const avgVulnsPerSbom =
    recentSboms.length > 0
      ? (totalAffected / recentSboms.length).toFixed(1)
      : "0.0";

  const riskLevel =
    totalAffected === 0
      ? "low"
      : totalAffected < 10
        ? "medium"
        : "high";

  return (
    <Grid hasGutter>
      <GridItem>
        <DescriptionList
          columnModifier={{
            default: "2Col",
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>
              <CheckCircleIcon
                style={{
                  color: "var(--pf-v6-global--success-color--100)",
                  marginRight: "0.5rem",
                }}
              />
              Total SBOMs
            </DescriptionListTerm>
            <DescriptionListDescription>{totalSboms}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              <ExclamationTriangleIcon
                style={{
                  color: "var(--pf-v6-global--warning-color--100)",
                  marginRight: "0.5rem",
                }}
              />
              Affected packages
            </DescriptionListTerm>
            <DescriptionListDescription>
              {totalAffected}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              <InfoCircleIcon
                style={{
                  color: "var(--pf-v6-global--info-color--100)",
                  marginRight: "0.5rem",
                }}
              />
              Fixed vulnerabilities
            </DescriptionListTerm>
            <DescriptionListDescription>{totalFixed}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              <InfoCircleIcon
                style={{
                  color: "var(--pf-v6-global--info-color--100)",
                  marginRight: "0.5rem",
                }}
              />
              Avg. vulnerabilities per SBOM
            </DescriptionListTerm>
            <DescriptionListDescription>
              {avgVulnsPerSbom}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>

      <GridItem>
        <div
          style={{
            padding: "1rem",
            backgroundColor:
              riskLevel === "low"
                ? "var(--pf-v6-global--success-color--100)"
                : riskLevel === "medium"
                  ? "var(--pf-v6-global--warning-color--100)"
                  : "var(--pf-v6-global--danger-color--100)",
            color: "white",
            borderRadius: "4px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Overall Risk Level: {riskLevel.toUpperCase()}
        </div>
      </GridItem>
    </Grid>
  );
};
