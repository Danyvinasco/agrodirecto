-- =====================================================================
-- AgroDirecto · Migración 04: unidad de venta (kg o racimo)
-- Fecha original: 11 de noviembre de 2026
-- Motivo: el plátano y el banano "por racimo" no se pesan, así que la
--         cantidad y el precio no siempre están en kilos.
-- =====================================================================

begin;

-- 1. Nombres honestos: ya no todo es kg
alter table public.productos rename column cantidad_kg to cantidad;
alter table public.productos rename column precio_kg to precio;
alter table public.pedidos  rename column cantidad_kg to cantidad;

-- 2. La unidad: kg por defecto, racimo solo si la calidad es "por racimo"
alter table public.productos add column unidad text not null default 'kg';
alter table public.productos add constraint unidad_valida
  check (unidad in ('kg', 'racimo'));
alter table public.productos add constraint calidad_valida
  check (calidad is null or calidad in ('primera', 'segunda', 'por racimo'));
alter table public.productos add constraint racimo_solo_por_racimo
  check (unidad = 'kg' or calidad = 'por racimo');

-- 3. El inspector de inventario aprende los nombres nuevos
create or replace function public.descontar_inventario()
returns trigger
language plpgsql
as $$
declare
  disponible numeric;
  medida text;
begin
  if old.estado = 'pendiente' and new.estado = 'aceptado' then
    select cantidad, unidad into disponible, medida
    from public.productos
    where id = new.producto_id
    for update;

    if disponible < new.cantidad then
      raise exception 'Solo hay % % disponibles', disponible, medida;
    end if;

    update public.productos
    set cantidad = cantidad - new.cantidad
    where id = new.producto_id;
  end if;
  return new;
end;
$$;

commit;
