import { z } from 'zod';
import { geopointSchema } from './geopoint';

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  // WARN TODO: Add min lengths and other validation
  password: z.string(),
  phone: z.string(),
});
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const signUpFormDataSchema = z.object({
  credentials: loginCredentialsSchema,
  first_name: z.string(),
  middle_name: z.string().nullable(),
  last_name: z.string(),
  geopoint: geopointSchema,
});
export type SignUpFormData = z.infer<typeof signUpFormDataSchema>;
