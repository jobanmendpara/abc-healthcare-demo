drop policy "Enable access for authenticated users" on "public"."timecards";

alter table "public"."assignments" drop constraint "assignments_client_id_fkey";

alter table "public"."assignments" drop constraint "assignments_employee_id_fkey";

alter table "public"."timecards" drop constraint "timecards_assignment_id_fkey";

alter table "public"."user_settings" drop constraint "user_settings_id_fkey";

alter table "public"."timecards" drop constraint "timecards_pkey";

drop index if exists "public"."timecards_pkey";

alter table "public"."timecards" drop column "created_at";

CREATE UNIQUE INDEX timecards_duplicate_pkey ON public.timecards USING btree (id);

alter table "public"."timecards" add constraint "timecards_duplicate_pkey" PRIMARY KEY using index "timecards_duplicate_pkey";

alter table "public"."assignments" add constraint "public_assignments_client_id_fkey" FOREIGN KEY (client_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "public_assignments_client_id_fkey";

alter table "public"."assignments" add constraint "public_assignments_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "public_assignments_employee_id_fkey";

alter table "public"."timecards" add constraint "public_timecards_duplicate_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."timecards" validate constraint "public_timecards_duplicate_assignment_id_fkey";

alter table "public"."user_settings" add constraint "public_user_settings_id_fkey" FOREIGN KEY (id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "public_user_settings_id_fkey";


