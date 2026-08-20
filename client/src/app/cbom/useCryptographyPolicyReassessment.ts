import React from "react";

export type CryptographyPolicyReassessmentPhase = "reassessing" | "complete";

export interface CryptographyPolicyReassessmentProgress {
  assessedCount: number;
  totalCount: number;
}

interface UseCryptographyPolicyReassessmentResult {
  phase: CryptographyPolicyReassessmentPhase;
  progress: CryptographyPolicyReassessmentProgress;
  isAssetAssessed: (assetId: string) => boolean;
  isReassessmentActive: boolean;
}

/**
 * Prototype state for the Updated policy page view. Stays in reassessing mode so
 * developers can reference the in-progress banner, metric skeletons, and pending labels.
 */
export function useCryptographyPolicyReassessment(
  enabled: boolean,
  assetIds: string[],
): UseCryptographyPolicyReassessmentResult {
  const totalCount = assetIds.length;

  const isAssetAssessed = React.useCallback(
    (_assetId: string) => !enabled,
    [enabled],
  );

  if (!enabled) {
    return {
      phase: "complete",
      progress: {
        assessedCount: totalCount,
        totalCount,
      },
      isAssetAssessed,
      isReassessmentActive: false,
    };
  }

  return {
    phase: "reassessing",
    progress: {
      assessedCount: 0,
      totalCount,
    },
    isAssetAssessed,
    isReassessmentActive: true,
  };
}
