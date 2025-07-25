import { createFileRoute } from "@tanstack/react-router";
import { authClient, useIsoAuth } from "~/auth-client";
import { useSuperQuery } from "~/instantFramework";

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

function Home() {
  const auth = useIsoAuth();

  const { data } = useSuperQuery({
    todos: {
      $: {
        fields: ["title"],
      },
    },
  });

  const login = () => {
    authClient.signIn.social({
      provider: "spotify",
    });
  };

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <pre>{JSON.stringify(data?.todos, null, 2)}</pre>
      <pre>Auth Data: {JSON.stringify(auth, null, 2)}</pre>
      <button onClick={login}>Login</button>
    </div>
  );
}
