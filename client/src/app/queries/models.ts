import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { HubRequestParams } from "@app/api/models";
import { client } from "@app/axios-config/apiInit";
import { listAllModels } from "@app/client";
import { requestParamsQuery } from "@app/hooks/table-controls";
import { mockSbomModels } from "@app/mocks/models";

declare const __MOCK_DATA__: boolean;

export const ModelsQueryKey = "models";

export const useFetchAllModels = (
  params: HubRequestParams = {},
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [ModelsQueryKey, params],
    queryFn: () => {
      if (__MOCK_DATA__) {
        return Promise.resolve({
          data: {
            items: mockSbomModels,
            total: mockSbomModels.length,
          },
        });
      }
      return listAllModels({
        client,
        query: { ...requestParamsQuery(params), counts: true },
      });
    },
    enabled: !disableQuery,
  });

  return {
    result: {
      data: data?.data?.items || [],
      total: data?.data?.total ?? 0,
      params: params,
    },
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};
