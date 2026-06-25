import React from "react";

import {
  Button,
  ButtonVariant,
  DropdownItem,
  Label,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import {
  ExpandableRowContent,
  Table,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { ConfirmDialog } from "@app/components/ConfirmDialog";
import { FILTER_TEXT_CATEGORY_KEY } from "@app/Constants";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { KebabDropdown } from "@app/components/KebabDropdown";
import { NotificationsContext } from "@app/components/NotificationsContext";
import { SimplePagination } from "@app/components/SimplePagination";
import { TableHeaderContentWithControls } from "@app/components/TableControls";
import { useLocalTableControls } from "@app/hooks/table-controls";
import {
  beginPolicyEvaluation,
  deletePolicyRunForSbom,
  getPolicyRunsForSbom,
  mockConfiguredPolicies,
  type PolicyRuleResult,
  type PolicyRuleVerdict,
  type SbomPolicyRunView,
} from "@app/mocks/policy-evaluations";
import { RunPolicyEvaluationModal } from "@app/pages/sbom-list/components/RunPolicyEvaluationModal";

import "@app/pages/policy/policy.css";

interface PolicyBySbomProps {
  sbomId: string;
}

type PolicyRunFilterCategoryKey =
  | typeof FILTER_TEXT_CATEGORY_KEY
  | "policy"
  | "result";

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const resultLabel = (result: PolicyRuleVerdict) => {
  if (result === "pass") {
    return <Label color="green">Pass</Label>;
  }
  if (result === "warn") {
    return <Label color="orange">Warn</Label>;
  }
  return <Label color="red">Fail</Label>;
};

const resolvePolicyId = (policyLabel: string) =>
  mockConfiguredPolicies.find(
    (policy) => policy.id === policyLabel || policy.label === policyLabel,
  )?.id ?? policyLabel;

const isRunExpandable = (run: SbomPolicyRunView) =>
  run.status === "complete" && (run.rules?.length ?? 0) > 0;

const PolicyRunRulesTable: React.FC<{ rules: PolicyRuleResult[] }> = ({
  rules,
}) => (
  <Table aria-label="Policy rule results" variant="compact">
    <Thead>
      <Tr>
        <Th>Rule</Th>
        <Th>Result</Th>
        <Th>Details</Th>
      </Tr>
    </Thead>
    <Tbody>
      {rules.map((rule) => (
        <Tr key={rule.rule}>
          <Td dataLabel="Rule" modifier="breakWord">
            <TableText wrapModifier="breakWord">{rule.rule}</TableText>
          </Td>
          <Td dataLabel="Result">{resultLabel(rule.verdict)}</Td>
          <Td dataLabel="Details" modifier="breakWord">
            <TableText wrapModifier="breakWord">{rule.message ?? "—"}</TableText>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const PolicyBySbom: React.FC<PolicyBySbomProps> = ({ sbomId }) => {
  const { pushNotification } = React.useContext(NotificationsContext);
  const [runs, setRuns] = React.useState(() => getPolicyRunsForSbom(sbomId));
  const [isRunPolicyModalOpen, setIsRunPolicyModalOpen] = React.useState(false);
  const [runToDelete, setRunToDelete] =
    React.useState<SbomPolicyRunView | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = React.useState(
    mockConfiguredPolicies[0]?.id ?? "",
  );

  const refreshRuns = React.useCallback(() => {
    setRuns(getPolicyRunsForSbom(sbomId));
  }, [sbomId]);

  React.useEffect(() => {
    refreshRuns();
  }, [refreshRuns]);

  const availablePolicies = React.useMemo(() => {
    const policies = new Set<string>();
    for (const run of runs) {
      policies.add(run.policy);
    }
    return [...policies].sort();
  }, [runs]);

  const filterCategories = React.useMemo(
    () => [
      {
        categoryKey: FILTER_TEXT_CATEGORY_KEY,
        title: "Filter text",
        placeholderText: "Search",
        type: FilterType.search,
        matcher: (filter: string, item: SbomPolicyRunView) => {
          const query = filter.toLowerCase();
          const ruleDetails =
            item.rules
              ?.map((rule) => `${rule.rule} ${rule.message ?? ""}`)
              .join(" ")
              .toLowerCase() ?? "";

          return (
            item.policy.toLowerCase().includes(query) ||
            ruleDetails.includes(query)
          );
        },
      },
      {
        categoryKey: "policy" as const,
        title: "Policy",
        placeholderText: "Policy",
        type: FilterType.multiselect,
        logicOperator: "OR" as const,
        selectOptions: availablePolicies.map((policy) => ({
          value: policy,
          label: policy,
        })),
        matcher: (filter: string, item: SbomPolicyRunView) =>
          item.policy === filter,
      },
      {
        categoryKey: "result" as const,
        title: "Result",
        placeholderText: "Result",
        type: FilterType.multiselect,
        logicOperator: "OR" as const,
        selectOptions: [
          { value: "pass", label: "Pass" },
          { value: "warn", label: "Warn" },
          { value: "fail", label: "Fail" },
          { value: "in_progress", label: "In progress" },
        ],
        matcher: (filter: string, item: SbomPolicyRunView) => {
          if (filter === "in_progress") {
            return item.status === "in_progress";
          }

          return item.status === "complete" && item.outcome === filter;
        },
      },
    ],
    [availablePolicies],
  );

  const tableControls = useLocalTableControls<
    SbomPolicyRunView,
    "started" | "policy" | "result" | "duration",
    never,
    PolicyRunFilterCategoryKey
  >({
    tableName: "policy-runs-table",
    idProperty: "runId",
    items: runs,
    columnNames: {
      started: "Started",
      policy: "Policy",
      result: "Result",
      duration: "Duration",
    },
    isFilterEnabled: true,
    filterCategories,
    isPaginationEnabled: true,
    isSortEnabled: false,
    hasActionsColumn: true,
    isExpansionEnabled: true,
    expandableVariant: "single",
  });

  const {
    currentPageItems,
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
      getSingleExpandButtonTdProps,
      getExpandedContentTdProps,
    },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  const handleRunPolicyEvaluation = () => {
    if (!selectedPolicyId) {
      return;
    }

    beginPolicyEvaluation({
      sbomIds: [sbomId],
      policy: selectedPolicyId,
      requestId: crypto.randomUUID(),
    });

    setIsRunPolicyModalOpen(false);
    refreshRuns();
  };

  const openRunPolicyModal = () => {
    setSelectedPolicyId(mockConfiguredPolicies[0]?.id ?? "");
    setIsRunPolicyModalOpen(true);
  };

  const handleRerunPolicyEvaluation = (run: SbomPolicyRunView) => {
    const policyId = resolvePolicyId(run.policy);

    beginPolicyEvaluation({
      sbomIds: [sbomId],
      policy: policyId,
      requestId: crypto.randomUUID(),
    });

    refreshRuns();
    pushNotification({
      title: `Re-running ${run.policy}`,
      variant: "success",
    });
  };

  const handleDeleteRun = () => {
    if (!runToDelete) {
      return;
    }

    deletePolicyRunForSbom(sbomId, runToDelete.runId);
    setRunToDelete(null);
    refreshRuns();
    pushNotification({
      title: "Policy evaluation run deleted",
      variant: "success",
    });
  };

  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Toolbar
            {...toolbarProps}
            aria-label="Policy evaluation runs toolbar"
          >
            <ToolbarContent>
              <FilterToolbar {...filterToolbarProps} />
              <ToolbarItem>
                <Button variant="primary" onClick={openRunPolicyModal}>
                  Run policy evaluation
                </Button>
              </ToolbarItem>
              <ToolbarItem {...paginationToolbarItemProps}>
                <SimplePagination
                  idPrefix="policy-runs-table"
                  isTop
                  paginationProps={paginationProps}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </StackItem>

        <StackItem>
          <Table
            {...tableProps}
            aria-label="Policy evaluation runs for SBOM"
          >
            <Thead>
              <Tr>
                <TableHeaderContentWithControls {...tableControls}>
                  <Th {...getThProps({ columnKey: "started" })} />
                  <Th {...getThProps({ columnKey: "policy" })} />
                  <Th {...getThProps({ columnKey: "result" })} />
                  <Th {...getThProps({ columnKey: "duration" })} />
                </TableHeaderContentWithControls>
              </Tr>
            </Thead>
            {currentPageItems?.map((run, rowIndex) => {
              const expandable = isRunExpandable(run);

              return (
                <Tbody key={run.runId} isExpanded={isCellExpanded(run)}>
                  <Tr {...getTrProps({ item: run })}>
                    {expandable ? (
                      <Td
                        {...getSingleExpandButtonTdProps({
                          item: run,
                          rowIndex,
                        })}
                      />
                    ) : (
                      <Td />
                    )}
                    <Td
                      dataLabel="Started"
                      {...getTdProps({ columnKey: "started" })}
                    >
                      {formatShortDate(run.started)}
                    </Td>
                    <Td
                      dataLabel="Policy"
                      modifier="breakWord"
                      {...getTdProps({ columnKey: "policy" })}
                    >
                      <TableText wrapModifier="breakWord">
                        {run.policy}
                      </TableText>
                    </Td>
                    <Td
                      dataLabel="Result"
                      {...getTdProps({ columnKey: "result" })}
                    >
                      {run.status === "in_progress" || !run.outcome
                        ? "—"
                        : resultLabel(run.outcome)}
                    </Td>
                    <Td
                      dataLabel="Duration"
                      {...getTdProps({ columnKey: "duration" })}
                    >
                      {run.status === "in_progress" ? (
                        <Label
                          color="grey"
                          className="policy-run-in-progress-label"
                          icon={
                            <Spinner
                              isInline
                              aria-label="Evaluation in progress"
                            />
                          }
                          variant="outline"
                        >
                          In progress
                        </Label>
                      ) : (
                        run.duration
                      )}
                    </Td>
                    <Td isActionCell>
                      <KebabDropdown
                        ariaLabel="Policy evaluation run actions"
                        dropdownItems={[
                          <DropdownItem
                            key="rerun"
                            onClick={() => handleRerunPolicyEvaluation(run)}
                          >
                            Re-run
                          </DropdownItem>,
                          <DropdownItem
                            key="delete"
                            onClick={() => setRunToDelete(run)}
                          >
                            Delete
                          </DropdownItem>,
                        ]}
                      />
                    </Td>
                  </Tr>
                  {expandable && isCellExpanded(run) ? (
                    <Tr isExpanded>
                      <Td {...getExpandedContentTdProps({ item: run })}>
                        <div className={spacing.mMd}>
                          <ExpandableRowContent>
                            <PolicyRunRulesTable rules={run.rules ?? []} />
                          </ExpandableRowContent>
                        </div>
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              );
            })}
          </Table>
        </StackItem>
      </Stack>

      <RunPolicyEvaluationModal
        introText="Evaluate this SBOM against a policy."
        isOpen={isRunPolicyModalOpen}
        selectedPolicyId={selectedPolicyId}
        onClose={() => setIsRunPolicyModalOpen(false)}
        onPolicyChange={setSelectedPolicyId}
        onConfirm={handleRunPolicyEvaluation}
      />

      <ConfirmDialog
        cancelBtnLabel="Cancel"
        confirmBtnLabel="Delete"
        confirmBtnVariant={ButtonVariant.danger}
        isOpen={runToDelete !== null}
        message={
          runToDelete
            ? `Delete the ${runToDelete.policy} evaluation run from ${formatShortDate(runToDelete.started)}? This cannot be undone.`
            : ""
        }
        title="Delete policy evaluation run"
        titleIconVariant="warning"
        onCancel={() => setRunToDelete(null)}
        onClose={() => setRunToDelete(null)}
        onConfirm={handleDeleteRun}
      />
    </PageSection>
  );
};
