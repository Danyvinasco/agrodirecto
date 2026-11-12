-- =====================================================================
-- AgroDirecto · Migración 07: ficha automática al registrarse + reglas del teléfono
-- Fecha: 12 de noviembre de 2026 · Historia: HU-01
--
-- Antes de correrla, verificar que esta consulta devuelva 0 filas:
--   select id, nombre, telefono, municipio
--   from public.usuarios
--   where telefono is null or nombre is null or municipio is null
--      or telefono !~ '^3[0-9]{9}$';
-- Si devuelve filas, corregir esos datos primero.
-- =====================================================================

begin;

-- ---------- 1. Función que crea la ficha ----------
-- Cuando Supabase Auth crea una cuenta (fila en auth.users), copiamos los
-- datos que la pantalla de registro mandó en "raw_user_meta_data" a public.usuarios.
-- security definer: se ejecuta con permisos del dueño de la función, porque
-- en ese momento el usuario todavía no tiene sesión.
-- search_path = '': obliga a escribir public.usuarios completo (buena práctica de seguridad).
create or replace function public.crear_ficha_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nombre, telefono, municipio, es_comprador, es_productor)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'telefono',
    new.raw_user_meta_data ->> 'municipio',
    true,                                                         -- todos pueden comprar
    coalesce((new.raw_user_meta_data ->> 'es_productor')::boolean, false)
  );
  return new;
end;
$$;

-- ---------- 2. Trigger sobre auth.users ----------
create trigger al_crear_cuenta
  after insert on auth.users
  for each row execute function public.crear_ficha_usuario();

-- ---------- 3. Reglas de la ficha ----------
-- Teléfono: 10 dígitos, empieza por 3, sin espacios ni +57
alter table public.usuarios
  add constraint usuarios_telefono_valido
  check (telefono ~ '^3[0-9]{9}$');

-- Datos obligatorios de todo usuario registrado
alter table public.usuarios
  alter column nombre    set not null,
  alter column telefono  set not null,
  alter column municipio set not null;

commit;
