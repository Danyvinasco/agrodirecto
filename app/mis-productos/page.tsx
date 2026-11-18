import type { Metadata } from "next";
import Link from "next/link";
import BotonSesion from "../_componentes/BotonSesion";
import ListaMisProductos from "./ListaMisProductos";

export const metadata: Metadata = {
  title: "Mis productos · AgroDirecto",
};

// HU-04 (parte mínima). Server Component: solo el marco, igual que Pedidos recibidos.
// La lista vive en ListaMisProductos (Client Component), porque necesita la sesión del celular.
export default function PaginaMisProductos() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/elegir" aria-label="Volver" className="text-2xl font-bold text-cafe">
          ←
        </Link>
        <BotonSesion />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-cafe">Mis productos</h1>

      <ListaMisProductos />
    </main>
  );
}
