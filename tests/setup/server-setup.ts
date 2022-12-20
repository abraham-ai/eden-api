import { createTestServer } from "@/../tests/util";
import { beforeEach } from "vitest";

beforeEach(async (context) => {
  const server = await createTestServer();
  context.server = server;
});