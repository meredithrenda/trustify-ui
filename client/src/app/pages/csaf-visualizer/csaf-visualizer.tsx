import React from "react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  InputGroup,
  InputGroupItem,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
  TextInput,
  Title,
} from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import type { CsafDocument } from "./types";
import { DocumentOverview } from "./components/DocumentOverview";
import { VulnerabilitySection } from "./components/VulnerabilitySection";
import { ProductsTable } from "./components/ProductsTable";

const DEFAULT_URL =
  "https://security.access.redhat.com/data/csaf/v2/vex/2024/cve-2024-0232.json";

const CORS_PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

async function fetchWithCorsRetry(targetUrl: string): Promise<unknown> {
  try {
    const direct = await fetch(targetUrl);
    if (direct.ok) return direct.json();
  } catch {
    // CORS block — try proxies
  }

  for (const makeProxy of CORS_PROXIES) {
    try {
      const resp = await fetch(makeProxy(targetUrl));
      if (resp.ok) return resp.json();
    } catch {
      continue;
    }
  }

  throw new Error(
    "Could not load the document. The server may block cross-origin requests."
  );
}

export const CsafVisualizer: React.FC = () => {
  const [url, setUrl] = React.useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<CsafDocument | null>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  const handleLoad = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const json = await fetchWithCorsRetry(trimmed);
      setData(json as CsafDocument);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load CSAF document"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLoad();
    }
  };

  return (
    <>
      <DocumentMetadata title="CSAF VEX Visualizer" />

      <PageSection variant="light">
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="xl">
              CSAF VEX Visualizer
            </Title>
            <Content>
              Load a CSAF 2.0 JSON document by URL to explore its
              vulnerabilities, products, and remediations.
            </Content>
          </StackItem>

          <StackItem>
            <Card>
              <CardBody>
                <InputGroup>
                  <InputGroupItem isFill>
                    <TextInput
                      type="url"
                      aria-label="CSAF JSON URL"
                      placeholder="Enter a CSAF JSON URL..."
                      value={url}
                      onChange={(_event, value) => setUrl(value)}
                      onKeyDown={handleKeyDown}
                      isDisabled={isLoading}
                    />
                  </InputGroupItem>
                  <InputGroupItem>
                    <Button
                      variant="primary"
                      onClick={handleLoad}
                      isDisabled={isLoading || !url.trim()}
                      isLoading={isLoading}
                    >
                      {isLoading ? "Loading..." : "Load"}
                    </Button>
                  </InputGroupItem>
                </InputGroup>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </PageSection>

      {error && (
        <PageSection>
          <Alert variant="danger" title="Failed to load document">
            {error}
          </Alert>
        </PageSection>
      )}

      {isLoading && (
        <PageSection>
          <Card>
            <CardBody
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--pf-v6-global--spacer--sm)",
                justifyContent: "center",
                padding: "var(--pf-v6-global--spacer--2xl)",
              }}
            >
              <Spinner size="lg" />
              <Content component="p">Loading CSAF document...</Content>
            </CardBody>
          </Card>
        </PageSection>
      )}

      {data && !isLoading && (
        <PageSection>
          <Stack hasGutter>
            <StackItem>
              <Tabs
                activeKey={activeTab}
                onSelect={(_event, tabIndex) =>
                  setActiveTab(tabIndex as number)
                }
              >
                <Tab
                  eventKey={0}
                  title={<TabTitleText>Overview</TabTitleText>}
                />
                <Tab
                  eventKey={1}
                  title={
                    <TabTitleText>
                      Vulnerabilities ({data.vulnerabilities.length})
                    </TabTitleText>
                  }
                />
                <Tab
                  eventKey={2}
                  title={<TabTitleText>Products</TabTitleText>}
                />
              </Tabs>
            </StackItem>

            <StackItem>
              {activeTab === 0 && (
                <TabContent eventKey={0}>
                  <DocumentOverview data={data} />
                </TabContent>
              )}
              {activeTab === 1 && (
                <TabContent eventKey={1}>
                  <VulnerabilitySection
                    vulnerabilities={data.vulnerabilities}
                  />
                </TabContent>
              )}
              {activeTab === 2 && (
                <TabContent eventKey={2}>
                  <ProductsTable data={data} />
                </TabContent>
              )}
            </StackItem>
          </Stack>
        </PageSection>
      )}

      {data && !isLoading && data.document.notes && (
        <PageSection>
          <Card>
            <CardBody>
              <Title headingLevel="h3" size="md">
                Notes
              </Title>
              {data.document.notes.map((note) => (
                <div key={note.title} style={{ marginTop: "var(--pf-v6-global--spacer--sm)" }}>
                  <Content component="p">
                    <strong>{note.title}</strong>
                  </Content>
                  <Content
                    component="p"
                    style={{
                      color: "var(--pf-v6-global--Color--200)",
                      fontSize: "var(--pf-v6-global--FontSize--sm)",
                    }}
                  >
                    {note.text}
                  </Content>
                </div>
              ))}
            </CardBody>
          </Card>
        </PageSection>
      )}
    </>
  );
};
