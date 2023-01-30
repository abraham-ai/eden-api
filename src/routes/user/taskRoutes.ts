import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAuth } from "../../middleware/authMiddleware";

import { 
  submitTask, 
  userFetchTasks,
} from "../../controllers/taskController";


const taskRoutes: FastifyPluginAsync = async (server) => {

  server.post('/user/tasks/create', {
    schema: {
      request: {
        generatorName: Type.String(),
        versionId: Type.String() || Type.Null(),
        config: Type.Any() || Type.Null(),
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

  server.post('/user/tasks/fetch', {
    schema: {
      request: {
        status: Type.String(),
        taskIds: Type.Array(Type.String()),
      },
      response: {
        200: Type.Object({
          tasks: Type.Array(Type.Any()),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => userFetchTasks(request, reply),
  });

}

export default taskRoutes;