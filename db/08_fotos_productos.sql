-- =====================================================================
-- AgroDirecto · Migración 08: bodega de fotos de los productos (Storage)
-- Fecha: 13 de noviembre de 2026 · Historia: HU-03
--
-- Cada foto se guarda en una carpeta con el id del productor:
--   fotos-productos/<id del productor>/<nombre del archivo>.jpg
-- Así el portero puede saber de quién es cada foto mirando la carpeta.
-- =====================================================================

begin;

-- ---------- 1. La bodega (bucket) ----------
-- public = true: cualquiera (incluso un visitante sin cuenta) puede VER las fotos
-- por su enlace, porque el catálogo es público. Subir y borrar sí tiene reglas (abajo).
-- file_size_limit: 5 MB como tope de seguridad. La app achica la foto antes de subirla
-- (queda de unos 200-300 KB), así que normalmente nunca se llega a este límite.
-- allowed_mime_types: solo imágenes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-productos',
  'fotos-productos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ---------- 2. Reglas del portero para las fotos ----------
-- storage.foldername(name) parte la ruta en carpetas; [1] es la primera carpeta,
-- que debe ser el id de quien tiene la sesión abierta.

-- Subir: solo productores y solo dentro de su propia carpeta
-- (la misma regla de "solo productores publican" de la migración 02).
create policy "productores suben fotos a su carpeta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-productos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.usuarios
      where id = auth.uid() and es_productor = true
    )
  );

-- Ver la lista de sus propios archivos: Supabase la necesita para poder borrar.
-- (Ver la foto por su enlace público no depende de esta regla.)
create policy "productor ve sus fotos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'fotos-productos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Borrar: cada quien solo las fotos de su carpeta.
create policy "productor borra sus fotos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos-productos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;


---