/** Correlation engine verdict for a (component, vulnerability) assessment. */
export type CorrelationVerdict =
  | "affected"
  | "fixed"
  | "not_affected"
  | "under_investigation"
  | "none";

/** Status on an advisory statement (`EvidenceDetail.assertion_status`). */
export type CorrelationAssertionStatus =
  | "affected"
  | "fixed"
  | "not_affected"
  | "under_investigation"
  | "recommended";

export type CorrelationConfidenceFactor = {
  label: string;
  /** Factor in 0–1, same model as the correlation engine console. */
  factor: number;
  description: string;
};

export type CorrelationProviderMatch = "provider" | "name";

export type CorrelationRemediationCategory =
  | "vendor_fix"
  | "workaround"
  | "mitigation"
  | "no_fix_planned"
  | "none_available"
  | "will_not_fix";

export type CorrelationEvidenceRemediation = {
  category: CorrelationRemediationCategory;
  details?: string;
  url?: string;
};

/** Product context a statement was matched in (`EvidenceContext`). */
export type CorrelationEvidenceContext = {
  name: string;
  category?: string;
};

/** One evidence statement from the correlation engine (`EvidenceDetail`). */
export type CorrelationEvidenceDetail = {
  id: string;
  assertionStatus: CorrelationAssertionStatus;
  /** Match confidence as whole percent. */
  confidencePercent: number;
  confidenceFactors: CorrelationConfidenceFactor[];
  advisoryId: string;
  advisoryIdentifier: string;
  advisoryType?: string;
  extractor: string;
  matchedValue?: {
    identifier: string;
    ranges?: string[];
  };
  products: CorrelationEvidenceContext[];
  providerName: string;
  providerMatch?: CorrelationProviderMatch;
  remediations: CorrelationEvidenceRemediation[];
  createdAt?: string;
};

export type CorrelationAssessment = {
  verdict: CorrelationVerdict;
  /** Match confidence as whole percent (eng: product of factors × 100). */
  matchConfidencePercent: number;
  /**
   * True when other applicable statements disagree with the selected verdict.
   * Does not change the verdict; signals unresolved disagreement in evidence.
   */
  hasConflict: boolean;
  /** Count of evidence items (mirrors `evidence.length`). */
  evidenceCount: number;
  /** Evidence statements for the drawer (prototype mock of `EvidenceDetail[]`). */
  evidence: CorrelationEvidenceDetail[];
  /** Factor breakdown aligned with eng confidence model (prototype mock). */
  factors: CorrelationConfidenceFactor[];
  /** True while correlation for this row is still resolving (prototype). */
  isLoading?: boolean;
  /** True when correlation failed for this row (prototype). */
  isFailed?: boolean;
  /** Optional failure reason for the info popover. */
  failureMessage?: string;
};
