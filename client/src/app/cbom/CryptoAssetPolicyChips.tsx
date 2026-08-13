import type React from "react";

import { Label } from "@patternfly/react-core";

import {
  cryptoAssetPolicyVerdictLabel,
  getCryptoAssetPolicyVerdict,
} from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

/** Policy column: overall compliance (rule details in the drawer). */
export const CryptoAssetPolicyTableCell: React.FC<{
  asset: CryptographicAsset;
}> = ({ asset }) => {
  const verdict = getCryptoAssetPolicyVerdict(asset);
  const label = cryptoAssetPolicyVerdictLabel[verdict];

  return (
    <Label color={label.color} isCompact>
      {label.text}
    </Label>
  );
};
