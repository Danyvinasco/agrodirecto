import type { Metadata } from "next";
import Image from "next/image";
import FormularioLogin from "./FormularioLogin";

export const metadata: Metadata = {
  title: "Inicia sesión · AgroDirecto",
};

// Server Component: el "marco" de la pantalla (logo y título).
// El formulario, que reacciona en vivo, está en FormularioLogin.
export default function PaginaLogin() {
  return (
    <main className="flex flex-1 justify-center px-4 py-10 md:items-center">
      <div className="w-full max-w-md md:rounded-2xl md:bg-white md:p-8 md:shadow-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="AgroDirecto — Del productor a tu mesa"
            width={130}
            height={130}
            priority
          />
          <h1 className="text-2xl font-bold text-cafe">Inicia sesión</h1>
        </div>

        <FormularioLogin />
      </div>
    </main>
  );
}
