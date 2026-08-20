import type React from "react";

import { Label } from "@patternfly/react-core";

import {
  cryptoAssetPolicyPendingLabel,
  cryptoAssetPolicyVerdictLabel,
  getCryptoAssetPolicyVerdict,
} from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

/** Policy column: overall compliance (rule details in the drawer). */
export const CryptoAssetPolicyTableCell: React.FC<{
  asset: CryptographicAsset;
  isPending?: boolean;
}> = ({ asset, isPending = false }) => {
  if (isPending) {
    return (
      <Label color={cryptoAssetPolicyPendingLabel.color} isCompact>
        {cryptoAssetPolicyPendingLabel.text}
      </Label>
    );
  }

  const verdict = getCryptoAssetPolicyVerdict(asset);
  const label = cryptoAssetPolicyVerdictLabel[verdict];

  return (
    <Label color={label.color} isCompact>
      {label.text}
    </Label>
  );
};
