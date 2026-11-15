-- =====================================================================
-- AgroDirecto · Migración 10: permisos por columna en pedidos
-- Fecha: 15 de noviembre de 2026 · Historia: HU-08
--
-- Las reglas RLS (migración 02) dicen QUIÉN puede tocar un pedido, pero no
-- QUÉ columnas. Sin esto, un productor podría aceptar un pedido y de paso
-- cambiarle la cantidad o el precio, y el inventario y las ventas quedarían mal.
--
-- Solución: permisos por columna. Es una llave que solo abre ciertos cajones.
-- RLS sigue decidiendo quién y en qué filas; esto decide en qué columnas.
-- =====================================================================

begin;

-- ---------- 1. Actualizar: solo el estado ----------
-- Primero se quita el permiso de actualizar toda la fila...
revoke update on public.pedidos from anon, authenticated;
-- ...y se devuelve solo para la columna estado.
-- Los triggers de la migración 03 siguen cuidando el orden de los estados.
grant update (estado) on public.pedidos to authenticated;

-- ---------- 2. Crear: solo las columnas que llena el comprador ----------
-- Mismo hueco del lado de crear: alguien podría mandar un created_at falso
-- (un pedido "de hace un mes") y dañar las mediciones de ventas.
-- El precio lo pone el trigger revisar_pedido_nuevo (migración 09) y el estado
-- nace en 'pendiente' por defecto, así que el comprador no necesita mandarlos.
revoke insert on public.pedidos from anon, authenticated;
grant insert (producto_id, comprador_id, cantidad) on public.pedidos to authenticated;

commit;


