-- =====================================================================
-- AgroDirecto · Migración 03: inspectores automáticos (triggers)
-- Fecha original: 2 de noviembre de 2026
-- =====================================================================

-- Inspector 1: el pedido avanza parada por parada
-- pendiente -> aceptado -> en_camino -> entregado
-- pendiente -> rechazado (estado final: el producto es perecedero)
create or replace function public.validar_estado_pedido()
returns trigger
language plpgsql
as $$
begin
  if not (
    (old.estado = 'pendiente' and new.estado in ('aceptado', 'rechazado'))
    or (old.estado = 'aceptado' and new.estado = 'en_camino')
    or (old.estado = 'en_camino' and new.estado = 'entregado')
  ) then
    raise exception 'No se puede pasar de % a %', old.estado, new.estado;
  end if;
  return new;
end;
$$;

create trigger revisar_estado
  before update of estado on public.pedidos
  for each row
  execute function public.validar_estado_pedido();

-- Inspector 2: al aceptar, se descuenta el inventario (versión original en kg;
-- se actualiza en la migración 04)
create or replace function public.descontar_inventario()
returns trigger
language plpgsql
as $$
declare
  disponible numeric;
begin
  if old.estado = 'pendiente' and new.estado = 'aceptado' then
    select cantidad_kg into disponible
    from public.productos
    where id = new.producto_id
    for update;   -- aparta el renglón para que dos aceptaciones no choquen

    if disponible < new.cantidad_kg then
      raise exception 'Solo hay % kg disponibles', disponible;
    end if;

    update public.productos
    set cantidad_kg = cantidad_kg - new.cantidad_kg
    where id = new.producto_id;
  end if;
  return new;
end;
$$;

create trigger descontar_al_aceptar
  before update of estado on public.pedidos
  for each row
  execute function public.descontar_inventario();
