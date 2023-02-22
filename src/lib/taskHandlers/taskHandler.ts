import { Task } from '../../models/Task';
import { TaskHandlers } from '../../plugins/tasks';
import { FastifyInstance } from 'fastify';
import { Creation, CreationSchema } from '../../models/Creation';
import { Manna } from '../../models/Manna';
import { Transaction } from '../../models/Transaction';

import * as replicate from '../../lib/taskHandlers/replicate';
import * as llm from '../../lib/taskHandlers/llm';

type TaskProvider = 'llm' | 'replicate';

type TaskStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

interface TaskUpdate {
  id: string;
  status: TaskStatus;
  output: any[];
  error: string;
}

interface TaskOutput {
  file: string;
  thumbnail: string;
  name: string;
  attributes: any;
  progress: number;
  isFinal: boolean;
}

const submitTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  const provider : TaskProvider = generatorVersion.provider;

  if (provider === 'replicate') {
    const task = await replicate.submitTask(server, generatorVersion, config);
    return task.id
  }
  else if (provider === 'llm') {
    const task = await llm.submitTask(server, generatorVersion, config);
    return task.id;
  }
}

const submitAndWaitForTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  const provider : TaskProvider = generatorVersion.provider;

  if (provider === 'replicate') {
    const result = await replicate.submitAndWaitForTask(server, generatorVersion, config);
    return result;
  }
  else if (provider === 'llm') {
    const result = await llm.submitAndWaitForTask(server, generatorVersion, config);
    return result;
  }
  else {
    throw new Error(`Unknown provider ${provider}`);
  }
}

const handleStarting = async (server: FastifyInstance, taskId: string) => {
  const task = await Task.findOne({
    taskId,
  })
  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }
  await Task.updateOne(
    { taskId },
    {
      $set: {status: 'starting', progress: 0},
    },
  )
};

const handleUpdate = async (server: FastifyInstance, taskId: string, output: TaskOutput[]) => {  
  const task = await Task.findOne({
    taskId,
  })
  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }
  if (task.status === 'completed') {
    return;
  }

  output = Array.isArray(output) ? output : [output];
  output = output.filter((o: TaskOutput) => o);

  const intermediateOutputs = output.filter((o: TaskOutput) => !o.isFinal);
  const finalOutputs = output.filter((o: TaskOutput) => o.isFinal);

  const isCompleted = finalOutputs.length > 0;
  const maxProgress = Math.max(...intermediateOutputs.map((o: TaskOutput) => o.progress));

  let taskUpdate = {
    status: isCompleted ? 'completed' : 'running',
    progress: isCompleted ? 1.0 : Math.max(maxProgress, task.progress || 0),  
  };

  if (!task.intermediate_outputs || intermediateOutputs.length > task.intermediate_outputs.length) {
    const intermediateResults = intermediateOutputs.map(async (o: TaskOutput) => {
      return {file: o.file, progress: o.progress};
    });
    Object.assign(taskUpdate, {intermediate_outputs: await Promise.all(intermediateResults)});
  };
  
  if (isCompleted) {
    const finalOutput = finalOutputs.slice(-1)[0];
    
    const creationData: CreationSchema = {
      user: task.user,
      task: task._id,
      uri: finalOutput.file,
      thumbnail: finalOutput.thumbnail,
      name: finalOutput.name,
      attributes: finalOutput.attributes,
    }
  
    if (finalOutput.file) {
      creationData.uri = await server.uploadUrlAsset!(server, finalOutput.file);
    }

    if (finalOutput.thumbnail) {
      creationData.thumbnail = await server.uploadUrlAsset!(server, finalOutput.thumbnail);
    }

    const creation = await Creation.create(creationData);

    Object.assign(taskUpdate, {
      output: finalOutput, 
      creation: creation._id
    });
  }

  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )
};

const handleFailure = async (taskId: string, error: string) => {
  const task = await Task.findOne({
    taskId,
  })
  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }  
  const taskUpdate = {
    status: 'failed',
    error: error,
  }  
  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )
  
  // refund the user
  const manna = await Manna.findOne({
    user: task.user,
  })

  if (!manna) {
    throw new Error(`Could not find manna for user ${task.user}`);
  }

  const mannaUpdate = {
    balance: manna.balance + task.cost,
  }

  await Manna.updateOne(
    { user: task.user },
    {
      $set: mannaUpdate,
    },
  )

  await Transaction.create({
    manna: manna._id,
    task: task._id,
    amount: task.cost,
  });
}

const receiveTaskUpdate = async (server: FastifyInstance, update: any) => {
  const { id: taskId, status, output, error } = update as TaskUpdate;
  console.log(`Received update for task ${taskId} with status ${status}`);
  if (error) {
    console.error(`Error for task ${taskId}: ${error}`);
  }

  switch (status) {
    case 'starting':
      break;
    case 'processing':
      await handleUpdate(server, taskId, output);
      break;
    case 'succeeded':
      //await handleUpdate(server, taskId, output);
      break;
    case 'failed':
      await handleFailure(taskId, error);
      break;
    case 'cancelled':
      await handleFailure(taskId, "Cancelled");
      break;
    default:
      throw new Error(`Unknown status ${status}`);
  }
}

const getTransactionCost = (server: FastifyInstance, generatorVersion: any, config: any) => {
  const provider = generatorVersion.provider;
  console.log("get provider", provider)
  if (provider === 'replicate') {
    const cost = replicate.getTransactionCost(server, generatorVersion, config);
    return cost;
  }
  else if (provider === 'llm') {
    const cost = llm.getTransactionCost(server, generatorVersion, config);
    return cost;
  }
  else {
    throw new Error(`Unknown provider ${provider}`);
  }
}

export const taskHandlers: TaskHandlers = {
  submitTask,
  submitAndWaitForTask,
  receiveTaskUpdate,
  getTransactionCost,
}
