import { createTestServer } from '@/../tests/util';
import { test, describe, expect } from 'vitest';


describe('Server', () => {
  test('Should return server instance', async () => {
    const server = await createTestServer()
    expect(typeof server).eq('object');
    await server.close();
  });
});
