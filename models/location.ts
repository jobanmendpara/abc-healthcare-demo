import { z } from 'zod';

export const LocationSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  formattedAddress: z.string(),
  aptNumber: z.string(),
});
export type Location = z.infer<typeof LocationSchema>;
