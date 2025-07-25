"use client";

import { init } from "@instantdb/react";
import { useInstantAuth } from "@daveyplate/better-auth-instantdb";
import { ReactNode } from "react";
import { authClient } from "~/auth-client";

const db = init({
  appId: import.meta.env.VITE_INSTANT_APP_ID!,
});

export function InstantAuthProvider({ children }: { children?: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  useInstantAuth({
    db,
    sessionData: data,
    isPending,
  });

  return (
    // Your application code
    <>{children}</>
  );
}
