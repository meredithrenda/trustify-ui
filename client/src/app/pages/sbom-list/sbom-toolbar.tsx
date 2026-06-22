import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";

import { FilterToolbar } from "@app/components/FilterToolbar";
import { KebabDropdown } from "@app/components/KebabDropdown";
import { SimplePagination } from "@app/components/SimplePagination";
import { ToolbarBulkSelector } from "@app/components/ToolbarBulkSelector";
import {
  mockConfiguredPolicies,
  type PendingPolicyEvaluationRequest,
} from "@app/mocks/policy-evaluations";
import { Paths } from "@app/Routes";

import { RunPolicyEvaluationModal } from "./components/RunPolicyEvaluationModal";
import { SbomSearchContext } from "./sbom-context";

interface SbomToolbarProps {
  showFilters?: boolean;
  showActions?: boolean;
}

export const SbomToolbar: React.FC<SbomToolbarProps> = ({
  showFilters,
  showActions,
}) => {
  const navigate = useNavigate();
  const [isBulkActionsOpen, setIsBulkActionsOpen] = React.useState(false);
  const [isRunPolicyModalOpen, setIsRunPolicyModalOpen] = React.useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = React.useState(
    mockConfiguredPolicies[0]?.id ?? "",
  );

  const {
    tableControls,
    bulkSelection: {
      isEnabled: showBulkSelector,
      controls: bulkSelectionControls,
    },
  } = React.useContext(SbomSearchContext);

  const {
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
    },
  } = tableControls;

  const {
    selectedItems,
    propHelpers: { toolbarBulkSelectorProps },
  } = bulkSelectionControls;

  const hasSelectedSboms = selectedItems.length > 0;

  const handleRunPolicyEvaluation = () => {
    if (!selectedPolicyId) {
      return;
    }

    const pendingPolicyEvaluation: PendingPolicyEvaluationRequest = {
      sbomIds: selectedItems.map((sbom) => sbom.id),
      policy: selectedPolicyId,
      requestId: crypto.randomUUID(),
    };

    setIsRunPolicyModalOpen(false);
    navigate(Paths.policy, { state: { pendingPolicyEvaluation } });
  };

  const openRunPolicyModal = () => {
    setSelectedPolicyId(mockConfiguredPolicies[0]?.id ?? "");
    setIsRunPolicyModalOpen(true);
  };

  return (
    <>
      <Toolbar {...toolbarProps} aria-label="sbom-toolbar">
        <ToolbarContent>
          {showBulkSelector && (
            <ToolbarGroup align={{ default: "alignStart" }}>
              <ToolbarBulkSelector {...toolbarBulkSelectorProps} />
              {hasSelectedSboms && (
                <ToolbarItem>
                  <Dropdown
                    isOpen={isBulkActionsOpen}
                    onOpenChange={setIsBulkActionsOpen}
                    popperProps={{ position: "right" }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        isExpanded={isBulkActionsOpen}
                        onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                        variant="secondary"
                      >
                        Actions
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="add-to-group"
                        component="button"
                        onClick={() => setIsBulkActionsOpen(false)}
                      >
                        Add to group
                      </DropdownItem>
                      <DropdownItem
                        key="run-policy-evaluation"
                        component="button"
                        onClick={() => {
                          setIsBulkActionsOpen(false);
                          openRunPolicyModal();
                        }}
                      >
                        Run policy evaluation
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
              )}
            </ToolbarGroup>
          )}
          {showFilters && <FilterToolbar {...filterToolbarProps} />}
          {showActions && (
            <ToolbarGroup variant="action-group-plain">
              <ToolbarItem>
                <Button variant="primary">Create group</Button>
              </ToolbarItem>
              <ToolbarItem>
                <KebabDropdown
                  ariaLabel="SBOM actions"
                  dropdownItems={[
                    <DropdownItem
                      key="upload-sbom"
                      component="button"
                      onClick={() => navigate(Paths.sbomUpload)}
                    >
                      Upload SBOM
                    </DropdownItem>,
                    <DropdownItem
                      key="scan-sbom"
                      component="button"
                      onClick={() => navigate(Paths.sbomScan)}
                    >
                      Generate vulnerability report
                    </DropdownItem>,
                  ]}
                />
              </ToolbarItem>
            </ToolbarGroup>
          )}
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="sbom-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <RunPolicyEvaluationModal
        isOpen={isRunPolicyModalOpen}
        selectedPolicyId={selectedPolicyId}
        onClose={() => setIsRunPolicyModalOpen(false)}
        onPolicyChange={setSelectedPolicyId}
        onConfirm={handleRunPolicyEvaluation}
      />
    </>
  );
};
