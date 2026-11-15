import type { Metadata } from "next";
import Link from "next/link";
import BotonSesion from "../_componentes/BotonSesion";
import ListaMisPedidos from "./ListaMisPedidos";

export const metadata: Metadata = {
  title: "Mis pedidos · AgroDirecto",
};

// Pantalla 7 del boceto (HU-10). Server Component: solo el marco, igual que /pedidos-recibidos.
// La lista vive en ListaMisPedidos (Client Component), porque necesita la sesión del celular.
export default function PaginaMisPedidos() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        {/* Todos compran: la flecha vuelve al catálogo. */}
        <Link href="/" aria-label="Volver al catálogo" className="text-2xl font-bold text-cafe">
          ←
        </Link>
        <BotonSesion />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-cafe">Mis pedidos</h1>

      <ListaMisPedidos />
    </main>
  );
}
