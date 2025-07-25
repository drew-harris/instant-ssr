import { InstaQLParams, InstaQLResult } from "@instantdb/core";
import schema from "./instant.schema";
import {
  QueryClient,
  useQueryClient,
  useQuery as useTanstackQuery,
} from "@tanstack/react-query";
import { instant } from "./clientRouter";
import { useEffect } from "react";

export type InstantFetch = <Q extends InstaQLParams<typeof schema>>(
  query: Q,
) => Promise<InstaQLResult<typeof schema, Q>>;

export const createFetcherFn = (
  queryClient: QueryClient,
  fetch: InstantFetch,
) => {
  return async <Q extends InstaQLParams<typeof schema>>(q: Q) => {
    const result = await fetch(q);
    queryClient.setQueryData([JSON.stringify(q)], result);
    return result;
  };
};

export const useSuperQuery = <Q extends InstaQLParams<typeof schema>>(
  query: Q,
) => {
  const queryClient = useQueryClient();
  const tanstackResult = useTanstackQuery({
    queryKey: [JSON.stringify(query)],
    queryFn: async () => {
      if (queryClient.getQueryCache().get(JSON.stringify(query))) {
        return queryClient
          .getQueryCache()
          .get(JSON.stringify(query)) as any as InstaQLResult<typeof schema, Q>;
      }

      const result = await instant.queryOnce(query);
      return result.data as any as InstaQLResult<typeof schema, Q>;
    },
    refetchOnMount: false,
    staleTime: 50000,
  });

  useEffect(() => {
    const unsub = instant.subscribeQuery(query, (resp) => {
      queryClient.setQueryData([JSON.stringify(query)], resp.data);
    });
    return unsub;
  }, [query]);

  return tanstackResult;
};
