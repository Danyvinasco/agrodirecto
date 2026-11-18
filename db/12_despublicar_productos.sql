-- =====================================================================
-- AgroDirecto · Migración 12: quitar publicaciones sin borrar el historial
-- Fecha: 16 de noviembre de 2026 · Historia: HU-04 (parte mínima)
--
-- En la pantalla se dice "Quitar publicación" y "Volver a publicar".
-- Por dentro es una sola columna: publicado (true = en el catálogo).
--
-- 1. Columna publicado en productos.
-- 2. El trigger revisar_pedido_nuevo también rechaza pedidos de productos
--    que están fuera del catálogo.
-- 3. Nadie puede borrar productos: al borrar uno, la base borraba en cascada
--    sus pedidos, y con ellos el historial de ventas que se necesita medir.
-- =====================================================================

begin;

-- ---------- 1. Columna publicado ----------
-- not null default true: todos los productos que ya existen quedan publicados,
-- y los nuevos nacen publicados sin que /publicar tenga que mandarlo.
alter table public.productos add column publicado boolean not null default true;

-- ---------- 2. Inspector de pedidos nuevos (versión de la migración 09 + publicado) ----------
create or replace function public.revisar_pedido_nuevo()
returns trigger
language plpgsql
as $$
declare
  disponible numeric;
  medida     text;
  precio_hoy numeric;
  dueno      uuid;
  esta_publicado boolean;
begin
  select cantidad, unidad, precio, productor_id, publicado
    into disponible, medida, precio_hoy, dueno, esta_publicado
  from public.productos
  where id = new.producto_id;

  -- Nuevo: si el productor quitó la publicación, es como si no existiera para pedir.
  -- (El mismo mensaje que ve el comprador en el detalle.)
  if not found or not esta_publicado then
    raise exception 'Este producto ya no está disponible';
  end if;

  if dueno = new.comprador_id then
    raise exception 'No puedes pedir tu propio producto';
  end if;

  if new.cantidad is null or new.cantidad <= 0 then
    raise exception 'La cantidad debe ser mayor que 0';
  end if;

  if new.cantidad > disponible then
    raise exception 'Solo hay % % disponibles', disponible, medida;
  end if;

  -- El precio lo pone la base, no la pantalla: así nadie puede mandar un precio inventado.
  new.precio := precio_hoy;

  return new;
end;
$$;
-- El trigger revisar_al_pedir (migración 09) ya apunta a esta función: no hay que recrearlo.

-- ---------- 3. Nadie borra productos ----------
-- Dos capas, como en la migración 10: sin regla (RLS) y sin permiso.
drop policy if exists "productor borra lo suyo" on public.productos;
revoke delete on public.productos from anon, authenticated;

-- Quitar o volver a publicar es un UPDATE de la columna publicado. Eso ya lo permite
-- la regla "productor edita lo suyo" (migración 02): solo el dueño, solo en sus productos.

commit;
