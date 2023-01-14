import { prepareUserHeaders } from "../../util";
import { expect, test } from "vitest";

test('User can submit a task and get its status', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/create',
    payload: {
      generatorName: 'test',
      config: {
        x: 2,
      },
    },
    headers
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('taskId');

  const taskId = response.json().taskId;
  const response2 = await server.inject({
    method: 'POST',
    url: '/tasks/fetch',
    payload: {
      taskIds: [taskId],
    },
    headers
  });
  expect(response2.statusCode).toBe(200);
  expect(response2.json()).toHaveProperty('tasks');
  expect(response2.json().tasks).toHaveLength(1);
})

test('User cannot submit a task with invalid generatorName', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/create',
    payload: {
      generatorName: 'invalid',
      versionId: '1.0.0',
    },
    headers
  });
  expect(response.statusCode).toBe(400);
})

test('User cannot submit a task with invalid versionId', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/create',
    payload: {
      generatorName: 'test',
      versionId: 'invalid',
    },
    headers
  });
  expect(response.statusCode).toBe(400);
})

test('User cannot submit a task with invalid config', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/create',
    payload: {
      generatorName: 'test',
      versionId: '1.0.0',
      config: {
        x2: 1
      },
    },
    headers
  });
  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('message');
  expect(response.json().message).toMatch('Invalid config parameters: x2');
})