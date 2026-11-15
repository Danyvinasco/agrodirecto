"use client";

import Link from "next/link";
import { sesionEsProductor } from "@/lib/roles";
import { contarPendientesRecibidos } from "@/lib/pedidos";
import { useNumerito } from "./useNumerito";
import Numerito from "./Numerito";

type Props = {
  // "enlace": pequeño, para el encabezado del catálogo.
  // "tarjeta": grande, para la pantalla "¿Qué quieres hacer hoy?".
  forma?: "enlace" | "tarjeta";
};

// La pregunta para el numerito: null si no vende (el acceso no aparece),
// o cuántos pedidos pendientes tiene. Va FUERA del componente (ver useNumerito).
async function contarRecibidos(): Promise<number | null> {
  if (!(await sesionEsProductor())) return null;
  return contarPendientesRecibidos();
}

// Acceso a "Pedidos recibidos" con el numerito de pendientes (HU-08, criterios 9 y 10).
// Solo lo ve quien también vende; al visitante y al comprador nunca les aparece.
export default function AccesoPedidosRecibidos({ forma = "enlace" }: Props) {
  const pendientes = useNumerito(contarRecibidos);
  if (pendientes === null) return null;

  // Para lectores de pantalla (accesibilidad): dice el número con palabras.
  const descripcion =
    pendientes > 0
      ? `Pedidos recibidos, ${pendientes} ${pendientes === 1 ? "pendiente" : "pendientes"}`
      : "Pedidos recibidos";

  if (forma === "tarjeta") {
    return (
      <Link
        href="/pedidos-recibidos"
        aria-label={descripcion}
        className="flex items-center justify-center gap-3 rounded-xl border-2 border-cafe bg-white py-5 text-xl font-semibold text-cafe"
      >
        📥 Pedidos recibidos
        <Numerito cuantos={pendientes} />
      </Link>
    );
  }

  // Decisión de Dany (HU-10): "Recibidos" = los que me hicieron; "Mis pedidos" = los que yo hice.
  return (
    <Link
      href="/pedidos-recibidos"
      aria-label={descripcion}
      className="flex items-center gap-1.5 text-sm font-semibold text-cafe"
    >
      📥 Recibidos
      <Numerito cuantos={pendientes} />
    </Link>
  );
}
