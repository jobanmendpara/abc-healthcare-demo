import { z } from 'zod';
import { geopointSchema } from './geopoint';

export const signInCredentialsSchema = z.object({
  email: z.string().email(),
  // WARN TODO: Add min lengths and other validation
  password: z.string(),
  phone: z.string(),
});
export type SignInCredentials = z.infer<typeof signInCredentialsSchema>;

export const signUpFormDataSchema = z.object({
  credentials: signInCredentialsSchema,
  first_name: z.string(),
  middle_name: z.string().nullable(),
  last_name: z.string(),
  geopoint: geopointSchema,
});
export type SignUpFormData = z.infer<typeof signUpFormDataSchema>;
