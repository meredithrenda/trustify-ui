import {
  type FilterCategory,
  FilterType,
  type IFilterValues,
} from "@app/components/FilterToolbar";

import {
  CRYPTO_COMPLIANCE_ISSUE_FILTER_OPTIONS,
  CRYPTO_POLICY_VERDICT_FILTER_OPTIONS,
  getCryptoAssetPolicyReasons,
  getCryptoAssetPolicyVerdict,
  type CryptoAssetPolicyVerdict,
} from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

export type CryptoAlgorithmFilterKey =
  | "search"
  | "primitive"
  | "usageType"
  | "policy"
  | "complianceIssue";

export const CRYPTO_ALGORITHM_USAGE_OPTIONS = [
  { value: "Usage in source", label: "Usage in source" },
  { value: "Declared capability", label: "Declared capability" },
];

export const buildCryptoAlgorithmFilterCategories = (
  algorithmAssets: CryptographicAsset[],
): FilterCategory<CryptographicAsset, CryptoAlgorithmFilterKey>[] => {
  const primitives = new Set<string>();
  for (const asset of algorithmAssets) {
    if (asset.primitive) {
      primitives.add(asset.primitive);
    }
  }
  const primitiveOptions = [...primitives]
    .sort()
    .map((value) => ({ value, label: value }));

  return [
    {
      categoryKey: "search",
      title: "Search",
      placeholderText: "Search by algorithm name",
      type: FilterType.search,
    },
    ...(primitiveOptions.length > 0
      ? [
          {
            categoryKey: "primitive" as const,
            title: "Primitive",
            type: FilterType.select,
            selectOptions: primitiveOptions,
          },
        ]
      : []),
    {
      categoryKey: "usageType",
      title: "Usage",
      type: FilterType.select,
      selectOptions: CRYPTO_ALGORITHM_USAGE_OPTIONS,
    },
    {
      categoryKey: "policy",
      title: "Policy",
      type: FilterType.multiselect,
      placeholderText: "Filter by policy verdict",
      selectOptions: CRYPTO_POLICY_VERDICT_FILTER_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    },
    {
      categoryKey: "complianceIssue",
      title: "Compliance issue",
      type: FilterType.multiselect,
      placeholderText: "Filter by compliance issue",
      selectOptions: CRYPTO_COMPLIANCE_ISSUE_FILTER_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    },
  ];
};

const matchesPolicyFilter = (
  asset: CryptographicAsset,
  policyFilters: CryptoAssetPolicyVerdict[],
): boolean => {
  if (policyFilters.length === 0) {
    return true;
  }
  return policyFilters.includes(getCryptoAssetPolicyVerdict(asset));
};

const matchesComplianceIssueFilter = (
  asset: CryptographicAsset,
  complianceIssueFilters: string[],
): boolean => {
  if (complianceIssueFilters.length === 0) {
    return true;
  }
  const selectedIssues = new Set(complianceIssueFilters);
  const assetIssues = getCryptoAssetPolicyReasons(asset).map(
    (result) => result.reasonLabel,
  );
  return assetIssues.some((issue) => selectedIssues.has(issue));
};

export const filterCryptoAlgorithmAssets = (
  algorithmAssets: CryptographicAsset[],
  filterValues: IFilterValues<CryptoAlgorithmFilterKey>,
): CryptographicAsset[] =>
  algorithmAssets.filter((asset) => {
    const searchTerms = filterValues.search;
    if (searchTerms?.[0]) {
      const q = searchTerms[0].toLowerCase();
      if (!asset.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    const primitives = filterValues.primitive;
    if (primitives?.[0] && asset.primitive !== primitives[0]) {
      return false;
    }
    const usage = filterValues.usageType;
    if (usage?.[0] && asset.usageType !== usage[0]) {
      return false;
    }
    const policyFilters = (filterValues.policy ?? []).filter(
      (value): value is CryptoAssetPolicyVerdict =>
        value === "compliant" ||
        value === "warning" ||
        value === "non_compliant",
    );
    if (!matchesPolicyFilter(asset, policyFilters)) {
      return false;
    }
    const complianceIssueFilters = filterValues.complianceIssue ?? [];
    if (!matchesComplianceIssueFilter(asset, complianceIssueFilters)) {
      return false;
    }
    return true;
  });
