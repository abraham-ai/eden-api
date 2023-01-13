import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAuth } from "../middleware/authMiddleware";
import { submitTask, fetchTasks, receiveTaskUpdate } from "../controllers/taskController";

const baseRoute = '/tasks';

const taskRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/create`, {
    schema: {
      request: {
        generatorId: Type.String(),
        versionId: Type.String() || Type.Null(),
        config: Type.Any() || Type.Null(),
        metadata: Type.Any() || Type.Null(),
      },
      response: {
        200: Type.Object({
          taskId: Type.String(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => submitTask(server, request, reply),
  });
  server.post(`${baseRoute}/fetch`, {
    schema: {
      request: {
        body: Type.Object({
          taskIds: Type.Array(Type.String()),
        }),
      },
      response: {
        200: Type.Object({
          tasks: Type.Array(Type.Any()),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => fetchTasks(server, request, reply),
  });
  server.post(`${baseRoute}/update`, {
    handler: (request, reply) => receiveTaskUpdate(server, request, reply),
  });
}

export default taskRoutes;