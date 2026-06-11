import type React from "react";

import { HomeSectionCard } from "./HomeSectionCard";
import { DashboardIngestionMetrics } from "./DashboardIngestionMetrics";

export const PortfolioMetricsSection: React.FC = () => {
  return (
    <HomeSectionCard>
      <DashboardIngestionMetrics />
    </HomeSectionCard>
  );
};
