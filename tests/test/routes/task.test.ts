import { FastifyInstance } from "fastify";
import { prepareUserHeaders } from "../../util";
import { expect, test } from "vitest";

const createTask = async (server: FastifyInstance) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/create',
    headers,
    payload: {
      generatorName: 'test'
    }
  });
  return response
}

test('User can create a task', async (context) => {
  const { server } = context;
  const response = await createTask(server);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('taskId');
})

test('User can list all tasks', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: '/tasks',
    headers
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('tasks');
})

test('User can list their tasks', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  await createTask(server);
  const response = await server.inject({
    method: 'GET',
    url: '/tasks',
    headers,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('tasks');
  expect(response.json().tasks.length).toBeGreaterThan(0);
})

test('User can get a task by ID', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const task = await createTask(server);
  const taskId = task.json().taskId;
  const response = await server.inject({
    method: 'GET',
    url: `/tasks/${taskId}`,
    headers,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('task');
});