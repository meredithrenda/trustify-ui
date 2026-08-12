import React from "react";

import {
  Button,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  PageSection,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { SimplePagination } from "@app/components/SimplePagination";

import type { PackageSearchType, PackageTypeOption } from "./constants";
import { AdvancedFiltersModal } from "./AdvancedFiltersModal";
import {
  buildPackagesCurlCommand,
  filterNewProposalPackages,
  getNewProposalMockPackages,
} from "./filter-mock-packages";
import { NewProposalPackageTable } from "./NewProposalPackageTable";
import { NewProposalToolbar } from "./NewProposalToolbar";
import {
  createNewProposalOnSort,
  paginateNewProposalPackages,
  sortNewProposalPackages,
  type NewProposalSortBy,
} from "./new-proposal-table-controls";

import "./new-proposal-packages.css";

export const NewProposalPackageList: React.FC = () => {
  const allPackages = React.useMemo(() => getNewProposalMockPackages(), []);

  const [searchType, setSearchType] =
    React.useState<PackageSearchType>("text");
  const [searchValue, setSearchValue] = React.useState("");
  const [isExactMatch, setIsExactMatch] = React.useState(false);
  const [isLatestOnly, setIsLatestOnly] = React.useState(true);
  const [selectedPackageTypes, setSelectedPackageTypes] = React.useState<
    PackageTypeOption[]
  >([]);
  const [mustMatchRegex, setMustMatchRegex] = React.useState("");
  const [mustNotMatchRegex, setMustNotMatchRegex] = React.useState("");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] =
    React.useState(false);
  const [bulkPurls, setBulkPurls] = React.useState("");
  const [appliedBulkPurls, setAppliedBulkPurls] = React.useState("");
  const [curlCopied, setCurlCopied] = React.useState(false);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<NewProposalSortBy>({
    index: 0,
    direction: "asc",
  });

  const filterState = {
    searchType,
    searchValue,
    isExactMatch,
    isLatestOnly,
    selectedPackageTypes,
    mustMatchRegex,
    mustNotMatchRegex,
    bulkPurls: appliedBulkPurls,
  };

  const filteredPackages = React.useMemo(
    () => filterNewProposalPackages(allPackages, filterState),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prototype filter object
    [
      allPackages,
      searchType,
      searchValue,
      isExactMatch,
      isLatestOnly,
      selectedPackageTypes,
      mustMatchRegex,
      mustNotMatchRegex,
      appliedBulkPurls,
    ],
  );

  const sortedPackages = React.useMemo(
    () => sortNewProposalPackages(filteredPackages, sortBy),
    [filteredPackages, sortBy],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPackages.length / itemsPerPage),
  );
  const safePage = Math.min(pageNumber, totalPages);

  const pagePackages = React.useMemo(
    () => paginateNewProposalPackages(sortedPackages, safePage, itemsPerPage),
    [sortedPackages, safePage, itemsPerPage],
  );

  const paginationProps = {
    itemCount: sortedPackages.length,
    perPage: itemsPerPage,
    page: safePage,
    onSetPage: (_event: React.MouseEvent | null, page: number) => {
      setPageNumber(page);
    },
    onPerPageSelect: (_event: React.MouseEvent | null, perPage: number) => {
      setPageNumber(1);
      setItemsPerPage(perPage);
    },
  };

  const onSort = createNewProposalOnSort(setSortBy, setPageNumber);

  React.useEffect(() => {
    setPageNumber(1);
  }, [
    searchType,
    searchValue,
    isExactMatch,
    isLatestOnly,
    selectedPackageTypes,
    mustMatchRegex,
    mustNotMatchRegex,
    appliedBulkPurls,
  ]);

  const clearAllFilters = () => {
    setSearchValue("");
    setIsExactMatch(false);
    setIsLatestOnly(true);
    setSelectedPackageTypes([]);
    setMustMatchRegex("");
    setMustNotMatchRegex("");
    setBulkPurls("");
    setAppliedBulkPurls("");
  };

  const copyCurlToClipboard = async () => {
    const curlCommand = buildPackagesCurlCommand(filterState);
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCurlCopied(true);
      window.setTimeout(() => setCurlCopied(false), 2000);
    } catch {
      setCurlCopied(false);
    }
  };

  const openAdvancedFilters = () => {
    setBulkPurls(appliedBulkPurls);
    setIsAdvancedFiltersOpen(true);
  };

  const closeAdvancedFilters = () => {
    setBulkPurls(appliedBulkPurls);
    setIsAdvancedFiltersOpen(false);
  };

  const applyAdvancedFilters = () => {
    setAppliedBulkPurls(bulkPurls);
    setIsAdvancedFiltersOpen(false);
  };

  return (
    <>
      <DocumentMetadata title="Packages" />
      <PageSection hasBodyWrapper={false}>
        <Content>
          <Content component="h1">Packages</Content>
          <Content component="p">
            Search packages by name, PURL, or type. Open a package to explore
            its dependency tree on the details page.
          </Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <NewProposalToolbar
          searchType={searchType}
          searchValue={searchValue}
          isExactMatch={isExactMatch}
          isLatestOnly={isLatestOnly}
          selectedPackageTypes={selectedPackageTypes}
          mustMatchRegex={mustMatchRegex}
          mustNotMatchRegex={mustNotMatchRegex}
          appliedBulkPurls={appliedBulkPurls}
          resultCount={sortedPackages.length}
          curlCopied={curlCopied}
          paginationProps={paginationProps}
          onSearchTypeChange={setSearchType}
          onSearchValueChange={setSearchValue}
          onExactMatchChange={setIsExactMatch}
          onLatestOnlyChange={setIsLatestOnly}
          onPackageTypesChange={setSelectedPackageTypes}
          onMustMatchRegexChange={setMustMatchRegex}
          onMustNotMatchRegexChange={setMustNotMatchRegex}
          onClearBulkPurls={() => {
            setBulkPurls("");
            setAppliedBulkPurls("");
          }}
          onClearAllFilters={clearAllFilters}
          onOpenAdvancedFilters={openAdvancedFilters}
          onCopyCurl={() => {
            void copyCurlToClipboard();
          }}
        />
        {sortedPackages.length === 0 ? (
          <EmptyState
            titleText="No packages match your filters"
            headingLevel="h2"
            icon={SearchIcon}
            variant={EmptyStateVariant.sm}
            className="new-proposal-packages__empty"
          >
            <EmptyStateBody>
              Try adjusting search criteria, clearing package types, or removing
              regex filters.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <div className="new-proposal-packages__table-wrap">
            <NewProposalPackageTable
              packages={pagePackages}
              sortBy={sortBy}
              onSort={onSort}
            />
            <SimplePagination
              idPrefix="new-proposal-package-table"
              isTop={false}
              paginationProps={paginationProps}
            />
          </div>
        )}
      </PageSection>
      <AdvancedFiltersModal
        isOpen={isAdvancedFiltersOpen}
        mustMatchRegex={mustMatchRegex}
        mustNotMatchRegex={mustNotMatchRegex}
        bulkPurls={bulkPurls}
        onMustMatchRegexChange={setMustMatchRegex}
        onMustNotMatchRegexChange={setMustNotMatchRegex}
        onBulkPurlsChange={setBulkPurls}
        onClose={closeAdvancedFilters}
        onDone={applyAdvancedFilters}
      />
    </>
  );
};
