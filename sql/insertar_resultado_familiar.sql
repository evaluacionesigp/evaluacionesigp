-- Ejecutar una sola vez en el SQL Editor de Supabase (proyecto evaluacionesigp / Instituto González Palau).
-- Permite que familiar.html (página pública, sin login) guarde los cuestionarios del
-- acompañante sin exponer la tabla psico_pacientes ni relajar el NOT NULL/FK de
-- psico_resultados.user_id. La función corre como el dueño (SECURITY DEFINER),
-- busca el user_id del profesional dueño del paciente y hace el INSERT ella misma.

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
begin
  select user_id into v_user_id
  from psico_pacientes
  where id = p_paciente_id;

  if v_user_id is null then
    raise exception 'Paciente no encontrado';
  end if;

  insert into psico_resultados (user_id, paciente_id, test, fecha, puntaje_total, puntaje_z, categoria, datos)
  values (v_user_id, p_paciente_id, p_test, p_fecha, p_puntaje_total, null, p_categoria, p_datos);
end;
$$;

grant execute on function public.insertar_resultado_familiar(uuid, text, date, numeric, text, jsonb) to anon;
