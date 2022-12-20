import { test, describe, expect } from 'vitest';


describe('Server', () => {
  test('Should return server instance', async (context) => {
    const { server } = context;
    expect(typeof server).eq('object');
    await server.close();
  });
});
