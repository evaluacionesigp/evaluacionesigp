-- Ejecutar una sola vez en el SQL Editor de Supabase (proyecto evaluacionesigp / Instituto González Palau).
-- Agrega soporte para archivar pacientes (ocultarlos de la lista activa sin borrar
-- sus datos) y para registrar consentimiento explícito de inclusión en una base
-- de datos de investigación.

alter table public.psico_pacientes
  add column if not exists archivado boolean default false;
alter table public.psico_pacientes
  add column if not exists archivado_en timestamptz;
alter table public.psico_pacientes
  add column if not exists consentimiento_investigacion boolean default false;
