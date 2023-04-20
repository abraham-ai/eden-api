import { FastifyPluginAsync } from "fastify";
import { RateLimitOptions } from "@fastify/rate-limit";
import { Type } from "@sinclair/typebox";
import { isAuth } from "../middleware/authMiddleware";

import { 
  fetchTask,
  fetchTasks, 
  receiveTaskUpdate,
  submitTask, 
  userFetchTasks,
} from "../controllers/taskController";


const taskRoutes: FastifyPluginAsync = async (server) => {

  const createTaskRateLimitOptions: RateLimitOptions = {
    max: 10,
    timeWindow: '1 minute',
  };

  server.post('/user/create', {
    schema: {
      request: {
        generatorName: Type.String(),
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
    preHandler: [
      async (request) => isAuth(server, request),
      // server.rateLimit(createTaskRateLimitOptions),
    ],
    handler: (request, reply) => submitTask(server, request, reply),
  });

  server.post('/user/tasks', {
    schema: {
      request: {
        status: Type.String(),
        taskIds: Type.Array(Type.String()),
        generators: Type.Array(Type.String()),
        earliestTime: Type.Any(),
        latestTime: Type.Any(),
        limit: Type.Number(),
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

  server.get('/task/:taskId', {
    schema: {
      response: {
        200: Type.Object({
          task: Type.Any(),
        }),
      }
    },
    // preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => fetchTask(request, reply),
  });

  server.post('/tasks/fetch', {
    schema: {
      request: {
        userId: Type.String(),
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
    handler: (request, reply) => fetchTasks(request, reply),
  });

  server.post('/tasks/update', {
    handler: (request, reply) => receiveTaskUpdate(server, request, reply),
  });

}

export default taskRoutes;