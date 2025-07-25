import { useQueryClient } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { useState } from "react";

export const authClient = createAuthClient();

export const useIsoAuth = () => {
  const queryClient = useQueryClient();
  const [hydratedAuth] = useState(queryClient.getQueryData(["auth"]));

  const { data: authData, isPending } = authClient.useSession();

  return isPending ? hydratedAuth : authData;
};
