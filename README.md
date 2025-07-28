# Tanstack start instant ssr starter

By using tanstack query as the method we subscribe to queries we are able to do some neat things. We are able to pre-render both the result of InstantDB queries and the state of the auth. This is useful because it allows us to focus on just rendering data without having to consider a loading/pending state. This is especially useful for rending pages that depend on auth, since the question of what to show while loading the authentication state is difficult. 

Heres how it works:

There are two entry points to the application. Both of them create a copy of a router object to render the React tree and load data. The server will call the routes, load data and render the app. When it's sent to the client it includes, the rendered html, a link to a client side script tag, and also a lot of information about the state of the router when it was done rendering on the server. 

The client will run the script tag, creating a router and 'hydrating' it with the router state that the server left off with. This is what allows the first render of the client application to match the last render of the server so that React starts up properly. 

Fortunately for us, we can send whatever we want from the server to the client in this dehydrate/hydrate step allowing us to access data immediately on the client. 

The easiest way to send data from server -> client is to use TanStack query, which has built in functionality for restoring the state of the server.

```ts
export default createStartHandler({
  createRouter: async (request) => {
    if (!request) {
      throw new Error(
        "No request found in start handler, have you patched the package?",
      );
    }
    const session = await auth.api.getSession({
      headers: request?.headers || new Headers(),
    });

    return createRouterServer(session);
  },
})(defaultStreamHandler);

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
```

This code says that for every new request to render a page, we will get the auth information from the cookies, create a server-side queryClient to store our data and create a specialized instant-specific fetcher function to preload the result of any query before the page renders. 

```ts
export const Route = createFileRoute("/")({
  loader: async (ctx) => {
    await ctx.context.prefetchQuery({
      todos: {
        $: {
          fields: ["title"],
        },
      },
    });
  },
  component: Home,
});
```

Now in each route, we can do things like this!
When the server sends the html to the client for the very first time, it can use the admin sdk to get the data in advance. However what happens when the client has to navigate to another page? Since the function signature for an Instant query is isomorphic, we can swap out the underlying fetching function to use the client sdk.

Now that we have the data preloaded in the tanstack client in advance, how do we keep it up to date? 

```ts
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
```

I just create a custom hook that uses the core sdk's subscribeQuery to manually write to the tanstack query cache to keep it updated. This keeps the always-up-to-date behavior of instant that we know and love. 



Authentication is handled the same way. When the server handles a request, it processes who the current user is, saves it to the query cache, which will get rehydrated on the client so that no loading state is needed. 
