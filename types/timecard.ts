import { z } from 'zod';
import { assignmentSchema } from './assignment';

export const timecardTableSchema = z.object({
  id: z.string(),
  started_at: z.string(),
  ended_at: z.string().nullable(),
  created_at: z.string(),
  assignment_id: z.string(),
  is_active: z.boolean(),
});

export const timecardSchema = z.object({
  ...timecardTableSchema.omit({ assignment_id: true }).shape,
  assignment: assignmentSchema,
});
export interface Timecard extends z.infer<typeof timecardSchema> {};

export interface TableTimecard {
  id: string;
  index: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  is_active: boolean;
  assignment: {
    id: string | undefined;
    client: {
      id: string | undefined;
      name: string;
    };
    employee: {
      id: string | undefined;
      name: string;
    };
  };
}
