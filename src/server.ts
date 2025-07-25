// src/server.ts
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouterServer } from "./serverRouter";
import { auth } from "./auth";

export default createStartHandler({
  createRouter: async (request) => {
    const session = await auth.api.getSession({
      headers: request?.headers || new Headers(),
    });

    return createRouterServer(session);
  },
})(defaultStreamHandler);
