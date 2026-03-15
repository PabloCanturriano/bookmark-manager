import { z } from "zod";

export const RegisterSchema = z.object({
   email: z.string().email(),
   password: z.string().min(8).max(72),
   name: z.string().min(1).max(100),
});

export const LoginSchema = z.object({
   email: z.string().email(),
   password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
   refreshToken: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
