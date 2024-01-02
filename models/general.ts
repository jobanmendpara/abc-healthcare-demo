import { z } from 'zod';

export const AppErrorSchema = z.object({
  name: z.string().optional(),
  message: z.string(),
  stack: z.string().optional(),
});
export type AppError = z.infer<typeof AppErrorSchema>;
