import type { LabelProps } from "@patternfly/react-core";

import type {
  CorrelationAssertionStatus,
  CorrelationRemediationCategory,
  CorrelationVerdict,
} from "./types";

export const correlationVerdictLabels: Record<
  CorrelationVerdict,
  { name: string; color: LabelProps["color"] }
> = {
  affected: { name: "Affected", color: "red" },
  fixed: { name: "Fixed", color: "blue" },
  not_affected: { name: "Not affected", color: "green" },
  under_investigation: { name: "Under investigation", color: "yellow" },
  none: { name: "No correlation", color: "grey" },
};

export const correlationAssertionStatusLabels: Record<
  CorrelationAssertionStatus,
  { name: string; color: LabelProps["color"] }
> = {
  affected: { name: "Affected", color: "red" },
  fixed: { name: "Fixed", color: "blue" },
  not_affected: { name: "Not affected", color: "green" },
  under_investigation: { name: "Under investigation", color: "yellow" },
  recommended: { name: "Recommended", color: "purple" },
};

export const correlationRemediationCategoryLabels: Record<
  CorrelationRemediationCategory,
  string
> = {
  vendor_fix: "Vendor fix",
  workaround: "Workaround",
  mitigation: "Mitigation",
  no_fix_planned: "No fix planned",
  none_available: "None available",
  will_not_fix: "Will not fix",
};

export const correlationProviderMatchLabels: Record<
  "provider" | "name",
  { name: string; color: LabelProps["color"] }
> = {
  provider: { name: "Same as component", color: "green" },
  name: { name: "Same name as component", color: "blue" },
};
