import type React from "react";

import { PageSection, Stack, StackItem } from "@patternfly/react-core";

import { GetStartedSection } from "./components/GetStartedSection";
import { PortfolioMetricsSection } from "./components/PortfolioMetricsSection";
import { VulnerabilityAttentionSection } from "./components/VulnerabilityAttentionSection";

export const MiddleGroundHomePage: React.FC = () => {
  return (
    <PageSection variant="light">
      <Stack hasGutter>
        <StackItem>
          <GetStartedSection />
        </StackItem>
        <StackItem>
          <VulnerabilityAttentionSection />
        </StackItem>
        <StackItem>
          <PortfolioMetricsSection />
        </StackItem>
      </Stack>
    </PageSection>
  );
};
