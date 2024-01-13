import { z } from 'zod';

export const geopointSchema = z.object({
  id: z.string(),
  formatted_address: z.string(),
  apt_number: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});
export type Geopoint = z.infer<typeof geopointSchema>;
