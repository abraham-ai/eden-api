import { createTestServer } from "../util";
import { beforeEach } from "vitest";

beforeEach(async (context) => {
  const server = await createTestServer();
  context.server = server;
});