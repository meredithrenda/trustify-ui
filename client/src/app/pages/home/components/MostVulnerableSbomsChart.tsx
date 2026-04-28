import type React from "react";
import { Link } from "react-router-dom";

import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLabel,
  ChartThemeColor,
  ChartTooltip,
} from "@patternfly/react-charts/victory";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from "@patternfly/react-core";

import type { SbomHead } from "@app/client";
import { Paths } from "@app/Routes";
import { useVulnerabilitiesOfSboms } from "@app/hooks/domain-controls/useVulnerabilitiesOfSbom";

interface MostVulnerableSbomsChartProps {
  sboms: SbomHead[];
}

export const MostVulnerableSbomsChart: React.FC<
  MostVulnerableSbomsChartProps
> = ({ sboms }) => {
  const topSboms = sboms.slice(0, 5);
  const sbomIds = topSboms.map((sbom) => sbom.id);

  const { data: vulnerabilitiesData = [], isFetching } =
    useVulnerabilitiesOfSboms(sbomIds.length > 0 ? sbomIds : []);

  // Count vulnerabilities per SBOM
  const sbomVulnCounts = topSboms.map((sbom, index) => {
    const vulnData = vulnerabilitiesData[index];
    const count = vulnData?.summary.vulnerabilityStatus.affected.total || 0;
    return {
      sbom,
      count,
    };
  });

  // Sort by count and take top 5
  const sortedSboms = [...sbomVulnCounts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (sortedSboms.length === 0 || sortedSboms.every((s) => s.count === 0)) {
    return (
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyStateBody>
          No vulnerability data available. Upload SBOMs to see analysis.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const chartData = sortedSboms.map((item) => ({
    x:
      item.sbom.name.length > 15
        ? `${item.sbom.name.substring(0, 15)}...`
        : item.sbom.name,
    y: item.count,
    label: `${item.sbom.name}: ${item.count} vulnerabilities`,
  }));

  return (
    <div style={{ height: "250px" }}>
      <Chart
        ariaDesc="Most vulnerable SBOMs"
        domainPadding={{ x: [30, 25] }}
        height={250}
        padding={{
          bottom: 100,
          left: 60,
          right: 50,
          top: 50,
        }}
        themeColor={ChartThemeColor.multiOrdered}
        width={600}
      >
        <ChartAxis
          tickLabelComponent={
            <ChartLabel angle={-45} textAnchor="end" dy={5} dx={-5} />
          }
        />
        <ChartAxis dependentAxis showGrid />
        <ChartBar
          data={chartData}
          labelComponent={<ChartTooltip constrainToVisibleArea />}
        />
      </Chart>
    </div>
  );
};
