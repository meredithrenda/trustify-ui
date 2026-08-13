import React from "react";

import { useDebounceValue } from "usehooks-ts";

import {
  FILTER_TEXT_CATEGORY_KEY,
  TablePersistenceKeyPrefixes,
} from "@app/Constants";
import {
  joinKeyValueAsString,
  splitStringAsKeyValue,
} from "@app/api/model-utils";
import { FilterType } from "@app/components/FilterToolbar";
import { getPrototypeAlgorithmFilterOptions } from "@app/cbom/cryptoAlgorithmPackages";
import { getSbomIdsForAlgorithms } from "@app/cbom/cryptoAlgorithmSboms";
import { getPolicyRunSbomIds } from "@app/mocks/policy-evaluations";
import { useBulkSelection } from "@app/hooks/selection";
import {
  getHubRequestParams,
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";
import { useFetchLicenses } from "@app/queries/licenses";
import { useFetchSBOMLabels, useFetchSBOMs } from "@app/queries/sboms";

import { SbomSearchContext } from "./sbom-context";

declare const __MOCK_DATA__: boolean;

interface ISbomProvider {
  sbomGroupId?: string;
  isBulkSelectionEnabled?: boolean;
  children: React.ReactNode;
}

export const SbomSearchProvider: React.FunctionComponent<ISbomProvider> = ({
  sbomGroupId,
  isBulkSelectionEnabled,
  children,
}) => {
  const [inputValueLabel, setInputValueLabel] = React.useState("");
  const [debouncedInputValueLabel] = useDebounceValue(inputValueLabel, 400);
  const { labels } = useFetchSBOMLabels(debouncedInputValueLabel);

  const [inputValueLicense, setInputValueLicense] = React.useState("");
  const [debouncedInputValueLicense] = useDebounceValue(inputValueLicense, 400);
  const {
    result: { data: licenses },
  } = useFetchLicenses({
    filters: [
      {
        field: FILTER_TEXT_CATEGORY_KEY,
        operator: "~",
        value: debouncedInputValueLicense,
      },
    ],
    sort: { field: "license", direction: "asc" },
    page: { pageNumber: 1, itemsPerPage: 10 },
  });

  const tableControlState = useTableControlState({
    tableName: "sbom",
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.sboms,
    persistTo: "urlParams",
    columnNames: {
      name: "Name",
      version: "Version",
      supplier: "Supplier",
      labels: "Labels",
      published: "Created on",
      packages: "Dependencies",
      vulnerabilities: "Vulnerabilities",
    },
    isPaginationEnabled: true,
    isSortEnabled: true,
    sortableColumns: ["name", "published"],
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: FILTER_TEXT_CATEGORY_KEY,
        title: "Filter text",
        placeholderText: "Search",
        type: FilterType.search,
      },
      {
        categoryKey: "published",
        title: "Created on",
        type: FilterType.dateRange,
      },
      {
        categoryKey: "labels",
        title: "Label",
        type: FilterType.autocompleteLabel,
        placeholderText: "Filter results by label",
        selectOptions: labels.map((e) => {
          const keyValue = joinKeyValueAsString({ key: e.key, value: e.value });
          return {
            value: keyValue,
            label: keyValue,
          };
        }),
        onInputValueChange: setInputValueLabel,
      },
      {
        categoryKey: "license",
        title: "License",
        type: FilterType.asyncMultiselect,
        placeholderText: "Filter results by license",
        selectOptions: licenses.map((e) => {
          return {
            value: e.license,
            label: e.license,
          };
        }),
        onInputValueChange: setInputValueLicense,
      },
      {
        categoryKey: "algorithm",
        title: "Algorithm",
        type: FilterType.multiselect,
        placeholderText: "Filter by cryptographic algorithm",
        selectOptions: getPrototypeAlgorithmFilterOptions(),
        excludeFromHubRequest: true,
      },
      {
        categoryKey: "policyRun",
        title: "Policy evaluation run",
        type: FilterType.search,
        placeholderText: "Policy evaluation run",
        excludeFromHubRequest: true,
      },
    ],
    isExpansionEnabled: false,
    isSelectionEnabled: isBulkSelectionEnabled,
  });

  const {
    result: { data: sboms, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchSBOMs(
    sbomGroupId ?? null,
    {
      ...getHubRequestParams({
        ...tableControlState,
        hubSortFieldKeys: {
          name: "name",
          published: "published",
        },
      }),
      total: true,
    },
    (tableControlState.filterState.filterValues.labels ?? []).map((label) =>
      splitStringAsKeyValue(label),
    ),
  );

  const policyRunFilter =
    tableControlState.filterState.filterValues.policyRun?.[0];
  const algorithmFilter = tableControlState.filterState.filterValues.algorithm;

  const visibleSboms = React.useMemo(() => {
    let result = sboms;

    if (__MOCK_DATA__ && policyRunFilter) {
      const allowedIds = getPolicyRunSbomIds(policyRunFilter);
      if (allowedIds.size > 0) {
        result = result.filter((sbom) => allowedIds.has(sbom.id));
      }
    }

    if (__MOCK_DATA__ && algorithmFilter?.length) {
      const allowedIds = getSbomIdsForAlgorithms(algorithmFilter);
      result = result.filter((sbom) => allowedIds.has(sbom.id));
    }

    return result;
  }, [sboms, policyRunFilter, algorithmFilter]);

  const hasMockClientFilter =
    __MOCK_DATA__ && (policyRunFilter || algorithmFilter?.length);

  const visibleTotal = hasMockClientFilter
    ? visibleSboms.length
    : totalItemCount;

  const tableControls = useTableControlProps({
    ...tableControlState,
    idProperty: "id",
    currentPageItems: visibleSboms,
    totalItemCount: visibleTotal,
    isLoading: isFetching,
  });

  const bulkSelectionControls = useBulkSelection({
    isEqual: (a, b) => a.id === b.id,
    filteredItems: tableControls.filteredItems,
    currentPageItems: tableControls.currentPageItems,
  });

  return (
    <SbomSearchContext.Provider
      value={{
        sbomGroupId,
        totalItemCount: visibleTotal,
        isFetching,
        fetchError,
        tableControls,
        policyRunFilter,
        bulkSelection: {
          isEnabled: !!isBulkSelectionEnabled,
          controls: bulkSelectionControls,
        },
      }}
    >
      {children}
    </SbomSearchContext.Provider>
  );
};
