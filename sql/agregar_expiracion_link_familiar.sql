-- Ejecutar una sola vez en el SQL Editor de Supabase (proyecto evaluacionesigp / Instituto González Palau).
-- Antes, el link de familiar.html (?paciente=<uuid>) no vencía nunca: cualquiera que
-- lo tuviera podía seguir mandando cuestionarios para ese paciente indefinidamente.
-- Esto agrega una fecha de vencimiento por paciente: cada vez que el profesional
-- aprieta "Cuestionario familiar" en la app, se renueva por 7 días desde ese momento.

alter table public.psico_pacientes
  add column if not exists familiar_link_expira timestamptz;

create or replace function public.insertar_resultado_familiar(
  p_paciente_id uuid,
  p_test text,
  p_fecha date,
  p_puntaje_total numeric,
  p_categoria text,
  p_datos jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_expira timestamptz;
begin
  select user_id, familiar_link_expira into v_user_id, v_expira
  from psico_pacientes
  where id = p_paciente_id;

  if v_user_id is null then
    raise exception 'Paciente no encontrado';
  end if;

  if v_expira is null or now() > v_expira then
    raise exception 'LINK_VENCIDO';
  end if;

  insert into psico_resultados (user_id, paciente_id, test, fecha, puntaje_total, puntaje_z, categoria, datos)
  values (v_user_id, p_paciente_id, p_test, p_fecha, p_puntaje_total, null, p_categoria, p_datos);
end;
$$;

grant execute on function public.insertar_resultado_familiar(uuid, text, date, numeric, text, jsonb) to anon;
