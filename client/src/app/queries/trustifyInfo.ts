import { useQuery } from "@tanstack/react-query";

import { client } from "@app/axios-config/apiInit";
import { info } from "@app/client";

declare const __MOCK_DATA__: boolean;

export const TrustifyInfoQueryKey = "trustifyInfo";

/** Fetches instance metadata from GET /.well-known/trustify (cached for the session lifetime). */
export const useFetchTrustifyInfo = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [TrustifyInfoQueryKey],
    queryFn: () => {
      if (__MOCK_DATA__) {
        return Promise.resolve({
          data: {
            version: "0.0.0-mock",
            readOnly: false,
          },
        });
      }
      return info({ client });
    },
  });

  return {
    data: data?.data,
    isLoading,
    error,
  };
};
