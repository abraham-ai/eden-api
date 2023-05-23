import { test, expect } from "vitest";
import { prepareUserHeaders } from "../../util";
import { FastifyInstance } from "fastify";

const followCreator = async (server: FastifyInstance) => {
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'POST',
    url: '/creators/follow',
    headers,
    payload: {
      userId: 'admin',
    },
  });
  return response;
}

test('Can get all creators', async context => {
  const { server } = context;
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'GET',
    url: '/creators/list',
    headers,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().creators).toBeDefined();
  expect(response.json().creators.length).toBeGreaterThan(0);
})

test('Can get a creator by userId', async context => {
  const { server } = context;
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'GET',
    url: '/creators/get',
    headers,
    query: {
      userId: 'user',
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().creator).toBeDefined();
})

test('Can get a creator followers', async context => {
  const { server } = context;
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'GET',
    url: '/creators/followers',
    headers,
    query: {
      userId: 'user',
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().followers).toBeDefined();
})

test('Can get a creator following', async context => {
  const { server } = context;
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'GET',
    url: '/creators/following',
    headers,
    query: {
      userId: 'user',
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().following).toBeDefined();
})

test('Can follow a creator', async context => {
  const { server } = context;
  const response = await followCreator(server);
  expect(response.statusCode).toBe(200);
  expect(response.json().following).toBeDefined();
})

test('Can unfollow a creator', async context => {
  const { server } = context;
  await followCreator(server);
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'POST',
    url: '/creators/unfollow',
    headers,
    payload: {
      userId: 'admin',
    },
  });
  expect(response.statusCode).toBe(200);
});

test('Can update profile', async context => {
  const { server } = context;
  const headers = prepareUserHeaders()
  const response = await server.inject({
    method: 'POST',
    url: '/creators/profile',
    headers,
    payload: {
      username: 'New Name'
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().creator).toBeDefined();
})