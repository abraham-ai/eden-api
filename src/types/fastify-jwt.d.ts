import "@fastify/jwt"
import { ObjectId } from "mongodb"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string, isAdmin: boolean }
    user: {
      userId: ObjectId,
      isAdmin: boolean,
    }
  }
}