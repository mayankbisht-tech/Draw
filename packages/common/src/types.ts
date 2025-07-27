import { z } from "zod";

export const CreateUserSchema = z.object({
    firstname: z.string().min(3).max(20),
    lastname: z.string().min(3).max(20),
    password: z.string(),
    email: z.email().min(3).max(20)
})

export const SigninSchema = z.object({
    email: z.email().min(3).max(20),
    password: z.string(),
})

export const CreateRoomSchema = z.object({
    email: z.email().min(3).max(20),
})