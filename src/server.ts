// src/server.ts
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouterServer } from "./serverRouter";
import { auth } from "./auth";

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
