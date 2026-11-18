import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BotonSesion from "../_componentes/BotonSesion";
import AccesoPedidosRecibidos from "../_componentes/AccesoPedidosRecibidos";

export const metadata: Metadata = {
  title: "¿Qué quieres hacer hoy? · AgroDirecto",
};

// Pantalla 3 del boceto: solo la ven quienes compran y también venden.
// No necesita reaccionar a nada en vivo, así que es un Server Component con dos enlaces.
export default function PaginaElegir() {
  return (
    <main className="flex flex-1 justify-center px-4 py-10 md:items-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 md:rounded-2xl md:bg-white md:p-8 md:shadow-md">
        <div className="flex w-full justify-end">
          <BotonSesion />
        </div>
        <Image
          src="/logo.png"
          alt="AgroDirecto — Del productor a tu mesa"
          width={110}
          height={110}
          priority
        />
        <h1 className="text-center text-2xl font-bold text-cafe">¿Qué quieres hacer hoy?</h1>

        <div className="flex w-full flex-col gap-4">
          <Link
            href="/publicar"
            className="rounded-xl bg-verde py-6 text-center text-xl font-semibold text-white"
          >
            Ofertar
            <span className="block text-sm font-normal opacity-90">Publicar mis productos</span>
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-cafe py-6 text-center text-xl font-semibold text-white"
          >
            Comprar
            <span className="block text-sm font-normal opacity-90">Ver el catálogo</span>
          </Link>
          {/* HU-08: el acceso con el numerito. Es un Client Component dentro de esta
              pantalla de servidor: solo esa pieza corre en el navegador. */}
          <AccesoPedidosRecibidos forma="tarjeta" />
          {/* HU-04: ver lo publicado, quitar publicaciones y volver a publicarlas. */}
          <Link
            href="/mis-productos"
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-cafe bg-white py-5 text-xl font-semibold text-cafe"
          >
            🧺 Mis productos
          </Link>
        </div>
      </div>
    </main>
  );
}
