import type { OnSort } from "@patternfly/react-table";

import type { NewProposalPackageRow } from "./filter-mock-packages";

export type NewProposalSortBy = {
  index: number;
  direction: "asc" | "desc";
};

const getSortValue = (
  row: NewProposalPackageRow,
  columnIndex: number,
): string | number => {
  switch (columnIndex) {
    case 0:
      return row.name.toLowerCase();
    case 1:
      return row.namespace.toLowerCase();
    case 2:
      return row.version.toLowerCase();
    case 3:
      return row.type.toLowerCase();
    case 4:
      return row.cpe.toLowerCase();
    case 5:
      return row.licensesLabel.toLowerCase();
    case 6:
      return Object.keys(row.qualifiers ?? {}).length;
    case 7:
      return row.hasVulnerabilities ? 1 : 0;
    default:
      return row.name.toLowerCase();
  }
};

export const sortNewProposalPackages = (
  rows: NewProposalPackageRow[],
  sortBy: NewProposalSortBy,
): NewProposalPackageRow[] => {
  const sorted = [...rows];
  const directionMultiplier = sortBy.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    const aValue = getSortValue(a, sortBy.index);
    const bValue = getSortValue(b, sortBy.index);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * directionMultiplier;
    }

    return String(aValue).localeCompare(String(bValue)) * directionMultiplier;
  });

  return sorted;
};

export const paginateNewProposalPackages = (
  rows: NewProposalPackageRow[],
  page: number,
  perPage: number,
): NewProposalPackageRow[] => {
  const start = (page - 1) * perPage;
  return rows.slice(start, start + perPage);
};

export const createNewProposalOnSort = (
  setSortBy: (sortBy: NewProposalSortBy) => void,
  setPageNumber: (page: number) => void,
): OnSort => {
  return (_event, columnIndex, direction) => {
    setSortBy({ index: columnIndex, direction });
    setPageNumber(1);
  };
};
