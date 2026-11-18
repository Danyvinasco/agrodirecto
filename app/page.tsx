import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import AvisoPublicado from "./_componentes/AvisoPublicado";
import Bienvenida from "./_catalogo/Bienvenida";
import ListaProductos from "./_catalogo/ListaProductos";

export const metadata: Metadata = {
  title: "Catálogo · AgroDirecto",
};

// Pantalla 4 del boceto: el catálogo (HU-05). La ve cualquiera, con o sin cuenta.
// El marco (bienvenida y accesos) se prepara de antemano; la lista llega por streaming.
export default function PaginaCatalogo() {
  return (
    // pt-4 en celular: arriba se ahorra espacio para que se vea la primera tarjeta.
    // pb-28 en celular: deja espacio para que el botón fijo "Publicar producto" no tape el último producto.
    <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:py-6">
      <Bienvenida />

      {/* AvisoPublicado lee la dirección con useSearchParams: necesita su propio Suspense. */}
      <Suspense fallback={null}>
        <AvisoPublicado />
      </Suspense>

      {/* Aquí irán los filtros (paso 2). */}

      <Suspense fallback={<p className="py-10 text-center text-cafe/70">Cargando productos...</p>}>
        <ListaProductos />
      </Suspense>

      {/* Pie discreto: lo ve todo el mundo, visitante incluido (no depende de la sesión). */}
      <footer className="mt-10 text-center">
        <Link href="/sobre-nosotros" className="text-sm text-cafe/70 underline underline-offset-2">
          Sobre AgroDirecto
        </Link>
      </footer>
    </main>
  );
}
