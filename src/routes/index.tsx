import { createFileRoute } from "@tanstack/react-router";
import { useSuperQuery } from "~/instantFramework";

export const Route = createFileRoute("/")({
  loader: async (ctx) => {
    await ctx.context.instantFetch({
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
  const { data } = useSuperQuery({
    todos: {
      $: {
        fields: ["title"],
      },
    },
  });

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <pre>{JSON.stringify(data?.todos, null, 2)}</pre>
    </div>
  );
}
