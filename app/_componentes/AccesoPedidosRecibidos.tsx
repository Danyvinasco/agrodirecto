"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sesionEsProductor } from "@/lib/roles";
import { contarPendientesRecibidos, textoNumerito } from "@/lib/pedidos";

type Props = {
  // "enlace": pequeño, para el encabezado del catálogo.
  // "tarjeta": grande, para la pantalla "¿Qué quieres hacer hoy?".
  forma?: "enlace" | "tarjeta";
};

// Acceso a "Pedidos recibidos" con el numerito de pendientes (HU-08, criterios 9 y 10).
// Solo lo ve quien también vende; al visitante y al comprador nunca les aparece.
export default function AccesoPedidosRecibidos({ forma = "enlace" }: Props) {
  // null = todavía no sabemos si es productor (no mostramos nada, sin parpadeos).
  const [esProductor, setEsProductor] = useState<boolean | null>(null);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    // Pregunta otra vez: ¿es productor?, ¿cuántos pendientes hay?
    function actualizar() {
      sesionEsProductor().then((vende) => {
        setEsProductor(vende);
        if (vende) contarPendientesRecibidos().then(setPendientes);
      });
    }

    // 1) Al abrir la pantalla (con cacheComponents, también al volver a ella).
    actualizar();

    // 2) Criterio 10: al volver a la app desde otra (por ejemplo, de WhatsApp a AgroDirecto).
    //    "visibilitychange" es un evento del navegador, como un event handler en C#.
    function alVolver() {
      if (document.visibilityState === "visible") actualizar();
    }
    document.addEventListener("visibilitychange", alVolver);

    // Al salir de la pantalla, se suelta el evento (como -= en C#) para no dejarlo colgado.
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, []);

  if (!esProductor) return null;

  // El numerito: verde como el de WhatsApp. Si hay 0, no aparece.
  const numerito =
    pendientes > 0 ? (
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-verde px-1.5 text-xs font-bold text-white">
        {textoNumerito(pendientes)}
      </span>
    ) : null;

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
        {numerito}
      </Link>
    );
  }

  return (
    <Link
      href="/pedidos-recibidos"
      aria-label={descripcion}
      className="flex items-center gap-1.5 text-sm font-semibold text-cafe"
    >
      📥 Pedidos
      {numerito}
    </Link>
  );
}
