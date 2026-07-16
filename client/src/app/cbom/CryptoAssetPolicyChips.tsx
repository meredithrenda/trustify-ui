import type React from "react";

import { Label } from "@patternfly/react-core";

import {
  cryptoAlgorithmPolicyStatusLabel,
  getCryptoAssetPolicyIssues,
} from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

export const CryptoAssetPolicyChips: React.FC<{
  asset: CryptographicAsset;
  forTable?: boolean;
}> = ({ asset, forTable = false }) => {
  const issues = getCryptoAssetPolicyIssues(asset, { forTable });

  if (issues.length === 0) {
    return (
      <Label color="green" isCompact>
        Allowed
      </Label>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--pf-t--global--spacer--xs)",
      }}
    >
      {issues.map((issue) => (
        <Label
          key={issue.id}
          color={cryptoAlgorithmPolicyStatusLabel[issue.status].color}
          isCompact
        >
          {issue.chipLabel}
        </Label>
      ))}
    </div>
  );
};

export const CryptoAssetPolicyTableCell: React.FC<{
  asset: CryptographicAsset;
}> = ({ asset }) => {
  const issues = getCryptoAssetPolicyIssues(asset, { forTable: true });

  if (issues.length === 0) {
    return (
      <Label color="green" isCompact>
        Allowed
      </Label>
    );
  }

  return <CryptoAssetPolicyChips asset={asset} forTable />;
};
