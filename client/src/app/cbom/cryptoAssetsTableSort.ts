import type { CryptographicAsset } from "./types";
import { formatPrimitiveCell } from "./display";
import {
  getCryptoAssetPolicyVerdict,
  type CryptoAssetPolicyVerdict,
} from "./cryptoAlgorithmPolicies";

const POLICY_VERDICT_SORT_ORDER: Record<CryptoAssetPolicyVerdict, number> = {
  compliant: 0,
  warning: 1,
  non_compliant: 2,
};

export const compareCryptoAssetsForSort = (
  left: CryptographicAsset,
  right: CryptographicAsset,
  columnKey: string,
  direction: "asc" | "desc",
): number => {
  const multiplier = direction === "desc" ? -1 : 1;

  const compareStrings = (a: string, b: string) => a.localeCompare(b) * multiplier;
  const compareNumbers = (a: number, b: number) => (a - b) * multiplier;

  switch (columnKey) {
    case "name":
      return compareStrings(left.name.toLowerCase(), right.name.toLowerCase());
    case "primitive": {
      const leftLabel = formatPrimitiveCell(left)?.label ?? "";
      const rightLabel = formatPrimitiveCell(right)?.label ?? "";
      return compareStrings(leftLabel.toLowerCase(), rightLabel.toLowerCase());
    }
    case "occurrences":
      return compareNumbers(
        left.occurrenceCount ?? 0,
        right.occurrenceCount ?? 0,
      );
    case "policy":
      return compareNumbers(
        POLICY_VERDICT_SORT_ORDER[getCryptoAssetPolicyVerdict(left)],
        POLICY_VERDICT_SORT_ORDER[getCryptoAssetPolicyVerdict(right)],
      );
    case "usage":
      return compareStrings(
        left.usageType.toLowerCase(),
        right.usageType.toLowerCase(),
      );
    case "sboms":
      return compareNumbers(left.sboms?.length ?? 0, right.sboms?.length ?? 0);
    case "packages":
      return compareNumbers(
        left.packages?.length ?? 0,
        right.packages?.length ?? 0,
      );
    case "materialType": {
      const leftType = (left.materialType ?? left.name).toLowerCase();
      const rightType = (right.materialType ?? right.name).toLowerCase();
      return compareStrings(leftType, rightType);
    }
    default:
      return 0;
  }
};

export const sortCryptoAssets = (
  assets: CryptographicAsset[],
  columnKey: string,
  direction: "asc" | "desc",
): CryptographicAsset[] =>
  [...assets].sort((left, right) =>
    compareCryptoAssetsForSort(left, right, columnKey, direction),
  );
