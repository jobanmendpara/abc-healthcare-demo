import { z } from 'zod';

export const geopointSchema = z.object({
  id: z.string(),
  formatted_address: z.string().nullable(),
  apt_number: z.string().optional().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});
export type Geopoint = z.infer<typeof geopointSchema>;
