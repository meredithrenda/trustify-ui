import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Label,
  MenuToggle,
  type MenuToggleElement,
  PageSection,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarToggleGroup,
  type ToolbarLabel,
} from "@patternfly/react-core";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";
import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";
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
import {
  beginPolicyEvaluationFromNavigation,
  getPortfolioPolicyPosture,
  listInProgressPolicyRuns,
  mockPolicyEvaluationRuns,
  type InProgressPolicyEvaluationRun,
  type PendingPolicyEvaluationRequest,
  type PolicyEvaluationOutcome,
} from "@app/mocks/policy-evaluations";
import { getSbomFilteredByPolicyRunUrl } from "@app/pages/sbom-list/helpers";

import "./policy.css";

type PolicyDetailTabKey = "sources" | "runs";

type PolicyPortfolioRunStatus = "complete" | "in_progress";

interface PolicyPortfolioRunView {
  runId: string;
  started: string;
  policy: string;
  evaluated: number;
  pass?: number;
  warn?: number;
  fail?: number;
  status: PolicyPortfolioRunStatus;
}

/** External destinations for policy sources (outside Trusted Profile Analyzer). */
const POLICY_EXTERNAL_LINKS = [
  {
    label: "View policies in Conforma",
    description:
      "Open Conforma documentation for OPA policy bundles, collections, and evaluation configuration.",
    href: "https://conforma.dev/docs/policy-as-code/",
  },
  {
    label: "Enterprise Contract policy configuration",
    description:
      "Open Enterprise Contract documentation for release and build policy sources in Git.",
    href: "https://enterprisecontract.dev/docs/ec-cli/policy_configuration/",
  },
];

const MOCK_EVALUATIONS = mockPolicyEvaluationRuns;

const PolicyRunStatusLabel: React.FC<{ isInProgress: boolean }> = ({
  isInProgress,
}) => {
  if (isInProgress) {
    return (
      <Label
        color="grey"
        className="policy-run-in-progress-label"
        icon={
          <Spinner isInline aria-label="Evaluation in progress" />
        }
        variant="outline"
      >
        In progress
      </Label>
    );
  }

  return (
    <Label color="green" variant="filled">
      Completed
    </Label>
  );
};

const PolicyRunCountLink: React.FC<{
  runId: string;
  count: number;
  outcome?: PolicyEvaluationOutcome;
  unitLabel?: string;
}> = ({ runId, count, outcome, unitLabel }) => {
  const text = unitLabel ? `${count} ${unitLabel}` : String(count);

  if (count <= 0) {
    return text;
  }

  return <Link to={getSbomFilteredByPolicyRunUrl(runId, outcome)}>{text}</Link>;
};

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const tabContentId = (key: PolicyDetailTabKey) => `policy-detail-${key}`;

type PolicyLocationState = {
  pendingPolicyEvaluation?: PendingPolicyEvaluationRequest;
};

