import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BotonSesion from "../../_componentes/BotonSesion";
import DetalleProducto from "./DetalleProducto";

export const metadata: Metadata = {
  title: "Detalle del producto · AgroDirecto",
};

// Pantalla 5 del boceto (HU-06). La carpeta [id] hace que /producto/12 llegue aquí con id = "12".
// El marco (flecha y botón de sesión) se prepara de antemano. El id solo se conoce en cada
// visita, por eso lo que lo usa va dentro de <Suspense> (lo pide Next 16 con cacheComponents).
export default function PaginaProducto({ params }: PageProps<"/producto/[id]">) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-cafe">
          ← Volver al catálogo
        </Link>
        <BotonSesion />
      </div>

      <Suspense fallback={<p className="py-10 text-center text-cafe/70">Cargando producto...</p>}>
        {/* params es una promesa: le pasamos el id a DetalleProducto cuando llegue. */}
        {params.then(({ id }) => (
          <DetalleProducto id={id} />
        ))}
      </Suspense>
    </main>
  );
}
