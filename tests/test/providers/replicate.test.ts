import { createReplicateServer, loginAsUser } from "@/../tests/util"
import { beforeEach, expect, test } from "vitest"

beforeEach(async (context) => {
  const server = await createReplicateServer()
  context.replicateServer = server
})

// test('User can submit a task to replicate', async (context) => {
//   const { replicateServer } = context
//   const token = await loginAsUser(replicateServer)
//   const response = await replicateServer.inject({
//     method: 'POST',
//     url: '/tasks/submit',
//     payload: {
//       generatorId: "abraham-ai/eden-stable-diffusion",
//       versionId: 'latest',
//     },
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//   console.log(response.json())
//   expect(response.statusCode).toBe(200)
//   expect(response.json()).toHaveProperty('taskId')
// })