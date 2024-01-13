import { z } from 'zod';
import type { geopointSchema } from './geopoint';

export const timecardSchema = z.object({
  id: z.number(),
  started_at: z.date(),
  ended_at: z.date().nullable(),
  created_at: z.date(),
  assignment_id: z.number(),
  geopoint_id: z.string(),
  is_active: z.boolean(),
});
export type Timecard = Omit<z.infer<typeof timecardSchema>, 'geopoint_id'> & {
  geopoint: z.infer<typeof geopointSchema> | null
};
