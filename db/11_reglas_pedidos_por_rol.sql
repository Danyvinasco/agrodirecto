-- =====================================================================
-- AgroDirecto · Migración 11: cada regla de actualizar pedidos revisa quién eres
-- Fecha: 15 de noviembre de 2026 · Historias: HU-09 y HU-10
--
-- El hueco: Postgres une con OR todos los "using" de las reglas permisivas,
-- y por aparte une con OR todos los "with check". No los evalúa por parejas.
-- Así, el comprador pasaba el "using" con SU regla (es su pedido) y el
-- "with check" con la regla DEL PRODUCTOR (que solo miraba el estado).
-- Resultado: un comprador podía aceptar, rechazar o despachar su propio pedido.
-- Probado el 15 de nov: el comprador rechazó el pedido 2 (en una prueba con rollback).
--
-- Arreglo: cada "with check" vuelve a preguntar quién eres, no solo cómo queda el estado.
-- =====================================================================

begin;

-- ---------- 1. Regla del productor ----------
drop policy if exists "productor responde y despacha" on public.pedidos;

create policy "productor responde y despacha"
  on public.pedidos for update
  to authenticated
  using (
    exists (
      select 1 from public.productos
      where productos.id = pedidos.producto_id
        and productos.productor_id = auth.uid()
    )
  )
  with check (
    estado in ('aceptado', 'rechazado', 'en_camino')
    -- Nuevo: y además eres el dueño del producto.
    and exists (
      select 1 from public.productos
      where productos.id = pedidos.producto_id
        and productos.productor_id = auth.uid()
    )
  );

-- ---------- 2. Regla del comprador ----------
drop policy if exists "comprador confirma entrega" on public.pedidos;

create policy "comprador confirma entrega"
  on public.pedidos for update
  to authenticated
  using (auth.uid() = comprador_id)
  with check (
    estado = 'entregado'
    -- Nuevo: y además eres quien hizo el pedido.
    and auth.uid() = comprador_id
  );

commit;
