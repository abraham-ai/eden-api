import { UserRole, UserType } from "@/types/user"
import "@fastify/jwt"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string }
    user: {
      userId: string,
      isAdmin: boolean,
    }
  }
}