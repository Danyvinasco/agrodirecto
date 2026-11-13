import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "¿Qué quieres hacer hoy? · AgroDirecto",
};

// Pantalla 3 del boceto: solo la ven quienes compran y también venden.
// No necesita reaccionar a nada en vivo, así que es un Server Component con dos enlaces.
export default function PaginaElegir() {
  return (
    <main className="flex flex-1 justify-center px-4 py-10 md:items-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 md:rounded-2xl md:bg-white md:p-8 md:shadow-md">
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
        </div>
      </div>
    </main>
  );
}
