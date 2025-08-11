-- Move pg_trgm extension to extensions schema to satisfy linter
create schema if not exists extensions;
alter extension if exists pg_trgm set schema extensions;