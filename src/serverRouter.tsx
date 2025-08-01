import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { init } from "@instantdb/admin";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";
import { createFetcherFn } from "./instantFramework";
import schema from "./instant.schema";
import { auth } from "./auth";

export function createRouterServer(
  possibleSession: Awaited<ReturnType<typeof auth.api.getSession>>,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
      },
    },
  });

  const admin = init({
    adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
    appId: process.env.VITE_INSTANT_APP_ID!,
    schema,
  });

  const fetcher = createFetcherFn(queryClient, async (q) => {
    const adminResult = await admin.query(q);
    return adminResult;
  });

  queryClient.setQueryData(["auth"], possibleSession);

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient, prefetchQuery: fetcher },
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
    }),
    queryClient,
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouterServer>;
  }
}
