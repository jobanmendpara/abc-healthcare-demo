import { z } from 'zod';

export const userSettingsSchema = z.object({
  id: z.string().uuid(),
  is_dark_mode: z.boolean(),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;
