import { FastifyInstance } from 'fastify';
 
const submitTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  console.log("well yes i think so")
  const hh = {id: "go now hello", job: "dsfjkdsfjk"};
  return hh;
}

const submitAndWaitForTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  console.log(`Creating task for generator ${generatorVersion.versionId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "true"
}

const getTransactionCost = (_: FastifyInstance, __: any, config: any) => {
  return 1;
}

export {
  submitTask,
  submitAndWaitForTask,
  getTransactionCost,
}