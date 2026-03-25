import type React from "react";

import { PageSection } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import { AskAgentSection } from "./components/AskAgentSection";
import { AnalysisBriefsSection } from "./components/AnalysisBriefsSection";
import { RecommendedActionsSection } from "./components/RecommendedActionsSection";

export const Home: React.FC = () => {
  return (
    <>
      <DocumentMetadata title={"Home"} />

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
