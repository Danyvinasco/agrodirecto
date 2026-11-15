import type { Metadata } from "next";
import Link from "next/link";
import BotonSesion from "../_componentes/BotonSesion";
import ListaPedidosRecibidos from "./ListaPedidosRecibidos";

export const metadata: Metadata = {
  title: "Pedidos recibidos · AgroDirecto",
};

// HU-08. Server Component: solo el marco (flecha, título, botón de sesión), igual que /publicar.
// Quién puede entrar y la lista viven en ListaPedidosRecibidos (Client Component),
// porque la sesión se guarda en el celular y solo el navegador la conoce.
export default function PaginaPedidosRecibidos() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/elegir" aria-label="Volver" className="text-2xl font-bold text-cafe">
          ←
        </Link>
        <BotonSesion />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-cafe">Pedidos recibidos</h1>

      <ListaPedidosRecibidos />
    </main>
  );
}
