import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";
import { init } from "@instantdb/core";
import schema from "./instant.schema";
import { createFetcherFn } from "./instantFramework";

export const instant = init({
  appId: import.meta.env.VITE_INSTANT_APP_ID!,
  schema,
});

export function createRouterClient() {
  const queryClient = new QueryClient();

  const clientFetcher = createFetcherFn(queryClient, async (q) => {
    const data = await instant.queryOnce(q);
    return data.data as any;
  });

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient, prefetchQuery: clientFetcher },
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
    }),
    queryClient,
  );
}
