
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."role_enum" AS ENUM (
    'admin',
    'client',
    'employee'
);

ALTER TYPE "public"."role_enum" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."assignments" (
    "client_id" "uuid" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."assignments" OWNER TO "postgres";

COMMENT ON TABLE "public"."assignments" IS 'Assignments inventory';

CREATE TABLE IF NOT EXISTS "public"."geopoints" (
    "latitude" double precision,
    "longitude" double precision,
    "formatted_address" "text",
    "apt_number" "text",
    "id" character varying NOT NULL
);

ALTER TABLE "public"."geopoints" OWNER TO "postgres";

COMMENT ON TABLE "public"."geopoints" IS 'Geopoints inventory';

CREATE TABLE IF NOT EXISTS "public"."invites" (
    "email" "text" NOT NULL,
    "role" "public"."role_enum" DEFAULT 'employee'::"public"."role_enum" NOT NULL,
    "id" "uuid" NOT NULL,
    "token" "uuid"
);

ALTER TABLE "public"."invites" OWNER TO "postgres";

COMMENT ON TABLE "public"."invites" IS 'Active invites inventory';

CREATE TABLE IF NOT EXISTS "public"."timecards" (
    "started_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "ended_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assignment_id" "uuid" NOT NULL
);

ALTER TABLE "public"."timecards" OWNER TO "postgres";

COMMENT ON TABLE "public"."timecards" IS 'Timecards inventory';

CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" NOT NULL,
    "is_dark_mode" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."user_settings" OWNER TO "postgres";

COMMENT ON TABLE "public"."user_settings" IS 'App settings for users';

CREATE TABLE IF NOT EXISTS "public"."users" (
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "middle_name" "text",
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."role_enum" DEFAULT 'employee'::"public"."role_enum" NOT NULL,
    "phone_number" character varying NOT NULL,
    "geopoint_id" character varying NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

COMMENT ON TABLE "public"."users" IS 'Users inventory';

ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."geopoints"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."timecards"
    ADD CONSTRAINT "timecards_pkey" PRIMARY KEY ("started_at", "created_at", "id");

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."timecards"
    ADD CONSTRAINT "timecards_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_geopoint_id_fkey" FOREIGN KEY ("geopoint_id") REFERENCES "public"."geopoints"("id");

CREATE POLICY "Enable access for authenticated users" ON "public"."assignments" TO "authenticated";

CREATE POLICY "Enable access for authenticated users" ON "public"."geopoints" TO "authenticated";

CREATE POLICY "Enable access for authenticated users" ON "public"."invites" TO "authenticated";

CREATE POLICY "Enable access for authenticated users" ON "public"."timecards" TO "authenticated";

CREATE POLICY "Enable access for authenticated users" ON "public"."user_settings" TO "authenticated";

CREATE POLICY "Enable access for authenticated users" ON "public"."users" TO "authenticated";

ALTER TABLE "public"."assignments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."geopoints" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."timecards" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."assignments" TO "anon";
GRANT ALL ON TABLE "public"."assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."assignments" TO "service_role";

GRANT ALL ON TABLE "public"."geopoints" TO "anon";
GRANT ALL ON TABLE "public"."geopoints" TO "authenticated";
GRANT ALL ON TABLE "public"."geopoints" TO "service_role";

GRANT ALL ON TABLE "public"."invites" TO "anon";
GRANT ALL ON TABLE "public"."invites" TO "authenticated";
GRANT ALL ON TABLE "public"."invites" TO "service_role";

GRANT ALL ON TABLE "public"."timecards" TO "anon";
GRANT ALL ON TABLE "public"."timecards" TO "authenticated";
GRANT ALL ON TABLE "public"."timecards" TO "service_role";

GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
