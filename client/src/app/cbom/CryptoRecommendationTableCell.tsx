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
  isPending?: boolean;
}

export const CryptoRecommendationTableCell: React.FC<
  CryptoRecommendationTableCellProps
> = ({ asset, guidanceSource, isPending = false }) => {
  if (isPending) {
    return (
      <Content
        component="span"
        style={{ color: "var(--pf-t--global--text--color--subtle)" }}
      >
        --
      </Content>
    );
  }

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
