import "@fastify/jwt"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string, isAdmin: boolean }
    user: {
      userId: string,
      isAdmin: boolean,
    }
  }
}