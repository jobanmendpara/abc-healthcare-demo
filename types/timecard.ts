import { z } from 'zod';

export const timecardSchema = z.object({
  id: z.string(),
  started_at: z.string(),
  ended_at: z.string().nullable(),
  created_at: z.string(),
  assignment_id: z.string(),
  is_active: z.boolean(),
});
export interface Timecard extends z.infer<typeof timecardSchema> {};