export const Policy: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDetailTab, setActiveDetailTab] =
    React.useState<PolicyDetailTabKey>("runs");
  const [inProgressRuns, setInProgressRuns] = React.useState<
    InProgressPolicyEvaluationRun[]
  >([]);
  const [selectedPolicies, setSelectedPolicies] = React.useState<string[]>([]);
  const [isPolicyFilterOpen, setIsPolicyFilterOpen] = React.useState(false);
  const portfolioPosture = React.useMemo(
    () => getPortfolioPolicyPosture(),
    [inProgressRuns],
  );

  const evaluationRuns = React.useMemo<PolicyPortfolioRunView[]>(() => {
    const inProgressRows: PolicyPortfolioRunView[] = inProgressRuns.map(
      (run) => ({
        runId: run.runId,
        started: run.started,
        policy: run.policy,
        evaluated: run.evaluated,
        status: "in_progress",
      }),
    );
    const completedRows: PolicyPortfolioRunView[] = MOCK_EVALUATIONS.map(
      (run) => ({
        runId: run.runId,
        started: run.started,
        policy: run.policy,
        evaluated: run.evaluated,
        pass: run.pass,
        warn: run.warn,
        fail: run.fail,
        status: "complete",
      }),
    );

    return [...inProgressRows, ...completedRows];
  }, [inProgressRuns]);

  const availablePolicies = React.useMemo(() => {
    const policies = new Set<string>();
    for (const run of evaluationRuns) {
      policies.add(run.policy);
    }
    return [...policies].sort();
  }, [evaluationRuns]);

  const filteredEvaluationRuns = React.useMemo(
    () =>
      selectedPolicies.length === 0
        ? evaluationRuns
        : evaluationRuns.filter((run) =>
            selectedPolicies.includes(run.policy),
          ),
    [evaluationRuns, selectedPolicies],
  );

  const onPolicyFilterSelect = (value: string) => {
    setSelectedPolicies((currentPolicies) =>
      currentPolicies.includes(value)
        ? currentPolicies.filter((policy) => policy !== value)
        : [...currentPolicies, value],
    );
  };

  const onPolicyFilterChipRemove = (chip: string | ToolbarLabel) => {
    const value = typeof chip === "string" ? chip : chip.key;
    if (!value) {
      return;
    }

    setSelectedPolicies((currentPolicies) =>
      currentPolicies.filter((policy) => policy !== value),
    );
  };

  React.useEffect(() => {
    const pendingPolicyEvaluation = (
      location.state as PolicyLocationState | null
    )?.pendingPolicyEvaluation;

    if (
      !pendingPolicyEvaluation?.sbomIds.length ||
      !pendingPolicyEvaluation.policy
    ) {
      return;
    }

    const run = beginPolicyEvaluationFromNavigation(pendingPolicyEvaluation);

    setInProgressRuns((currentRuns) =>
      currentRuns.some((row) => row.runId === run.runId)
        ? currentRuns
        : [run, ...currentRuns],
    );
    setActiveDetailTab("runs");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  React.useEffect(() => {
    setInProgressRuns(listInProgressPolicyRuns());
  }, []);

  return (
    <>
      <DocumentMetadata title="Policies" />
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content component="h1">Policies</Content>
              <Content component="p">
                See how your portfolio performed in recent policy evaluation
                runs. Policy sources and rule definitions are maintained outside
                Trusted Profile Analyzer.
              </Content>
            </Content>
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Compliant</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {portfolioPosture.compliantPct}%
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
                  {portfolioPosture.evaluatedSboms}
                </Title>
                <Content component="small">Evaluated SBOMs</Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Warnings</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {portfolioPosture.withWarnings}
                </Title>
                <Content component="small">SBOMs with rule warnings</Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={6} md={4} lg={2}>
            <Card isFullHeight>
              <CardTitle>Non-compliant</CardTitle>
              <CardBody>
                <Title headingLevel="h4" size="2xl">
                  {portfolioPosture.nonCompliant}
                </Title>
                <Content component="small">SBOMs with blocking rule failures</Content>
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
            eventKey="runs"
            title={<TabTitleText>Evaluation runs</TabTitleText>}
            tabContentId={tabContentId("runs")}
          />
          <Tab
            eventKey="sources"
            title={<TabTitleText>Policy sources</TabTitleText>}
            tabContentId={tabContentId("sources")}
          />
        </Tabs>
      </PageSection>

      <PageSection>
        <TabContent
          id={tabContentId("runs")}
          eventKey="runs"
          hidden={activeDetailTab !== "runs"}
          aria-label="Recent policy evaluations"
        >
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                Policy evaluations checking SBOMs against a configured policy and
                reporting pass, warn, or fail results. Select a value to open a
                filtered SBOM list.
              </Content>
            </StackItem>
            <StackItem>
              <Toolbar
                aria-label="Evaluation runs filters"
                clearAllFilters={() => setSelectedPolicies([])}
                clearFiltersButtonText="Clear all filters"
                collapseListedFiltersBreakpoint="xl"
              >
                <ToolbarContent>
                  <ToolbarToggleGroup
                    breakpoint="xl"
                    toggleIcon={<FilterIcon />}
                    variant="filter-group"
                  >
                    <ToolbarFilter
                      categoryName="Policy"
                      deleteLabel={(_category, label) =>
                        onPolicyFilterChipRemove(label)
                      }
                      deleteLabelGroup={() => setSelectedPolicies([])}
                      labels={selectedPolicies}
                    >
                      <Select
                        aria-label="Policy filter"
                        isOpen={isPolicyFilterOpen}
                        onOpenChange={setIsPolicyFilterOpen}
                        onSelect={(_event, value) => {
                          onPolicyFilterSelect(String(value));
                        }}
                        popperProps={{ placement: "bottom-start" }}
                        selected={selectedPolicies}
                        shouldFocusToggleOnSelect={false}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            aria-label="Policy filter"
                            icon={<FilterIcon aria-hidden />}
                            isExpanded={isPolicyFilterOpen}
                            onClick={() =>
                              setIsPolicyFilterOpen((open) => !open)
                            }
                            {...(selectedPolicies.length > 0 && {
                              badge: selectedPolicies.length,
                            })}
                          >
                            Policy
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          {availablePolicies.map((policy) => (
                            <SelectOption
                              key={policy}
                              hasCheckbox
                              isSelected={selectedPolicies.includes(policy)}
                              value={policy}
                            >
                              {policy}
                            </SelectOption>
                          ))}
                        </SelectList>
                      </Select>
                    </ToolbarFilter>
                  </ToolbarToggleGroup>
                </ToolbarContent>
              </Toolbar>
            </StackItem>
            <StackItem>
              <Table aria-label="Recent policy evaluations">
                <Thead>
                  <Tr>
                    <Th>Started</Th>
                    <Th>Policy</Th>
                    <Th>Total SBOMs</Th>
                    <Th>Pass</Th>
                    <Th>Warn</Th>
                    <Th>Fail</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredEvaluationRuns.map((row) => (
                    <Tr key={row.runId}>
                      <Td dataLabel="Started">
                        {formatShortDate(row.started)}
                      </Td>
                      <Td dataLabel="Policy" modifier="breakWord">
                        <TableText wrapModifier="breakWord">
                          {row.policy}
                        </TableText>
                      </Td>
                      <Td dataLabel="Total SBOMs">
                        <PolicyRunCountLink
                          count={row.evaluated}
                          runId={row.runId}
                          unitLabel="SBOMs"
                        />
                      </Td>
                      {row.status === "in_progress" ? (
                        <>
                          <Td dataLabel="Pass">—</Td>
                          <Td dataLabel="Warn">—</Td>
                          <Td dataLabel="Fail">—</Td>
                          <Td dataLabel="Status">
                            <PolicyRunStatusLabel isInProgress />
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td dataLabel="Pass">
                            <PolicyRunCountLink
                              count={row.pass ?? 0}
                              outcome="pass"
                              runId={row.runId}
                              unitLabel="SBOMs"
                            />
                          </Td>
                          <Td dataLabel="Warn">
                            <PolicyRunCountLink
                              count={row.warn ?? 0}
                              outcome="warn"
                              runId={row.runId}
                              unitLabel="SBOMs"
                            />
                          </Td>
                          <Td dataLabel="Fail">
                            <PolicyRunCountLink
                              count={row.fail ?? 0}
                              outcome="fail"
                              runId={row.runId}
                              unitLabel="SBOMs"
                            />
                          </Td>
                          <Td dataLabel="Status">
                            <PolicyRunStatusLabel isInProgress={false} />
                          </Td>
                        </>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </TabContent>

        <TabContent
          id={tabContentId("sources")}
          eventKey="sources"
          hidden={activeDetailTab !== "sources"}
          aria-label="External policy sources"
        >
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                Policy sources are not stored or edited in Trusted Profile
                Analyzer. Use the links below to open your policy platforms
                outside this application.
              </Content>
            </StackItem>
            <StackItem>
              <Stack hasGutter>
                {POLICY_EXTERNAL_LINKS.map((link) => (
                  <StackItem key={link.href}>
                    <div className="policy-external-link-item">
                      <a
                        className="policy-external-link"
                        href={link.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span>{link.label}</span>
                        <ExternalLinkAltIcon
                          aria-hidden
                          className="policy-external-link__icon"
                        />
                      </a>
                      <Content
                        className="policy-external-link-item__description"
                        component="small"
                      >
                        {link.description}
                      </Content>
                    </div>
                  </StackItem>
                ))}
              </Stack>
            </StackItem>
          </Stack>
        </TabContent>
      </PageSection>
    </>
  );
};
