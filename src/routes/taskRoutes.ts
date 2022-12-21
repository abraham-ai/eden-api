import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAuth } from "@/middleware/authMiddleware";
import { requestCreation, fetchTasks, create } from "@/controllers/taskController";

const baseRoute = '/tasks';

const taskRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/request`, {
    // TODO: Add schema
    preHandler: [async (request) => isAuth(request)],
    handler: (request, reply) => requestCreation(server, request, reply),
  });
  server.post(`${baseRoute}/fetch`, {
    schema: {
      request: {
        body: Type.Object({
          taskIds: Type.Array(Type.String()),
        }),
      },
      // TODO: Add response schema
      response: {
        200: Type.Object({
          taskIds: Type.Array(Type.String()),
        }),
      }
    },
    preHandler: [async (request) => isAuth(request)],
    handler: (request, reply) => fetchTasks(server, request, reply),
  });
  server.post(`${baseRoute}/create`, {
    // TODO: Add schema
    preHandler: [async (request) => isAuth(request)],
    handler: (request, reply) => create(server, request, reply),
  });
}

export default taskRoutes;