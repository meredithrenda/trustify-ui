import type { PurlSummary } from "@app/client";
import {
  mockPackages,
  mockPackageUuidsWithVulnerabilities,
} from "@app/mocks/packages";
import { decomposePurl } from "@app/utils/utils";

import {
  MOCK_PACKAGE_KINDS,
  type PackageSearchType,
  type PackageTypeOption,
} from "./constants";

export type NewProposalPackageRow = {
  uuid: string;
  purl: string;
  name: string;
  namespace: string;
  version: string;
  type: string;
  path?: string;
  qualifiers?: Record<string, string>;
  /** Prototype CPE identifier(s); primary shown in the table. */
  cpe: string;
  licensesLabel: string;
  hasVulnerabilities: boolean;
  kinds: PackageTypeOption[];
};

const LICENSE_LABELS = ["Apache-2.0", "MIT", "GPL-2.0-or-later", "BSD-3-Clause"];

/** Mock CPE 2.3 strings for New proposal package rows. */
const MOCK_PACKAGE_CPES: Record<string, string> = {
  "pkg-001": "cpe:2.3:a:openssl:openssl:3.0.7:*:*:*:*:*:*:*",
  "pkg-002": "cpe:2.3:o:linux:linux_kernel:5.14.0:*:*:*:*:*:*:*",
  "pkg-003": "cpe:2.3:a:angular:angular:17.3.0:*:*:*:*:node.js:*:*",
  "pkg-004":
    "cpe:2.3:a:apache:log4j:2.23.1:*:*:*:*:*:*:*",
  "pkg-005": "cpe:2.3:a:sqlite:sqlite:3.34.1:*:*:*:*:*:*:*",
  "pkg-006": "cpe:2.3:a:facebook:react:19.0.0:*:*:*:*:node.js:*:*",
  "pkg-007":
    "cpe:2.3:a:fasterxml:jackson-databind:2.17.0:*:*:*:*:*:*:*",
  "pkg-008": "cpe:2.3:a:apache:http_server:2.4.57:*:*:*:*:*:*:*",
  "pkg-009": "cpe:2.3:a:redhat:ubi:9:*:*:*:*:*:*:*",
  "pkg-010": "cpe:2.3:a:python:python:3.12.4:*:*:*:*:*:*:*",
  "pkg-011": "cpe:2.3:a:openssl:openssl:3.0.7:*:*:*:*:*:*:*",
};

/** Extra prototype row so Source RPM filter has something to show. */
const SOURCE_RPM_PROTOTYPE: PurlSummary = {
  uuid: "pkg-011",
  purl: "pkg:rpm/redhat/openssl@3.0.7-27.el9?arch=src",
  base: {
    uuid: "base-011",
    purl: "pkg:rpm/redhat/openssl",
  },
  qualifiers: { arch: "src" },
  version: {
    uuid: "ver-011",
    purl: "pkg:rpm/redhat/openssl@3.0.7-27.el9",
    version: "3.0.7-27.el9",
  },
};

const toRow = (item: PurlSummary, index: number): NewProposalPackageRow => {
  const decomposed = decomposePurl(item.purl);
  return {
    uuid: item.uuid,
    purl: item.purl,
    name: decomposed?.name ?? item.purl,
    namespace: decomposed?.namespace ?? "",
    version: decomposed?.version ?? item.version.version,
    type: decomposed?.type ?? "",
    path: decomposed?.path,
    qualifiers: decomposed?.qualifiers,
    cpe: MOCK_PACKAGE_CPES[item.uuid] ?? "",
    licensesLabel: LICENSE_LABELS[index % LICENSE_LABELS.length],
    hasVulnerabilities: mockPackageUuidsWithVulnerabilities.has(item.uuid),
    kinds: MOCK_PACKAGE_KINDS[item.uuid] ?? ["has-purl"],
  };
};

export const getNewProposalMockPackages = (): NewProposalPackageRow[] => {
  return [...mockPackages, SOURCE_RPM_PROTOTYPE].map(toRow);
};

export type NewProposalFilterState = {
  searchType: PackageSearchType;
  searchValue: string;
  isExactMatch: boolean;
  isLatestOnly: boolean;
  selectedPackageTypes: PackageTypeOption[];
  mustMatchRegex: string;
  mustNotMatchRegex: string;
  bulkPurls: string;
};

const matchesSearch = (
  row: NewProposalPackageRow,
  searchType: PackageSearchType,
  searchValue: string,
  isExactMatch: boolean,
): boolean => {
  const needle = searchValue.trim();
  if (!needle) {
    return true;
  }

  const haystackByType: Record<PackageSearchType, string> = {
    text: `${row.name} ${row.namespace} ${row.purl} ${row.version} ${row.cpe}`,
    name: row.name,
    purl: row.purl,
    cpe: row.cpe,
  };

  const haystack = haystackByType[searchType].toLowerCase();
  const normalized = needle.toLowerCase();

  if (isExactMatch) {
    return haystack === normalized;
  }

  return haystack.includes(normalized);
};

const safeRegexTest = (pattern: string, value: string): boolean | null => {
  const trimmed = pattern.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return new RegExp(trimmed, "i").test(value);
  } catch {
    return null;
  }
};

const matchesBulkPurls = (
  row: NewProposalPackageRow,
  bulkPurls: string,
): boolean => {
  const lines = bulkPurls
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return true;
  }
  return lines.some(
    (line) =>
      row.purl.includes(line) ||
      line.includes(row.purl) ||
      row.name.toLowerCase() === line.toLowerCase(),
  );
};

export const filterNewProposalPackages = (
  rows: NewProposalPackageRow[],
  filters: NewProposalFilterState,
): NewProposalPackageRow[] => {
  let result = rows.filter((row) => {
    if (
      !matchesSearch(
        row,
        filters.searchType,
        filters.searchValue,
        filters.isExactMatch,
      )
    ) {
      return false;
    }

    if (filters.selectedPackageTypes.length > 0) {
      const matchesType = filters.selectedPackageTypes.some((type) =>
        row.kinds.includes(type),
      );
      if (!matchesType) {
        return false;
      }
    }

    const mustMatch = safeRegexTest(filters.mustMatchRegex, row.purl);
    if (mustMatch === false) {
      return false;
    }

    const mustNotMatch = safeRegexTest(filters.mustNotMatchRegex, row.purl);
    if (mustNotMatch === true) {
      return false;
    }

    if (!matchesBulkPurls(row, filters.bulkPurls)) {
      return false;
    }

    return true;
  });

  // Prototype “latest SBOMs” scope: components in active/current product
  // builds — not highest package version. Mock: smaller deterministic slice.
  if (filters.isLatestOnly) {
    result = result.slice(0, 6);
  }

  return result;
};

export const buildPackagesCurlCommand = (
  filters: NewProposalFilterState,
): string => {
  const params = new URLSearchParams();
  if (filters.searchValue) {
    params.append(filters.searchType, filters.searchValue);
  }
  if (filters.isExactMatch) {
    params.append("exact", "true");
  }
  if (filters.isLatestOnly) {
    params.append("scope", "latest");
  }
  if (filters.mustMatchRegex) {
    params.append("include_regex", filters.mustMatchRegex);
  }
  if (filters.mustNotMatchRegex) {
    params.append("exclude_regex", filters.mustNotMatchRegex);
  }
  if (filters.selectedPackageTypes.length > 0) {
    params.append("types", filters.selectedPackageTypes.join(","));
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";

  return `curl -X GET "${origin}/api/v1/packages?${params.toString()}"`;
};
