import type React from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Content,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import { CBOM_ROUTE_PATHS } from "./paths";

const PLACEHOLDER_RULE_LABELS = [
  "Deprecated primitives",
  "PQ readiness",
  "Unwanted frameworks",
  "Weak key material",
] as const;

export const CryptographyPolicySection: React.FC = () => {
  return (
    <Alert
      isInline
      title="Cryptography policy (prototype — not enforced)"
      variant="info"
    >
      <Stack hasGutter>
        <StackItem>
          <Content component="p" style={{ marginBottom: 0 }}>
            Future rules will evaluate CBOM findings against organizational
            policy. See also <Link to={CBOM_ROUTE_PATHS.policy}>Policy</Link>.
          </Content>
        </StackItem>
        <StackItem>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--pf-t--global--spacer--xs)",
            }}
          >
            {PLACEHOLDER_RULE_LABELS.map((label) => (
              <Label key={label} color="grey" isCompact>
                {label}
              </Label>
            ))}
          </div>
        </StackItem>
      </Stack>
    </Alert>
  );
};
