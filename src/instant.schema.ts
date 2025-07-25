// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    todos: i.entity({
      completed: i.boolean().optional(),
      title: i.string(),
    }),
    // Authentication entities
    users: i.entity({
      createdAt: i.date().optional(),
      email: i.string().unique(),
      emailVerified: i.boolean(),
      name: i.string(),
      updatedAt: i.date(),
    }),
    sessions: i.entity({
      createdAt: i.date(),
      expiresAt: i.date().indexed(),
      ipAddress: i.string(),
      token: i.string(),
      updatedAt: i.date(),
      userAgent: i.string(),
      userId: i.string(),
    }),
    accounts: i.entity({
      accessToken: i.string().optional(),
      accessTokenExpiresAt: i.date().optional(),
      accountId: i.string().optional(),
      createdAt: i.date().optional(),
      idToken: i.string().optional(),
      password: i.string().optional(),
      providerId: i.string().optional(),
      refreshToken: i.string().optional(),
      refreshTokenExpiresAt: i.date().optional(),
      scope: i.string(),
      updatedAt: i.date(),
      userId: i.string().indexed(),
    }),
    verifications: i.entity({
      createdAt: i.date().indexed(),
      expiresAt: i.date().indexed(),
      identifier: i.string(),
      updatedAt: i.date(),
      value: i.string(),
    }),
  },
  links: {
    users$user: {
      forward: {
        on: "users",
        has: "one",
        label: "$user",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "user",
      },
    },
    sessionsUser: {
      forward: {
        on: "sessions",
        has: "one",
        label: "user",
        onDelete: "cascade",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "sessions",
      },
    },
    accountsUser: {
      forward: {
        on: "accounts",
        has: "one",
        label: "user",
        onDelete: "cascade",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "accounts",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
