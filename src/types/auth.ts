import { z } from 'zod';
import { geopointSchema } from './geopoint';
import { phoneSchema } from './general';

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/\d/).regex(/[!@#$%^&*(),.?":{}|<>]/).regex(/[a-z]/).regex(/[A-Z]/),
});
export type EmailLogin = z.infer<typeof emailLoginSchema>;

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
});

export const signUpFormDataSchema = z.object({
  first_name: z.string().min(1).max(255),
  middle_name: z.string().nullable(),
  last_name: z.string().min(1).max(255),
  geopoint: geopointSchema,
  phone: phoneSchema,
  confirmPassword: z.string(),
  ...emailLoginSchema.shape,
});
export type SignUpFormData = z.infer<typeof signUpFormDataSchema>;

export const changePasswordRequestSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8).regex(/\d/).regex(/[!@#$%^&*(),.?":{}|<>]/).regex(/[a-z]/).regex(/[A-Z]/),
});
export interface ChangePasswordRequest extends z.infer<typeof changePasswordRequestSchema> {}
