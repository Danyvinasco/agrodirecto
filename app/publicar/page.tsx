import type { Metadata } from "next";
import Link from "next/link";
import BotonSesion from "../_componentes/BotonSesion";
import FormularioPublicar from "./FormularioPublicar";

export const metadata: Metadata = {
  title: "Publicar producto · AgroDirecto",
};

// Pantalla 6 del boceto. Server Component: solo el marco (flecha, título, botón de sesión).
// Quién puede publicar y el formulario en sí viven en FormularioPublicar (Client Component),
// porque la sesión se guarda en el celular y solo el navegador la conoce.
export default function PaginaPublicar() {
  return (
    <main className="flex flex-1 justify-center px-4 py-6 md:items-center">
      <div className="w-full max-w-md md:rounded-2xl md:bg-white md:p-8 md:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/elegir" aria-label="Volver" className="text-2xl font-bold text-cafe">
            ←
          </Link>
          <BotonSesion />
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-cafe">Publicar producto</h1>

        <FormularioPublicar />
      </div>
    </main>
  );
}
