import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FormularioRegistro from "./FormularioRegistro";

export const metadata: Metadata = {
  title: "Crea tu cuenta · AgroDirecto",
};

// Server Component: solo arma el "marco" de la pantalla (flecha, logo y título).
// La parte que reacciona a lo que escribe la persona vive en FormularioRegistro (Client Component).
export default function PaginaRegistro() {
  return (
    <main className="flex flex-1 justify-center px-4 py-6 md:items-center">
      <div className="w-full max-w-md md:rounded-2xl md:bg-white md:p-8 md:shadow-md">
        <Link
          href="/"
          aria-label="Volver"
          className="text-2xl font-bold text-cafe"
        >
          ←
        </Link>

        <div className="mb-6 flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="AgroDirecto — Del productor a tu mesa"
            width={110}
            height={110}
            priority
          />
          <h1 className="text-2xl font-bold text-cafe">Crea tu cuenta</h1>
        </div>

        <FormularioRegistro />
      </div>
    </main>
  );
}
