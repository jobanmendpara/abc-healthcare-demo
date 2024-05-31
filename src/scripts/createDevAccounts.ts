import * as process from 'node:process';
import * as path from 'node:path';
import { SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

interface MinimimumUserDetails {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
}

async function createUserAccount(user: MinimimumUserDetails, password: string, sb: SupabaseClient) {
  const { data, error } = await sb.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.log('Error creating admin account.');
    throw new Error(error.message);
  }

  const { user: newUser } = data;

  const { error: insertUserError } = await sb.from('users').insert({
    id: newUser.id,
    email: newUser.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    is_active: true,
    geopoint_id: 'ChIJUUWhWpJa6IkRxyb1X3N_H1A',
    phone_number: '1234567890',
  });
  if (insertUserError) {
    console.log('Error creating user account.');
    throw new Error(insertUserError.message);
  }

  const { error: insertUserSettingsError } = await sb
    .from('user_settings')
    .insert({
      id: newUser.id,
      is_dark_mode: false,
    });
  if (insertUserSettingsError) {
    console.log('Error creating user settings.');
    throw new Error(insertUserSettingsError.message);
  }
}

async function createDevAccounts() {
  const envPath = path.resolve([__dirname, '..', '.env'].join(path.sep));

  dotenv.config({ path: envPath });

  const dbUrl = process.env.SUPABASE_URL;
  const dbKey = process.env.SUPABASE_SERVICE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const employeeEmail = process.env.EMPLOYEE_EMAIL;
  const employeePassword = process.env.EMPLOYEE_PASSWORD;

  if (!dbUrl || !dbKey || !adminEmail || !adminPassword || !employeeEmail || !employeePassword) {
    throw new Error('Missing environment variables');
  }

  const sb = new SupabaseClient(
    dbUrl,
    dbKey,
  );

  await createUserAccount({
    email: adminEmail,
    first_name: 'Super',
    last_name: 'Admin',
    role: 'admin',
    phone_number: '1234567890',
  }, adminPassword, sb);
  console.log('Admin account created.');

  await createUserAccount({
    email: employeeEmail,
    first_name: 'Employee',
    last_name: 'User',
    role: 'employee',
    phone_number: '0987654321',
  }, employeePassword, sb);
  console.log('Employee account created.');
}

createDevAccounts();
