import type React from "react";

import { Label } from "@patternfly/react-core";

import { correlationVerdictLabels } from "./correlationLabels";
import type { CorrelationVerdict } from "./types";

interface CorrelationVerdictLabelProps {
  verdict: CorrelationVerdict;
  isCompact?: boolean;
}

/** Row-level correlation status only (DTUX-3327). Confidence lives in expansion. */
export const CorrelationVerdictLabel: React.FC<
  CorrelationVerdictLabelProps
> = ({ verdict, isCompact = true }) => {
  const props = correlationVerdictLabels[verdict];
  return (
    <Label color={props.color} isCompact={isCompact}>
      {props.name}
    </Label>
  );
};
