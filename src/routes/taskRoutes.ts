import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import { isAuth } from "../middleware/authMiddleware";

import { 
  getTasks,
  getTask,
  receiveTaskUpdate,
  createTask, 
} from "@/controllers/taskController";

export interface TaskCreateBody {
  generatorName: string;
  versionId?: string;
  config?: any;
  metadata?: any;
}

export interface TasksGetQuery {
  status?: string;
  taskIds?: string[];
  userId?: string;
  generators?: string[];
  earliestTime?: string;
  latestTime?: string;
  limit?: number;
}

export interface TaskGetParams {
  taskId: string;
}

export interface TaskUpdateQuery {
  secret: string;
}


const taskRoutes: FastifyPluginAsync = async (server) => {
  server.post('/tasks/create', {
    schema: {
      body: {
        generatorName: Type.String(),
        versionId: Type.Optional(Type.String()),
        config: Type.Optional(Type.Any()),
        metadata: Type.Optional(Type.Any()),
      },
      response: {
        200: Type.Object({
          taskId: Type.String(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => createTask(server, request, reply),
  });

  server.get('/tasks', {
    schema: {
      querystring: {
        status: Type.Optional(Type.String()),
        userId: Type.Optional(Type.String()),
        taskIds: Type.Optional(Type.Array(Type.String())),
        generators: Type.Optional(Type.Array(Type.String())),
        earliestTime: Type.Optional(Type.Any()),
        latestTime: Type.Optional(Type.Any()),
        limit: Type.Optional(Type.Number()),
      },
      response: {
        200: Type.Object({
          tasks: Type.Array(Type.Any()),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => getTasks(request, reply),
  });

  server.get('/tasks/:taskId', {
    schema: {
      params: {
        taskId: Type.String(),
      },
      response: {
        200: Type.Object({
          task: Type.Any(),
        }),
      }
    },
    handler: (request, reply) => getTask(request, reply),
  });

  server.post('/tasks/update', {
    schema: {
      querystring: {
        secret: Type.String(),
      }
    },
    handler: (request, reply) => receiveTaskUpdate(server, request, reply),
  });
}

export default taskRoutes;