-- =====================================================================
-- AgroDirecto · Migración 09: pedidos seguros y con precio guardado
-- Fecha: 15 de noviembre de 2026 · Historia: HU-07
--
-- 1. Cada pedido guarda el precio por unidad del día en que se hizo
--    (como una factura). Sirve también para medir cuánto se vendió y a qué precio.
-- 2. La base revisa cada pedido nuevo: cantidad mayor que 0, que haya suficiente
--    y que nadie se pida su propio producto. Antes solo lo revisaba la pantalla.
-- =====================================================================

begin;

-- ---------- 1. Columna precio en pedidos ----------
-- Se crea vacía para poder llenar los pedidos que ya existen (pedidos 1 y 2 de prueba).
alter table public.pedidos add column precio numeric;

-- Los pedidos viejos toman el precio actual de su producto (lo más cercano que tenemos).
update public.pedidos
set precio = productos.precio
from public.productos
where productos.id = pedidos.producto_id;

-- Ya llenos, el precio pasa a ser obligatorio y mayor que 0.
alter table public.pedidos alter column precio set not null;
alter table public.pedidos add constraint precio_pedido_positivo check (precio > 0);

-- ---------- 2. La cantidad pedida debe ser mayor que 0 ----------
-- Es el respaldo final. El trigger de abajo da un mensaje más amable antes de llegar aquí.
alter table public.pedidos add constraint cantidad_pedido_positiva check (cantidad > 0);

-- ---------- 3. Inspector de pedidos nuevos ----------
-- Corre ANTES de guardar cada pedido nuevo. Si algo está mal, lanza un error
-- y el pedido no se guarda.
create or replace function public.revisar_pedido_nuevo()
returns trigger
language plpgsql
as $$
declare
  disponible numeric;
  medida     text;
  precio_hoy numeric;
  dueno      uuid;
begin
  select cantidad, unidad, precio, productor_id
    into disponible, medida, precio_hoy, dueno
  from public.productos
  where id = new.producto_id;

  if not found then
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

create trigger revisar_al_pedir
  before insert on public.pedidos
  for each row
  execute function public.revisar_pedido_nuevo();

commit;
