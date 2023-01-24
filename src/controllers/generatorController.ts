import { Generator, GeneratorVersionSchema } from "../models/Generator";
import { FastifyReply, FastifyRequest } from "fastify";

export const listGenerators = async (reply: FastifyReply) => {

  const generators = await Generator.find({});
  const responseObj = generators.map((generator) => {
    return {
      generatorName: generator.generatorName,
      versions: generator.versions
      .filter((version: GeneratorVersionSchema) => !version.isDeprecated)
      .map((version: GeneratorVersionSchema) => {
          return {
            versionId: version.versionId,
            parameters: version.parameters,
          }
        }
      ),
    };
  })
  return reply.status(200).send({generators: responseObj});
};

interface RegisterGeneratorRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId: string;
    parameters: any;
    creationAttributes: string[];
  }
}

export const registerGenerator = async (request: FastifyRequest, reply: FastifyReply) => {
  const { generatorName, versionId, parameters, creationAttributes } = request.body as RegisterGeneratorRequest["body"];

  const generatorVersion: GeneratorVersionSchema = {
    versionId,
    parameters,
    creationAttributes,
    isDeprecated: false,
    createdAt: new Date(),
  }

  const generator = await Generator.findOne({
    generatorName,
  });

  if (generator) {
    // Already exists, add new version
    await Generator.updateOne({
      generatorName,
    }, {
      $push: {
        versions: generatorVersion,
      },
    });
    return reply.status(200).send({
      generatorName,
      versionId,
    });
  } else {
    // Doesn't exist, create new generator
    const generatorDoc = new Generator({
      generatorName,
      versions: [generatorVersion],
    });
    await generatorDoc.save();
    return reply.status(200).send({
      generatorName,
      versionId,
    });
  }
}

interface DeprecateGeneratorRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId: string;
  }
}

export const deprecateGenerator = async (request: FastifyRequest, reply: FastifyReply) => {
  const { generatorName, versionId } = request.body as DeprecateGeneratorRequest["body"];

  const generator = await Generator.findOne({
    generatorName,
  });

  if (!generator) {
    return reply.status(404).send({
      message: "Generator not found",
    });
  }


  const versionIndex = generator.versions.findIndex((v: GeneratorVersionSchema) => v.versionId === versionId);


  if (versionIndex === -1) {
    return reply.status(404).send({
      message: "Generator version not found",
    });
  }

  await generator.updateOne({
    $set: {
      [`versions.${versionIndex}.isDeprecated`]: true,
    },
  });

  return reply.status(200).send({
    generatorName,
    versionId,
  });
}