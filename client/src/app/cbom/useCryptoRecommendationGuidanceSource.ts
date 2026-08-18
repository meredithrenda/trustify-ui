import React from "react";

import {
  CRYPTO_RECOMMENDATION_GUIDANCE_STORAGE_KEY,
  DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE,
  parseCryptoRecommendationGuidanceSource,
  type CryptoRecommendationGuidanceSource,
} from "./cryptoAlgorithmRecommendations";

/** Configured external guidance source for recommendation column content. */
export function useCryptoRecommendationGuidanceSource(): CryptoRecommendationGuidanceSource {
  return React.useMemo(() => {
    if (typeof window === "undefined") {
      return DEFAULT_CRYPTO_RECOMMENDATION_GUIDANCE_SOURCE;
    }
    return parseCryptoRecommendationGuidanceSource(
      window.localStorage.getItem(CRYPTO_RECOMMENDATION_GUIDANCE_STORAGE_KEY),
    );
  }, []);
}
