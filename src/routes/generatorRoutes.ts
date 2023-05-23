import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';


import { 
  getGenerator, 
  listGenerators} from "../controllers/generatorController";
import { GeneratorParameter } from "../models/Generator";

export interface GeneratorGetQuery {
  generatorName: string;
}

export interface GeneratorRegisterRequestBody {
  generatorName: string;
  provider: string;
  address: string;
  versionId: string;
  mode: string;
  parameters: GeneratorParameter[];
  creationAttributes: string[];
}

export interface GeneratorDeprecateRequestBody {
  generatorName: string;
  versionId: string;
}


const generatorRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/generators/get', {
    schema: {
      querystring: {
        generatorName: Type.String(),
      },
      response: {
        200: Type.Object({
          generator: Type.Object({
            generatorName: Type.String(),
            output: Type.String(),
            description: Type.String(),
            versions: Type.Array(Type.Object({
              versionId: Type.String(),
              parameters: Type.Any(),
            })),
          }),
        }),
      }
    },
    handler: (request, reply) => getGenerator(request, reply),
  });

  server.get('/generators/list', {
    schema: {
      response: {
        200: {
          generators: Type.Array(Type.Object({
            generatorName: Type.String(),
            description: Type.String(),
            output: Type.String(),
            versions: Type.Array(Type.Object({
              versionId: Type.String(),
              parameters: Type.Any(),
            })),
          })),
        }
      }
    },
    handler: (_, reply) => listGenerators(reply),
  });

  // server.post('/generators/register', {
  //   schema: {
  //     request: {
  //       body: Type.Object({
  //         generatorName: Type.String(),
  //         provider: Type.String(),
  //         address: Type.String(),
  //         versionId: Type.String(),
  //         mode: Type.String(),
  //         parameters: Type.Any(),
  //         creationAttributes: Type.Array(Type.String()),
  //       }),
  //     },
  //     response: {
  //       200: Type.Object({
  //         generator: Type.Object({
  //           generatorName: Type.String(),
  //           versionId: Type.String(),
  //         }),
  //       }),
  //     },
  //   },
  //   preHandler: [async (request) => isAdmin(server, request)],
  //   handler: (request, reply) => registerGenerator(request, reply),
  // });

  // server.post('/generators/deprecate', {
  //   schema: {
  //     request: {
  //       body: Type.Object({
  //         generatorName: Type.String(),
  //         versionId: Type.String(),
  //       }),
  //     },
  //     response: {
  //       200: Type.Object({
  //         generator: Type.Object({
  //           generatorName: Type.String(),
  //           versionId: Type.String(),
  //         }),
  //       }),
  //     },
  //   },
  //   preHandler: [async (request) => isAdmin(server, request)],
  //   handler: (request, reply) => deprecateGenerator(request, reply),
  // });
}

export default generatorRoutes;