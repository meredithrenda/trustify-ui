import React from "react";

import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownList,
  Label,
  LabelGroup,
  MenuToggle,
  type MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip,
} from "@patternfly/react-core";
import {
  CopyIcon,
  EllipsisVIcon,
  FilterIcon,
} from "@patternfly/react-icons";

import {
  SimplePagination,
  type PaginationStateProps,
} from "@app/components/SimplePagination";

import {
  PACKAGE_SEARCH_TYPE_OPTIONS,
  PACKAGE_TYPE_OPTIONS,
  type PackageSearchType,
  type PackageTypeOption,
} from "./constants";

interface NewProposalToolbarProps {
  searchType: PackageSearchType;
  searchValue: string;
  isExactMatch: boolean;
  isLatestOnly: boolean;
  selectedPackageTypes: PackageTypeOption[];
  mustMatchRegex: string;
  mustNotMatchRegex: string;
  appliedBulkPurls: string;
  resultCount: number;
  curlCopied: boolean;
  onSearchTypeChange: (value: PackageSearchType) => void;
  onSearchValueChange: (value: string) => void;
  onExactMatchChange: (checked: boolean) => void;
  onLatestOnlyChange: (isLatestOnly: boolean) => void;
  onPackageTypesChange: (types: PackageTypeOption[]) => void;
  onMustMatchRegexChange: (value: string) => void;
  onMustNotMatchRegexChange: (value: string) => void;
  onClearBulkPurls: () => void;
  onClearAllFilters: () => void;
  onOpenAdvancedFilters: () => void;
  onCopyCurl: () => void;
  paginationProps: PaginationStateProps;
}

