import type React from "react";

import { PageSection, Title, Content } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import { MetricsSection } from "./components/MetricsSection";
import { GettingStartedSection } from "./components/GettingStartedSection";

export const Home: React.FC = () => {
  return (
    <>
      <DocumentMetadata title={"Home"} />
      
      {/* Hero Section */}
      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          Home
        </Title>
        <Content>
          Manage your software supply chain security with Red Hat Trusted
          Product Advisor. Upload SBOMs, analyze vulnerabilities, and
          generate security reports.
        </Content>
      </PageSection>

      {/* Getting Started Section */}
      <PageSection>
        <GettingStartedSection />
      </PageSection>

      {/* Metrics Section */}
      <PageSection variant="light">
        <MetricsSection />
      </PageSection>
    </>
  );
};
