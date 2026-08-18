import type React from "react";

import { Content } from "@patternfly/react-core";

import {
  formatCryptoAlgorithmRecommendation,
  type CryptoRecommendationGuidanceSource,
} from "./cryptoAlgorithmRecommendations";
import type { CryptographicAsset } from "./types";

interface CryptoRecommendationTableCellProps {
  asset: CryptographicAsset;
  guidanceSource: CryptoRecommendationGuidanceSource;
}

export const CryptoRecommendationTableCell: React.FC<
  CryptoRecommendationTableCellProps
> = ({ asset, guidanceSource }) => {
  const recommendation = formatCryptoAlgorithmRecommendation(
    asset,
    guidanceSource,
  );

  if (!recommendation) {
    return (
      <Content
        component="span"
        style={{ color: "var(--pf-t--global--text--color--subtle)" }}
      >
        --
      </Content>
    );
  }

  return <Content component="span">{recommendation}</Content>;
};
