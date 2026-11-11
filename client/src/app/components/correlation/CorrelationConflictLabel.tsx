import type React from "react";

import { Label, Tooltip } from "@patternfly/react-core";

/** Compact conflict cue when applicable statements disagree on status. */
export const CorrelationConflictLabel: React.FC = () => (
  <Tooltip content="Advisories disagree on this status. Review the evidence to compare them.">
    <Label color="orange" isCompact>
      Conflict
    </Label>
  </Tooltip>
);
