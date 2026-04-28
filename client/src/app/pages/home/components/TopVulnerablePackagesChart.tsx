import type React from "react";

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
import { useVulnerabilitiesOfSboms } from "@app/hooks/domain-controls/useVulnerabilitiesOfSbom";

interface TopVulnerablePackagesChartProps {
  sboms: SbomHead[];
  vulnerabilities: unknown[];
}

export const TopVulnerablePackagesChart: React.FC<
  TopVulnerablePackagesChartProps
> = ({ sboms }) => {
  const sbomIds = sboms.slice(0, 10).map((sbom) => sbom.id);
  const { data: vulnerabilitiesData = [] } = useVulnerabilitiesOfSboms(
    sbomIds.length > 0 ? sbomIds : [],
  );

  // Extract package names from vulnerabilities and count occurrences
  const packageVulnCount: Record<string, number> = {};

  vulnerabilitiesData.forEach((vulnData) => {
    vulnData.vulnerabilities.forEach((vuln) => {
      vuln.relatedPackages.forEach((pkgGroup) => {
        pkgGroup.packages.forEach((pkg) => {
          const pkgName = pkg.name || "Unknown";
          packageVulnCount[pkgName] = (packageVulnCount[pkgName] || 0) + 1;
        });
      });
    });
  });

  // Get top 5 packages
  const topPackages = Object.entries(packageVulnCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  if (topPackages.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyStateBody>
          No package vulnerability data available. Upload SBOMs to see analysis.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const chartData = topPackages.map((pkg, index) => ({
    x: pkg.name.length > 20 ? `${pkg.name.substring(0, 20)}...` : pkg.name,
    y: pkg.count,
    label: `${pkg.name}: ${pkg.count}`,
  }));

  return (
    <div style={{ height: "250px" }}>
      <Chart
        ariaDesc="Top vulnerable packages"
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
