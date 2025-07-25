import { fromPromise } from "neverthrow";
import { reactStartCookies } from "better-auth/react-start";
import { betterAuth } from "better-auth";
import { instantDBAdapter } from "@daveyplate/better-auth-instantdb";
import { init } from "@instantdb/admin";
import schema from "./instant.schema";
import { env } from "./env";

// Create InstantDB admin client
const admin = init({
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
  appId: process.env.VITE_INSTANT_APP_ID!,
  schema,
});

// Create Better Auth instance with InstantDB adapter
export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  database: instantDBAdapter({
    db: admin,
    usePlural: true, // Optional: set to true if your schema uses plural table names
    debugLogs: false, // Optional: set to true to see detailed logs
  }),
  // Other Better Auth configuration options
  plugins: [reactStartCookies()],

  socialProviders: {
    spotify: {
      enabled: true,
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      scope: [
        "user-read-playback-position",
        "user-top-read",
        "user-read-recently-played",
        "user-library-read",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "user-read-playback-state",
      ],
    },
  },
});

export const getTokensFromUserId = (userId: string) => {
  return fromPromise(
    auth.api.getAccessToken({
      body: {
        providerId: "spotify",
        userId,
      },
    }),
    (e) =>
      new Error("Couldn't get access token", {
        cause: e,
      }),
  );
};
