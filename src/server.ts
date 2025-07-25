// src/server.ts
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouterServer } from "./serverRouter";

export default createStartHandler({
  createRouter: (request) => {
    return createRouterServer();
  },
})(defaultStreamHandler);
