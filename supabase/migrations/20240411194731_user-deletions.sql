alter table "public"."assignments" drop constraint "assignments_client_id_fkey";

alter table "public"."assignments" drop constraint "assignments_employee_id_fkey";

alter table "public"."timecards" drop constraint "timecards_assignment_id_fkey";

alter table "public"."user_settings" drop constraint "user_settings_id_fkey";

alter table "public"."users" drop constraint "users_geopoint_id_fkey";

alter table "public"."assignments" add constraint "public_assignments_client_id_fkey" FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "public_assignments_client_id_fkey";

alter table "public"."assignments" add constraint "public_assignments_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "public_assignments_employee_id_fkey";

alter table "public"."timecards" add constraint "public_timecards_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."timecards" validate constraint "public_timecards_assignment_id_fkey";

alter table "public"."user_settings" add constraint "public_user_settings_id_fkey" FOREIGN KEY (id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "public_user_settings_id_fkey";

alter table "public"."users" add constraint "public_users_geopoint_id_fkey" FOREIGN KEY (geopoint_id) REFERENCES geopoints(id) ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "public_users_geopoint_id_fkey";


