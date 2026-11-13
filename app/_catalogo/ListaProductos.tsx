import { io } from "next/cache";
import { supabase } from "@/lib/supabase";
import TarjetaProducto, { type ProductoCatalogo } from "./TarjetaProducto";

// Server Component asíncrono: va a Supabase en el servidor y entrega la cuadrícula ya armada.
// Vive dentro de un <Suspense> en app/page.tsx: mientras llega, se ve "Cargando productos...".
export default async function ListaProductos() {
  // io(): le dice a Next que esto se consulta en cada visita (el inventario cambia con los
  // pedidos) y nos deja usar new Date() para "Publicado hace X días".
  await io();
  const ahora = new Date();

  const { data, error } = await supabase
    .from("productos")
    .select("id, created_at, producto, variedad, calidad, cantidad, precio, unidad, foto_url, municipio")
    .gt("cantidad", 0) // criterio 5: lo agotado no se muestra
    .order("created_at", { ascending: false }); // criterio 5: lo más reciente primero

  if (error) {
    return (
      <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">
        No pudimos cargar los productos. Revisa tu conexión y recarga la página.
      </p>
    );
  }

  const productos = data as ProductoCatalogo[];

  if (productos.length === 0) {
    return <p className="py-10 text-center text-cafe/70">Aún no hay productos publicados.</p>;
  }

  return (
    // Criterio 7: 1 columna en celular, 2 en tableta (sm), 3 (lg) y 4 (xl) en computador.
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productos.map((p) => (
        <TarjetaProducto key={p.id} p={p} ahora={ahora} />
      ))}
    </div>
  );
}
