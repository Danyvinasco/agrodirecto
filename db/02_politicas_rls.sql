-- =====================================================================
-- AgroDirecto · Migración 02: reglas del portero (Row Level Security)
-- Fecha original: 2 de noviembre de 2026
-- auth.uid() = el código del usuario que tiene la sesión abierta
-- =====================================================================

-- ---------- usuarios ----------
create policy "registrados pueden ver perfiles"
  on public.usuarios for select
  to authenticated
  using (true);

create policy "cada quien crea su ficha"
  on public.usuarios for insert
  to authenticated
  with check (auth.uid() = id);

create policy "cada quien edita su ficha"
  on public.usuarios for update
  to authenticated
  using (auth.uid() = id);

-- ---------- productos ----------
create policy "cualquiera ve el catalogo"
  on public.productos for select
  to anon, authenticated
  using (true);

create policy "solo productores publican"
  on public.productos for insert
  to authenticated
  with check (
    auth.uid() = productor_id
    and exists (
      select 1 from public.usuarios
      where id = auth.uid() and es_productor = true
    )
  );

create policy "productor edita lo suyo"
  on public.productos for update
  to authenticated
  using (auth.uid() = productor_id);

create policy "productor borra lo suyo"
  on public.productos for delete
  to authenticated
  using (auth.uid() = productor_id);

-- ---------- pedidos ----------
create policy "ver mis pedidos"
  on public.pedidos for select
  to authenticated
  using (
    auth.uid() = comprador_id
    or exists (
      select 1 from public.productos
      where productos.id = pedidos.producto_id
        and productos.productor_id = auth.uid()
    )
  );

create policy "comprador crea pedido"
  on public.pedidos for insert
  to authenticated
  with check (
    auth.uid() = comprador_id
    and estado = 'pendiente'
  );

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
  with check (estado in ('aceptado', 'rechazado', 'en_camino'));

create policy "comprador confirma entrega"
  on public.pedidos for update
  to authenticated
  using (auth.uid() = comprador_id)
  with check (estado = 'entregado');
