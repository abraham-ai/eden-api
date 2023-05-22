import { test, expect } from "vitest";
import { PROFILE_BASE_ROUTE } from "@/routes/profileRoutes";
import { prepareUserHeaders } from "../../util";
import { FastifyInstance } from "fastify";

const getUserProfile = async (server: FastifyInstance) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: PROFILE_BASE_ROUTE,
    headers
  });
  return response;
}

const getProfileById = async (server: FastifyInstance, userId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: `${PROFILE_BASE_ROUTE}/${userId}`,
    headers
  });
  return response;
}

const updateProfile = async (server: FastifyInstance, payload: any) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'PUT',
    url: PROFILE_BASE_ROUTE,
    headers,
    payload
  });
  return response;
}

test('Active user can get their profile', async (context) => {
  const { server } = context;
  const response = await getUserProfile(server);
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('user');
})

test('Able to get a user profile by id', async (context) => {
  const { server } = context;
  const response = await getProfileById(server, 'user');
  console.log(response.json())
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('user');
})

test('A user can update their profile', async (context) => {
  const { server } = context;
  const payload = {
    "name": "Test User",
  }
  const response = await updateProfile(server, payload);
  console.log(response.json())
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('user');
  expect(json.user).toHaveProperty('name');
})