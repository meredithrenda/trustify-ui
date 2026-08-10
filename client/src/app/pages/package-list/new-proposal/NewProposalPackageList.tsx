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

import type { PackageSearchType, PackageTypeOption } from "./constants";
import { AdvancedFiltersModal } from "./AdvancedFiltersModal";
import { BulkPurlModal } from "./BulkPurlModal";
import {
  buildPackagesCurlCommand,
  filterNewProposalPackages,
  getNewProposalMockPackages,
} from "./filter-mock-packages";
import { NewProposalPackageTable } from "./NewProposalPackageTable";
import { NewProposalToolbar } from "./NewProposalToolbar";

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
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] =
    React.useState(false);
  const [bulkPurls, setBulkPurls] = React.useState("");
  const [appliedBulkPurls, setAppliedBulkPurls] = React.useState("");
  const [curlCopied, setCurlCopied] = React.useState(false);

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
          resultCount={filteredPackages.length}
          curlCopied={curlCopied}
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
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onOpenAdvancedFilters={() => setIsAdvancedFiltersOpen(true)}
          onCopyCurl={() => {
            void copyCurlToClipboard();
          }}
        />
        {filteredPackages.length === 0 ? (
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
            <NewProposalPackageTable packages={filteredPackages} />
          </div>
        )}
      </PageSection>
      <BulkPurlModal
        isOpen={isBulkModalOpen}
        bulkPurls={bulkPurls}
        onBulkPurlsChange={setBulkPurls}
        onClose={() => setIsBulkModalOpen(false)}
        onAnalyze={() => {
          setAppliedBulkPurls(bulkPurls);
          setIsBulkModalOpen(false);
        }}
      />
      <AdvancedFiltersModal
        isOpen={isAdvancedFiltersOpen}
        mustMatchRegex={mustMatchRegex}
        mustNotMatchRegex={mustNotMatchRegex}
        onMustMatchRegexChange={setMustMatchRegex}
        onMustNotMatchRegexChange={setMustNotMatchRegex}
        onClose={() => setIsAdvancedFiltersOpen(false)}
      />
    </>
  );
};
