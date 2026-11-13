import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import BotonSesion from "./_componentes/BotonSesion";
import BotonPublicar from "./_componentes/BotonPublicar";
import AvisoPublicado from "./_componentes/AvisoPublicado";
import ListaProductos from "./_catalogo/ListaProductos";

export const metadata: Metadata = {
  title: "Catálogo · AgroDirecto",
};

// Pantalla 4 del boceto: el catálogo (HU-05). La ve cualquiera, con o sin cuenta.
// El marco (logo, título, botones) se prepara de antemano; la lista llega por streaming.
export default function PaginaCatalogo() {
  return (
    // pb-28 en celular: deja espacio para que el botón fijo "Publicar producto" no tape el último producto.
    <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:pb-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="AgroDirecto" width={44} height={44} priority />
          <h1 className="text-2xl font-bold text-cafe">Catálogo</h1>
        </div>
        <div className="flex items-center gap-3">
          <BotonPublicar />
          <BotonSesion />
        </div>
      </header>

      {/* AvisoPublicado lee la dirección con useSearchParams: necesita su propio Suspense. */}
      <Suspense fallback={null}>
        <AvisoPublicado />
      </Suspense>

      {/* Aquí irán los filtros (paso 2). */}

      <Suspense fallback={<p className="py-10 text-center text-cafe/70">Cargando productos...</p>}>
        <ListaProductos />
      </Suspense>
    </main>
  );
}
