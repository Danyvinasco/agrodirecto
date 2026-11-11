import { Suspense } from "react";
import { supabase } from "../lib/supabase";

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
    <main style={{ padding: 24 }}>
      <h1>Bienvenido a AgroDirecto</h1>
      <Suspense fallback={<p>Cargando productos...</p>}>
        <ListaProductos />
      </Suspense>
    </main>
  );
}
