import { showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { LDFlagsResponse } from "../types";
import { getLDPreferences } from "../utils/ld-urls";
import { getLDBaseUrl } from "../utils/ld-urls";

interface UseLDFlagsParams {
  searchText?: string;
  stateFilter?: string;
}

export function useLDFlags({ searchText = "", stateFilter = "live" }: UseLDFlagsParams) {
  const { apiToken, projectKey } = getLDPreferences();
  const [totalCount, setTotalCount] = useState(0);

  const { data, isLoading, error, pagination, revalidate } = useFetch<LDFlagsResponse>(
    (options) => {
      const limit = 20;
      const offset = options.page * limit;

      // The list view only needs flag-level metadata and environment keys; the detail
      // view fetches the full per-environment configuration for a single flag.
      const params = new URLSearchParams({
        sort: "-creationDate",
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const filters: string[] = [];
      if (stateFilter) filters.push(`state:${stateFilter}`);
      if (searchText) filters.push(`query:${searchText}`);
      if (filters.length > 0) {
        params.append("filter", filters.join(","));
      }
      return `${getLDBaseUrl()}/api/v2/flags/${encodeURIComponent(projectKey)}?${params.toString()}`;
    },
    {
      headers: {
        Authorization: apiToken,
        "ld-api-version": "20240415",
      },
      parseResponse: async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status} – ${text}`);
        }
        const json: LDFlagsResponse = (await response.json()) as LDFlagsResponse;
        setTotalCount(json.totalCount ?? 0);
        return json;
      },
      mapResult: (result: LDFlagsResponse) => {
        const hasMore = (result.items?.length || 0) === 20;
        return {
          data: result.items || [],
          hasMore,
        };
      },
      keepPreviousData: true,
      onError: (err) => {
        showToast({
          style: Toast.Style.Failure,
          title: "Error fetching flags",
          message: err.message,
          primaryAction: {
            title: "Retry",
            onAction: () => revalidate(),
          },
        });
      },
      execute: Boolean(apiToken && projectKey),
    },
  );

  const flags = data ?? [];

  return {
    flags,
    totalCount,
    isLoading,
    error,
    pagination,
    revalidate,
  };
}
