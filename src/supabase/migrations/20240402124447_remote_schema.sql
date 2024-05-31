alter table "public"."timecards" drop constraint "timecards_pkey";

drop index if exists "public"."timecards_pkey";

alter table "public"."timecards" add column "verification_code" character varying(4) default NULL::character varying;

CREATE UNIQUE INDEX timecards_pkey ON public.timecards USING btree (id);

alter table "public"."timecards" add constraint "timecards_pkey" PRIMARY KEY using index "timecards_pkey";


