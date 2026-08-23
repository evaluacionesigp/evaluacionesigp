-- Ejecutar una sola vez en el SQL Editor de Supabase (proyecto evaluacionesigp / Instituto González Palau).
-- Agrega el link público de "Cuestionario TDAH": el paciente completa, sin login, la
-- anamnesis + ASRS-V1.1 + WURS-25 + EAVA + DEX en tdah.html?paciente=<uuid>.
--
-- Mismo mecanismo que insertar_resultado_familiar (ver insertar_resultado_familiar.sql /
-- agregar_expiracion_link_familiar.sql), con dos diferencias:
--   1) Además de insertar resultados de test, completa (sin pisar) los campos de
--      psico_informes / psico_pacientes que hoy llena el profesional a mano.
--   2) El link es de un solo uso: apenas se guarda con éxito, se vence al instante
--      (además del vencimiento por tiempo), porque acá se cargan puntajes clínicos y
--      datos sensibles (DNI, antecedentes de salud mental propios y familiares), no
--      un checklist de cuidador.

alter table public.psico_pacientes
  add column if not exists tdah_link_expira timestamptz;

alter table public.psico_informes
  add column if not exists medicacion text;

create or replace function public.enviar_cuestionarios_tdah(
  p_paciente_id uuid,
  p_intake jsonb,
  p_resultados jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_expira timestamptz;
  v_informe_id uuid;
  r jsonb;
begin
  select user_id, tdah_link_expira into v_user_id, v_expira
  from psico_pacientes
  where id = p_paciente_id;

  if v_user_id is null then
    raise exception 'Paciente no encontrado';
  end if;

  if v_expira is null or now() > v_expira then
    raise exception 'LINK_VENCIDO';
  end if;

  -- Resultados de los 4 cuestionarios (mismo formato que las cargas manuales de
  -- ASRS-V1.1 / WURS-25 / EAVA / DEX, para que el Word no distinga el origen).
  for r in select * from jsonb_array_elements(p_resultados)
  loop
    insert into psico_resultados (user_id, paciente_id, test, fecha, puntaje_total, puntaje_z, categoria, datos)
    values (
      v_user_id, p_paciente_id,
      r->>'test',
      (r->>'fecha')::date,
      (r->>'puntaje_total')::numeric,
      nullif(r->>'puntaje_z', '')::numeric,
      r->>'categoria',
      r->'datos'
    );
  end loop;

  -- Anamnesis → psico_informes: solo completa lo que el profesional dejó vacío.
  select id into v_informe_id
  from psico_informes
  where paciente_id = p_paciente_id and user_id = v_user_id;

  if v_informe_id is null then
    insert into psico_informes (
      user_id, paciente_id, dni, derivado_por, ocupacion, procedencia, dominancia, contacto,
      ant_clinicos, ant_psiquiatricos, ant_familiares, habitos_toxicos, medicacion, actualizado
    ) values (
      v_user_id, p_paciente_id,
      p_intake->>'dni', p_intake->>'derivado_por', p_intake->>'ocupacion', p_intake->>'procedencia',
      p_intake->>'dominancia', p_intake->>'contacto',
      p_intake->>'ant_clinicos', p_intake->>'ant_psiquiatricos', p_intake->>'ant_familiares',
      p_intake->>'habitos_toxicos', p_intake->>'medicacion', now()
    );
  else
    update psico_informes set
      dni               = coalesce(nullif(dni, ''), p_intake->>'dni'),
      derivado_por      = coalesce(nullif(derivado_por, ''), p_intake->>'derivado_por'),
      ocupacion         = coalesce(nullif(ocupacion, ''), p_intake->>'ocupacion'),
      procedencia       = coalesce(nullif(procedencia, ''), p_intake->>'procedencia'),
      dominancia        = coalesce(nullif(dominancia, ''), p_intake->>'dominancia'),
      contacto          = coalesce(nullif(contacto, ''), p_intake->>'contacto'),
      ant_clinicos      = coalesce(nullif(ant_clinicos, ''), p_intake->>'ant_clinicos'),
      ant_psiquiatricos = coalesce(nullif(ant_psiquiatricos, ''), p_intake->>'ant_psiquiatricos'),
      ant_familiares    = coalesce(nullif(ant_familiares, ''), p_intake->>'ant_familiares'),
      habitos_toxicos   = coalesce(nullif(habitos_toxicos, ''), p_intake->>'habitos_toxicos'),
      medicacion        = coalesce(nullif(medicacion, ''), p_intake->>'medicacion')
    where id = v_informe_id;
  end if;

  -- Anamnesis → psico_pacientes: idem, solo completa huecos. Último paso: vence el
  -- link ahora mismo (uso único), ya con todo grabado en la misma transacción.
  update psico_pacientes set
    nombre           = coalesce(nullif(nombre, ''), p_intake->>'nombre'),
    fecha_nacimiento = coalesce(fecha_nacimiento, nullif(p_intake->>'fecha_nacimiento', '')::date),
    escolaridad      = coalesce(nullif(escolaridad, ''), p_intake->>'escolaridad'),
    tdah_link_expira = now()
  where id = p_paciente_id;
end;
$$;

grant execute on function public.enviar_cuestionarios_tdah(uuid, jsonb, jsonb) to anon;
