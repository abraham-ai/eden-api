import { test, expect } from "vitest";
import { prepareUserHeaders } from "../../util";
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

test('User can upload media', async (context) => {
  const { server } = context;

  const form = new FormData();
  const filePath = path.join(__dirname, '../..', 'assets', 'logo.png');
  form.append('media', fs.createReadStream(filePath));

  const response = await server.inject({
    method: 'POST',
    url: '/media/upload',
    headers: {
      ...prepareUserHeaders(),
      ...form.getHeaders(),
    },
    payload: form,
  });
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('url');
})