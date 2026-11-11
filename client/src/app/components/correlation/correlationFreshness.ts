/** Prototype-only freshness preview states for SBOM details. */
export const CORRELATION_FRESHNESS_STATES = {
  current: "current",
  not_computed: "not_computed",
  stale: "stale",
  updated_available: "updated_available",
} as const;

export type CorrelationFreshnessState =
  (typeof CORRELATION_FRESHNESS_STATES)[keyof typeof CORRELATION_FRESHNESS_STATES];

export const CORRELATION_FRESHNESS_LABELS: Record<
  CorrelationFreshnessState,
  string
> = {
  [CORRELATION_FRESHNESS_STATES.current]: "Current",
  [CORRELATION_FRESHNESS_STATES.not_computed]: "Not computed",
  [CORRELATION_FRESHNESS_STATES.stale]: "Outdated",
  [CORRELATION_FRESHNESS_STATES.updated_available]: "Updated available",
};

export const CORRELATION_FRESHNESS_OPTIONS = [
  CORRELATION_FRESHNESS_STATES.current,
  CORRELATION_FRESHNESS_STATES.not_computed,
  CORRELATION_FRESHNESS_STATES.stale,
  CORRELATION_FRESHNESS_STATES.updated_available,
] as const;