export const NewProposalToolbar: React.FC<NewProposalToolbarProps> = ({
  searchType,
  searchValue,
  isExactMatch,
  isLatestOnly,
  selectedPackageTypes,
  mustMatchRegex,
  mustNotMatchRegex,
  appliedBulkPurls,
  resultCount,
  curlCopied,
  onSearchTypeChange,
  onSearchValueChange,
  onExactMatchChange,
  onLatestOnlyChange,
  onPackageTypesChange,
  onMustMatchRegexChange,
  onMustNotMatchRegexChange,
  onClearBulkPurls,
  onClearAllFilters,
  onOpenAdvancedFilters,
  onCopyCurl,
  paginationProps,
}) => {
  const [isSearchTypeOpen, setIsSearchTypeOpen] = React.useState(false);
  const [isPackageTypeOpen, setIsPackageTypeOpen] = React.useState(false);
  const [isScopeOpen, setIsScopeOpen] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);

  const searchTypeLabel =
    PACKAGE_SEARCH_TYPE_OPTIONS.find((option) => option.value === searchType)
      ?.label ?? "Filter text";

  const bulkLineCount = appliedBulkPurls
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;

  const advancedFilterCount =
    (mustMatchRegex.trim() ? 1 : 0) +
    (mustNotMatchRegex.trim() ? 1 : 0) +
    (bulkLineCount > 0 ? 1 : 0);

  const hasSearchValue = Boolean(searchValue.trim());

  const hasActiveFilters =
    Boolean(searchValue.trim()) ||
    isExactMatch ||
    !isLatestOnly ||
    selectedPackageTypes.length > 0 ||
    Boolean(mustMatchRegex.trim()) ||
    Boolean(mustNotMatchRegex.trim()) ||
    bulkLineCount > 0;

  const searchTypeToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="Search attribute"
      isExpanded={isSearchTypeOpen}
      onClick={() => setIsSearchTypeOpen((open) => !open)}
    >
      {searchTypeLabel}
    </MenuToggle>
  );

  const scopeToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="SBOM scope"
      isExpanded={isScopeOpen}
      onClick={() => setIsScopeOpen((open) => !open)}
    >
      {isLatestOnly ? "Latest SBOMs only" : "All historical SBOMs"}
    </MenuToggle>
  );

  const packageTypeToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="Package types"
      isExpanded={isPackageTypeOpen}
      onClick={() => setIsPackageTypeOpen((open) => !open)}
      {...(selectedPackageTypes.length > 0 && {
        badge: selectedPackageTypes.length,
      })}
    >
      Type
    </MenuToggle>
  );

  const actionsToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="Package actions"
      variant="plain"
      isExpanded={isActionsOpen}
      onClick={() => setIsActionsOpen((open) => !open)}
      icon={<EllipsisVIcon />}
    />
  );

  return (
    <Toolbar
      id="packages-advanced-toolbar"
      className="new-proposal-packages__toolbar"
      clearAllFilters={onClearAllFilters}
      collapseListedFiltersBreakpoint="xl"
    >
      <ToolbarContent>
        <ToolbarToggleGroup
          toggleIcon={<FilterIcon />}
          breakpoint="xl"
          variant="filter-group"
        >
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <Select
                aria-label="Search attribute"
                isOpen={isSearchTypeOpen}
                onOpenChange={setIsSearchTypeOpen}
                selected={searchType}
                onSelect={(_event, value) => {
                  onSearchTypeChange(value as PackageSearchType);
                  setIsSearchTypeOpen(false);
                }}
                toggle={searchTypeToggle}
              >
                <SelectList>
                  {PACKAGE_SEARCH_TYPE_OPTIONS.map((option) => (
                    <SelectOption
                      key={option.value}
                      value={option.value}
                      isSelected={searchType === option.value}
                    >
                      {option.label}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
          <ToolbarItem>
              <SearchInput
                aria-label={`Search by ${searchTypeLabel}`}
                placeholder={`Search by ${searchTypeLabel.toLowerCase()}…`}
                value={searchValue}
                onChange={(_event, value) => {
                  onSearchValueChange(value);
                  if (!value.trim() && isExactMatch) {
                    onExactMatchChange(false);
                  }
                }}
                onClear={() => {
                  onSearchValueChange("");
                  if (isExactMatch) {
                    onExactMatchChange(false);
                  }
                }}
              />
            </ToolbarItem>
            <ToolbarItem className="new-proposal-packages__exact-match-item">
              {hasSearchValue ? (
                <Checkbox
                  id="exact-match-checkbox"
                  label="Exact match"
                  isChecked={isExactMatch}
                  onChange={(_event, checked) => onExactMatchChange(checked)}
                />
              ) : (
                <Tooltip content="Enter a search term to use exact match">
                  <span className="new-proposal-packages__exact-match">
                    <Checkbox
                      id="exact-match-checkbox"
                      label="Exact match"
                      isChecked={false}
                      isDisabled
                    />
                  </span>
                </Tooltip>
              )}
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarGroup variant="filter-group">
            <ToolbarFilter
              labels={
                isLatestOnly
                  ? []
                  : [{ key: "scope", node: "All historical SBOMs" }]
              }
              deleteLabel={() => onLatestOnlyChange(true)}
              deleteLabelGroup={() => onLatestOnlyChange(true)}
              categoryName="Scope"
              showToolbarItem
            >
              <Select
                aria-label="SBOM scope"
                isOpen={isScopeOpen}
                onOpenChange={setIsScopeOpen}
                selected={isLatestOnly ? "latest" : "all"}
                onSelect={(_event, value) => {
                  onLatestOnlyChange(value === "latest");
                  setIsScopeOpen(false);
                }}
                toggle={scopeToggle}
              >
                <SelectList>
                  <SelectOption value="latest" isSelected={isLatestOnly}>
                    Latest SBOMs only
                  </SelectOption>
                  <SelectOption value="all" isSelected={!isLatestOnly}>
                    All historical SBOMs
                  </SelectOption>
                </SelectList>
              </Select>
            </ToolbarFilter>

            <ToolbarFilter
              labels={selectedPackageTypes.map((type) => {
                const option = PACKAGE_TYPE_OPTIONS.find(
                  (item) => item.value === type,
                );
                return {
                  key: type,
                  node: option?.label ?? type,
                };
              })}
              deleteLabel={(_category, label) => {
                const key =
                  typeof label === "string"
                    ? label
                    : ((label as { key?: string }).key ?? "");
                onPackageTypesChange(
                  selectedPackageTypes.filter((type) => type !== key),
                );
              }}
              deleteLabelGroup={() => onPackageTypesChange([])}
              categoryName="Type"
              showToolbarItem
            >
              <Select
                aria-label="Package types"
                isOpen={isPackageTypeOpen}
                onOpenChange={setIsPackageTypeOpen}
                selected={selectedPackageTypes}
                onSelect={(_event, selection) => {
                  const value = selection as PackageTypeOption;
                  onPackageTypesChange(
                    selectedPackageTypes.includes(value)
                      ? selectedPackageTypes.filter((type) => type !== value)
                      : [...selectedPackageTypes, value],
                  );
                }}
                toggle={packageTypeToggle}
              >
                <SelectList>
                  {PACKAGE_TYPE_OPTIONS.map((option) => (
                    <SelectOption
                      key={option.value}
                      value={option.value}
                      hasCheckbox
                      isSelected={selectedPackageTypes.includes(option.value)}
                    >
                      {option.label}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarFilter>

            <ToolbarItem className="new-proposal-packages__advanced-filters-link">
              <Button variant="link" isInline onClick={onOpenAdvancedFilters}>
                {advancedFilterCount > 0
                  ? `Advanced filters (${advancedFilterCount})`
                  : "Advanced filters"}
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>

        <ToolbarGroup variant="action-group-plain">
          <ToolbarItem>
            <Dropdown
              isOpen={isActionsOpen}
              onOpenChange={setIsActionsOpen}
              onSelect={() => setIsActionsOpen(false)}
              popperProps={{ position: "right" }}
              toggle={actionsToggle}
            >
              <DropdownList>
                <DropdownItem
                  key="curl"
                  icon={<CopyIcon />}
                  description="Copy the current filters as an API command for debugging"
                  onClick={onCopyCurl}
                >
                  {curlCopied ? "cURL copied" : "Copy as cURL"}
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarGroup>

        <ToolbarItem variant="pagination" align={{ default: "alignEnd" }}>
          <SimplePagination
            idPrefix="new-proposal-package-table"
            isTop
            paginationProps={paginationProps}
          />
        </ToolbarItem>
      </ToolbarContent>

      {(hasActiveFilters ||
        Boolean(mustMatchRegex) ||
        Boolean(mustNotMatchRegex) ||
        bulkLineCount > 0 ||
        Boolean(searchValue.trim()) ||
        isExactMatch) && (
        <ToolbarContent className="new-proposal-packages__chip-row">
          <ToolbarItem className="new-proposal-packages__chip-summary">
            <span className="new-proposal-packages__result-count">
              {resultCount} package{resultCount === 1 ? "" : "s"} found
              {isLatestOnly
                ? " (latest SBOMs only)"
                : " (all historical SBOMs)"}
            </span>
          </ToolbarItem>
          <ToolbarItem>
            <LabelGroup
              categoryName="Active filters"
              numLabels={8}
              isCompact
            >
              {searchValue.trim() ? (
                <Label
                  color="blue"
                  onClose={() => onSearchValueChange("")}
                >
                  {searchTypeLabel}: {searchValue.trim()}
                </Label>
              ) : null}
              {isExactMatch ? (
                <Label color="blue" onClose={() => onExactMatchChange(false)}>
                  Exact match
                </Label>
              ) : null}
              {mustMatchRegex.trim() ? (
                <Label
                  color="blue"
                  onClose={() => onMustMatchRegexChange("")}
                >
                  Must match: {mustMatchRegex.trim()}
                </Label>
              ) : null}
              {mustNotMatchRegex.trim() ? (
                <Label
                  color="blue"
                  onClose={() => onMustNotMatchRegexChange("")}
                >
                  Must not match: {mustNotMatchRegex.trim()}
                </Label>
              ) : null}
              {bulkLineCount > 0 ? (
                <Label color="blue" onClose={onClearBulkPurls}>
                  Bulk PURLs ({bulkLineCount})
                </Label>
              ) : null}
            </LabelGroup>
          </ToolbarItem>
          {hasActiveFilters ? (
            <ToolbarItem>
              <Button variant="link" isInline onClick={onClearAllFilters}>
                Clear all filters
              </Button>
            </ToolbarItem>
          ) : null}
        </ToolbarContent>
      )}
    </Toolbar>
  );
};
