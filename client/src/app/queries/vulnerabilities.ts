import { useQueries, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { HubRequestParams } from "@app/api/models";
import { client } from "@app/axios-config/apiInit";
import {
  type AnalysisResponse,
  analyze,
  getVulnerability,
  listVulnerabilities,
} from "@app/client";
import { requestParamsQuery } from "@app/hooks/table-controls";
import { mockVulnerabilities } from "@app/mocks/vulnerabilities";

declare const __MOCK_DATA__: boolean;

export const VulnerabilitiesQueryKey = "vulnerabilities";

/** Default list order for mock vulnerability data (matches CVSS desc UX when API sort is absent). */
const DEFAULT_MOCK_VULNERABILITY_SORT = "base_score:desc";

export type UseFetchVulnerabilitiesOptions = {
  /** When set, skip running the query (e.g. until search is ready). */
  disableQuery?: boolean;
  /**
   * When true, request only vulnerabilities linked to at least one ingested SBOM
   * (`affects_sboms` query param). Mock data filters the same way for UX development.
   */
  affectsSboms?: boolean;
};

const normalizeVulnerabilitiesOptions = (
  opts?: boolean | UseFetchVulnerabilitiesOptions,
): UseFetchVulnerabilitiesOptions => {
  if (opts === undefined) {
    return {};
  }
  if (typeof opts === "boolean") {
    return { disableQuery: opts };
  }
  return opts;
};

/** Applies `sort` query (same shape as `listVulnerabilities`) for mock data; the real API sorts server-side. */
function applyMockVulnerabilitySort<
  T extends {
    identifier: string;
    published?: string | null;
    average_score?: number | null;
  },
>(items: T[], sortString: string | undefined): T[] {
  if (!sortString?.trim()) {
    return items;
  }
  const firstSegment = sortString.split(",")[0]?.trim() ?? "";
  const colonIdx = firstSegment.indexOf(":");
  const field =
    colonIdx === -1 ? firstSegment : firstSegment.slice(0, colonIdx);
  const rawDir =
    colonIdx === -1 ? "asc" : firstSegment.slice(colonIdx + 1).trim();
  const direction = rawDir === "desc" ? "desc" : "asc";
  const dir = direction === "desc" ? -1 : 1;
  const copy = [...items];
  copy.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "base_score":
        cmp = (a.average_score ?? 0) - (b.average_score ?? 0);
        break;
      case "published": {
        const ta = a.published ? new Date(a.published).getTime() : 0;
        const tb = b.published ? new Date(b.published).getTime() : 0;
        cmp = ta - tb;
        break;
      }
      case "id":
        cmp = a.identifier.localeCompare(b.identifier);
        break;
      default:
        return 0;
    }
    return cmp * dir;
  });
  return copy;
}

export const useFetchVulnerabilities = (
  params: HubRequestParams = {},
  opts?: boolean | UseFetchVulnerabilitiesOptions,
) => {
  const { disableQuery = false, affectsSboms = false } =
    normalizeVulnerabilitiesOptions(opts);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [VulnerabilitiesQueryKey, params, affectsSboms],
    queryFn: () => {
      const baseQuery = requestParamsQuery(params);
      const query = {
        ...baseQuery,
        ...(affectsSboms ? { affects_sboms: true as const } : {}),
      };

      if (__MOCK_DATA__) {
        let items = [...mockVulnerabilities];
        if (affectsSboms) {
          items = items.filter((v) =>
            v.advisories.some((a) => (a.sboms?.length ?? 0) > 0),
          );
        }
        const sortString =
          baseQuery.sort?.trim() || DEFAULT_MOCK_VULNERABILITY_SORT;
        items = applyMockVulnerabilitySort(items, sortString);
        const total = items.length;
        const limit = baseQuery.limit ?? 0;
        const offset = baseQuery.offset ?? 0;
        if (limit > 0) {
          items = items.slice(offset, offset + limit);
        } else if (offset > 0) {
          items = items.slice(offset);
        }
        return Promise.resolve({
          data: {
            items,
            total,
          },
        });
      }
      return listVulnerabilities({
        client,
        query,
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

export const useFetchVulnerabilitiesByPackageIds = (ids: string[]) => {
  const chunks = {
    ids: ids.reduce<string[][]>((chunks, item, index) => {
      if (index % 100 === 0) {
        chunks.push([item]);
      } else {
        chunks[chunks.length - 1].push(item);
      }
      return chunks;
    }, []),
    dataResolver: async (ids: string[]) => {
      const response = await analyze({
        client,
        body: { purls: ids },
      });
      return response.data;
    },
  };

  const userQueries = useQueries({
    queries: chunks.ids.map((ids) => {
      return {
        queryKey: [VulnerabilitiesQueryKey, ids],
        queryFn: () => chunks.dataResolver(ids),
        retry: false,
      };
    }),
  });

  const isFetching = userQueries.some(({ isFetching }) => isFetching);
  const fetchError = userQueries.find(({ error }) => !!error);

  const analysisResponse: AnalysisResponse = {};

  if (!isFetching) {
    for (const data of userQueries.map((item) => item?.data ?? {})) {
      for (const [id, analysisDetails] of Object.entries(data)) {
        analysisResponse[id] = analysisDetails;
      }
    }
  }

  return {
    analysisResponse,
    isFetching,
    fetchError: (fetchError?.error ?? undefined) as AxiosError | undefined,
  };
};

export const vulnerabilityByIdQueryOptions = (id: string) => ({
  queryKey: [VulnerabilitiesQueryKey, id],
  queryFn: () => {
    if (__MOCK_DATA__) {
      const found = mockVulnerabilities.find((v) => v.identifier === id);
      return Promise.resolve({ data: found ?? mockVulnerabilities[0] });
    }
    return getVulnerability({ client, path: { id } });
  },
});

export const useFetchVulnerabilityById = (id: string) => {
  const { data, isLoading, error } = useQuery(
    vulnerabilityByIdQueryOptions(id),
  );
  return {
    vulnerability: data?.data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};
