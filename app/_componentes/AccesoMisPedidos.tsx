"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { contarEnCaminoMisPedidos } from "@/lib/pedidos";
import { useNumerito } from "./useNumerito";
import Numerito from "./Numerito";

// La pregunta para el numerito: null si no hay sesión (el visitante no ve el acceso),
// o cuántos de mis pedidos van en camino (los que me toca confirmar).
async function contarMisPedidos(): Promise<number | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return contarEnCaminoMisPedidos();
}

// Acceso a "Mis pedidos" (HU-10, criterio 8) para todo usuario registrado.
// El numerito cuenta los que van en camino: si nadie confirma, la venta no se cierra.
export default function AccesoMisPedidos() {
  const enCamino = useNumerito(contarMisPedidos);
  if (enCamino === null) return null;

  // Para lectores de pantalla (accesibilidad): dice el número con palabras.
  const descripcion = enCamino > 0 ? `Mis pedidos, ${enCamino} por confirmar` : "Mis pedidos";

  return (
    <Link
      href="/mis-pedidos"
      aria-label={descripcion}
      className="flex items-center gap-1.5 text-sm font-semibold text-cafe"
    >
      🧾 Mis pedidos
      <Numerito cuantos={enCamino} />
    </Link>
  );
}
