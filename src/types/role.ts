import { z } from 'zod';

export const roleEnumSchema = z.enum(['admin', 'employee', 'client']);
export type Role = z.infer<typeof roleEnumSchema>;
