import { Suspense } from "react";
import { supabase } from "../lib/supabase";
import BotonSesion from "./_componentes/BotonSesion";
import BotonPublicar from "./_componentes/BotonPublicar";
import AvisoPublicado from "./_componentes/AvisoPublicado";

async function ListaProductos() {
  const { data, error } = await supabase.from("productos").select("*");

  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map((p) => (
        <li key={p.id}>
          {p.producto} {p.variedad} – {p.cantidad} {p.unidad} a ${p.precio}/{p.unidad} ({p.municipio})
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    // pb-28 en celular: deja espacio para que el botón fijo "Publicar producto" no tape el último producto.
    <main className="p-6 pb-28 md:pb-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1>Bienvenido a AgroDirecto</h1>
        <div className="flex items-center gap-3">
          <BotonPublicar />
          <BotonSesion />
        </div>
      </div>
      {/* AvisoPublicado lee la dirección con useSearchParams: necesita su propio Suspense. */}
      <Suspense fallback={null}>
        <AvisoPublicado />
      </Suspense>
      <Suspense fallback={<p>Cargando productos...</p>}>
        <ListaProductos />
      </Suspense>
    </main>
  );
}
