import type React from "react";

import { PageSection } from "@patternfly/react-core";

import { AskAgentSection } from "./AskAgentSection";
import { AnalysisBriefsSection } from "./AnalysisBriefsSection";
import { RecommendedActionsSection } from "./RecommendedActionsSection";

export const HomePageSections: React.FC = () => {
  return (
    <>
      <PageSection variant="light">
        <AskAgentSection />
      </PageSection>

      <PageSection>
        <AnalysisBriefsSection />
      </PageSection>

      <PageSection variant="light">
        <RecommendedActionsSection />
      </PageSection>
    </>
  );
};
