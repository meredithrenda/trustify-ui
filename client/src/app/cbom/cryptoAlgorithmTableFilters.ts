import {
  type FilterCategory,
  FilterType,
  type IFilterValues,
} from "@app/components/FilterToolbar";

import type { CryptographicAsset } from "./types";

export type CryptoAlgorithmFilterKey = "search" | "primitive" | "usageType";

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
  ];
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
    return true;
  });
