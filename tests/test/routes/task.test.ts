import { loginAsUser } from "@/../tests/util";
import { expect, test } from "vitest";

test('User can submit a task and get its status', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/submit',
    payload: {
      generatorId: 'test',
      versionId: '1.0.0',
      config: {
        x: 2,
      },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response2.statusCode).toBe(200);
  expect(response2.json()).toHaveProperty('tasks');
  expect(response2.json().tasks).toHaveLength(1);
})

test('User cannot submit a task with invalid generatorId', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/submit',
    payload: {
      generatorId: 'invalid',
      versionId: '1.0.0',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(400);
})

test('User cannot submit a task with invalid versionId', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/submit',
    payload: {
      generatorId: 'test',
      versionId: 'invalid',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(400);
})

test('User cannot submit a task with invalid config', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'POST',
    url: '/tasks/submit',
    payload: {
      generatorId: 'test',
      versionId: '1.0.0',
      config: {
        x2: 1
      },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('message');
  expect(response.json().message).toMatch('Invalid config keys: x2');
})