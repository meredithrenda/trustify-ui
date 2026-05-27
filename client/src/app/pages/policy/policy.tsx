import React from "react";
import { generatePath, Link } from "react-router-dom";

import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Label,
  PageSection,
  Stack,
  StackItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
  Title,
} from "@patternfly/react-core";
import {
  Table,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { Paths } from "@app/Routes";

type PolicyDetailTabKey = "bundles" | "runs" | "failures" | "ingest";

/** Illustrative portfolio data for layout and narrative review; not from live policy APIs. */
const MOCK_POSTURE = {
  compliantPct: 72,
  evaluatedSboms: 184,
  withWarnings: 31,
  nonCompliant: 19,
  notEvaluated: 12,
};

const MOCK_POLICY_BUNDLES = [
  {
    name: "org-release-minimal",
    description: "Release attestation + SBOM + SLSA baseline",
    collections: "minimal",
    sources: "git::policy.example.com/conforma//release?ref=v1.4.0",
    lastUpdated: "2026-05-12T14:00:00Z",
    status: "Active",
  },
  {
    name: "github-federated-builds",
    description: "GitHub workflow certificate and trigger checks",
    collections: "github",
    sources: "git::policy.example.com/conforma//github?ref=v1.2.1",
    lastUpdated: "2026-05-01T09:30:00Z",
    status: "Active",
  },
  {
    name: "cra-readiness-bundle",
    description: "CRA-oriented rule pack (prototype)",
    collections: "minimal, policy_data",
    sources: "git::policy.example.com/cra//bundle?ref=2026-Q2",
    lastUpdated: "2026-04-18T11:15:00Z",
    status: "Draft",
  },
];

const MOCK_EVALUATIONS = [
  {
    started: "2026-05-13T02:00:00Z",
    scope: "Full inventory",
    policyRevision: "org-release-minimal@v1.4.0",
    evaluated: 184,
    pass: 132,
    warn: 31,
    fail: 19,
    duration: "18m 42s",
  },
  {
    started: "2026-05-12T02:00:00Z",
    scope: "Full inventory",
    policyRevision: "org-release-minimal@v1.4.0",
    evaluated: 182,
    pass: 128,
    warn: 35,
    fail: 19,
    duration: "17m 05s",
  },
  {
    started: "2026-05-11T18:22:00Z",
    scope: "Product: RHEL 9 family",
    policyRevision: "org-release-minimal@v1.3.9",
    evaluated: 42,
    pass: 38,
    warn: 3,
    fail: 1,
    duration: "4m 11s",
  },
];

const MOCK_TOP_RULES = [
  {
    family: "SLSA provenance & materials",
    blocking: 11,
    warnings: 6,
    example: "slsa_source_correlated__expected_source_code_reference",
  },
  {
    family: "CVE policy (release)",
    blocking: 8,
    warnings: 14,
    example: "cve__unpatched_cve_blockers",
  },
  {
    family: "CycloneDX SBOM validity",
    blocking: 5,
    warnings: 3,
    example: "sbom_cyclonedx__valid_cdx_1_5",
  },
  {
    family: "Base image registry",
    blocking: 4,
    warnings: 2,
    example: "base_image_registries__base_image_permitted",
  },
  {
    family: "Attestation type",
    blocking: 2,
    warnings: 9,
    example: "attestation_type__pipelinerun_attestation_found",
  },
];

const MOCK_WORST_PRODUCTS = [
  {
    product: "Red Hat Enterprise Linux 9.4",
    blockingFailures: 6,
    lastEval: "2026-05-13T02:00:00Z",
    sbomId: "a1b2c3d4-0001-4000-8000-000000000001",
  },
  {
    product: "OpenShift Container Platform 4.16",
    blockingFailures: 5,
    lastEval: "2026-05-13T02:00:00Z",
    sbomId: "a1b2c3d4-0002-4000-8000-000000000002",
  },
  {
    product: "quarkus-bom",
    blockingFailures: 3,
    lastEval: "2026-05-13T02:00:00Z",
    sbomId: "a1b2c3d4-0003-4000-8000-000000000003",
  },
];

const MOCK_INGEST_OUTCOMES = [
  {
    time: "2026-05-13T16:40:00Z",
    sbomName: "customer-portal-sbom",
    outcome: "Accepted",
    reason: "All blocking rules passed",
  },
  {
    time: "2026-05-13T16:12:00Z",
    sbomName: "legacy-service-2025Q4",
    outcome: "Flagged",
    reason: "sbom_cyclonedx: schema warnings (non-blocking)",
  },
  {
    time: "2026-05-13T15:55:00Z",
    sbomName: "unsigned-artifact-bundle",
    outcome: "Rejected",
    reason: "Attestation signature verification failed",
  },
];

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const outcomeLabel = (outcome: string) => {
  switch (outcome) {
    case "Accepted":
      return <Label color="green">{outcome}</Label>;
    case "Flagged":
      return <Label color="orange">{outcome}</Label>;
    case "Rejected":
      return <Label color="red">{outcome}</Label>;
    default:
      return <Label>{outcome}</Label>;
  }
};

const bundleStatusLabel = (status: string) =>
  status === "Active" ? (
    <Label color="green">{status}</Label>
  ) : (
    <Label color="grey">{status}</Label>
  );

const tabContentId = (key: PolicyDetailTabKey) => `policy-detail-${key}`;

export const Policy: React.FC = () => {
  const p = MOCK_POSTURE;
  const [activeDetailTab, setActiveDetailTab] =
    React.useState<PolicyDetailTabKey>("bundles");

  return (
    <>
      <DocumentMetadata title="Policy" />
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content component="h1">Policy</Content>
              <Content component="p">
                Reduce release risk by seeing where your portfolio meets policy,
                which bundles and rules fail most often, and how ingest checks
                handled recent SBOMs.
              </Content>
            </Content>
          </StackItem>
          <StackItem>
            <Alert isInline variant="info" title="Prototype data">
              Numbers and tables below are static placeholders for layout and
              narrative review. They do not call Conforma or Trustify policy
              APIs yet.
            </Alert>
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection>
        <Title headingLevel="h2" size="lg">
          Portfolio summary
        </Title>
        <Content component="p" className="pf-v-u-mb-md-on-md">
          Distinct from raw vulnerability counts: overall policy verdicts once
          inventory evaluation is wired.
        </Content>
        <Grid hasGutter>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Compliant</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {p.compliantPct}%
                </Title>
                <Content component="small">
                  SBOMs passing all blocking rules
                </Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Evaluated</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {p.evaluatedSboms}
                </Title>
                <Content component="small">In last full run</Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Warnings</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {p.withWarnings}
                </Title>
                <Content component="small">Passed with rule warnings</Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Non-compliant</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {p.nonCompliant}
                </Title>
                <Content component="small">Blocking rule failures</Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Not evaluated</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {p.notEvaluated}
                </Title>
                <Content component="small">Pending or out of scope</Content>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      <PageSection>
        <Tabs
          activeKey={activeDetailTab}
          onSelect={(_event, tabKey) => {
            setActiveDetailTab(tabKey as PolicyDetailTabKey);
          }}
          aria-label="Policy portfolio details"
          role="region"
        >
          <Tab
            eventKey="bundles"
            title={<TabTitleText>Policy bundles</TabTitleText>}
            tabContentId={tabContentId("bundles")}
          />
          <Tab
            eventKey="runs"
            title={<TabTitleText>Evaluation runs</TabTitleText>}
            tabContentId={tabContentId("runs")}
          />
          <Tab
            eventKey="failures"
            title={<TabTitleText>Failures and impact</TabTitleText>}
            tabContentId={tabContentId("failures")}
          />
          <Tab
            eventKey="ingest"
            title={<TabTitleText>Ingest outcomes</TabTitleText>}
            tabContentId={tabContentId("ingest")}
          />
        </Tabs>
      </PageSection>

      <PageSection>
        <TabContent
          id={tabContentId("bundles")}
          eventKey="bundles"
          hidden={activeDetailTab !== "bundles"}
          aria-label="Policy bundles in use"
        >
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                Named bundles, rule collections, and Git (or CR) sources—aligned
                with how Conforma / Enterprise Contract policies are defined.
              </Content>
            </StackItem>
            <StackItem>
              <Table aria-label="Policy bundles" variant="compact">
                <Thead>
                  <Tr>
                    <Th modifier="wrap">Name</Th>
                    <Th modifier="wrap">Description</Th>
                    <Th modifier="wrap">Collections</Th>
                    <Th modifier="wrap">Sources</Th>
                    <Th modifier="wrap">Last updated</Th>
                    <Th modifier="wrap">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {MOCK_POLICY_BUNDLES.map((row) => (
                    <Tr key={row.name}>
                      <Td dataLabel="Name" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.name}
                        </TableText>
                      </Td>
                      <Td dataLabel="Description" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.description}
                        </TableText>
                      </Td>
                      <Td dataLabel="Collections" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.collections}
                        </TableText>
                      </Td>
                      <Td dataLabel="Sources" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.sources}
                        </TableText>
                      </Td>
                      <Td dataLabel="Last updated">
                        {formatShortDate(row.lastUpdated)}
                      </Td>
                      <Td dataLabel="Status">
                        {bundleStatusLabel(row.status)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </TabContent>

        <TabContent
          id={tabContentId("runs")}
          eventKey="runs"
          hidden={activeDetailTab !== "runs"}
          aria-label="Recent policy evaluations"
        >
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                Scheduled or triggered inventory runs (analogous to pipeline
                stages: signature, attestation, policy conformance).
              </Content>
            </StackItem>
            <StackItem>
              <Table aria-label="Recent policy evaluations" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Started</Th>
                    <Th>Scope</Th>
                    <Th>Policy revision</Th>
                    <Th>SBOMs</Th>
                    <Th>Pass</Th>
                    <Th>Warn</Th>
                    <Th>Fail</Th>
                    <Th>Duration</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {MOCK_EVALUATIONS.map((row) => (
                    <Tr key={`${row.started}-${row.scope}`}>
                      <Td dataLabel="Started">
                        {formatShortDate(row.started)}
                      </Td>
                      <Td dataLabel="Scope" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.scope}
                        </TableText>
                      </Td>
                      <Td dataLabel="Policy revision" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.policyRevision}
                        </TableText>
                      </Td>
                      <Td dataLabel="SBOMs">{row.evaluated}</Td>
                      <Td dataLabel="Pass">{row.pass}</Td>
                      <Td dataLabel="Warn">{row.warn}</Td>
                      <Td dataLabel="Fail">{row.fail}</Td>
                      <Td dataLabel="Duration">{row.duration}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </TabContent>

        <TabContent
          id={tabContentId("failures")}
          eventKey="failures"
          hidden={activeDetailTab !== "failures"}
          aria-label="Policy failures and product impact"
        >
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h3" size="md">
                Top failing rule families
              </Title>
              <Content component="p">
                Grouped like Conforma release policy packages (attestation,
                SBOM, SLSA, CVE, base image, tasks).
              </Content>
              <Table aria-label="Top failing rule families" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Rule family</Th>
                    <Th>Blocking</Th>
                    <Th>Warnings</Th>
                    <Th>Example rule code</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {MOCK_TOP_RULES.map((row) => (
                    <Tr key={row.family}>
                      <Td dataLabel="Rule family" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.family}
                        </TableText>
                      </Td>
                      <Td dataLabel="Blocking">{row.blocking}</Td>
                      <Td dataLabel="Warnings">{row.warnings}</Td>
                      <Td dataLabel="Example rule code" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.example}
                        </TableText>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
            <StackItem>
              <Title headingLevel="h3" size="md">
                Most affected products
              </Title>
              <Content component="p">
                Where blocking failures concentrate before drill-down to SBOMs.
              </Content>
              <Table aria-label="Most affected products" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Blocking failures</Th>
                    <Th>Last evaluation</Th>
                    <Th>SBOM</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {MOCK_WORST_PRODUCTS.map((row) => (
                    <Tr key={row.product}>
                      <Td dataLabel="Product" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.product}
                        </TableText>
                      </Td>
                      <Td dataLabel="Blocking failures">
                        {row.blockingFailures}
                      </Td>
                      <Td dataLabel="Last evaluation">
                        {formatShortDate(row.lastEval)}
                      </Td>
                      <Td dataLabel="SBOM">
                        <Link
                          to={generatePath(Paths.sbomDetails, {
                            sbomId: row.sbomId,
                          })}
                        >
                          Open SBOM
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </TabContent>

        <TabContent
          id={tabContentId("ingest")}
          eventKey="ingest"
          hidden={activeDetailTab !== "ingest"}
          aria-label="Recent ingest policy outcomes"
        >
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                SBOM quality gate at ingestion: accept, flag, or reject before
                the document joins the inventory graph.
              </Content>
            </StackItem>
            <StackItem>
              <Table
                aria-label="Recent ingest policy outcomes"
                variant="compact"
              >
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>SBOM</Th>
                    <Th>Outcome</Th>
                    <Th>Reason</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {MOCK_INGEST_OUTCOMES.map((row) => (
                    <Tr key={`${row.time}-${row.sbomName}`}>
                      <Td dataLabel="Time">{formatShortDate(row.time)}</Td>
                      <Td dataLabel="SBOM" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.sbomName}
                        </TableText>
                      </Td>
                      <Td dataLabel="Outcome">{outcomeLabel(row.outcome)}</Td>
                      <Td dataLabel="Reason" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.reason}
                        </TableText>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </TabContent>
      </PageSection>
    </>
  );
};
