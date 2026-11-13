"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sesionEsProductor } from "@/lib/roles";

// Botón "Publicar producto" del catálogo. Solo lo ve quien también vende.
// - En el celular: fijo abajo, al alcance del pulgar, aunque baje por la lista.
// - En computador (md: en adelante): un botón normal arriba, junto a "Cerrar sesión".
export default function BotonPublicar() {
  // Arranca en false: mientras averiguamos, no mostramos nada (sin parpadeos).
  // Al visitante y al comprador nunca les aparece.
  const [esProductor, setEsProductor] = useState(false);

  useEffect(() => {
    sesionEsProductor().then(setEsProductor);
  }, []);

  if (!esProductor) return null;

  return (
    <Link
      href="/publicar"
      className="fixed inset-x-4 bottom-4 z-10 rounded-xl bg-verde py-4 text-center text-lg font-semibold text-white shadow-lg md:static md:rounded-lg md:px-4 md:py-2 md:text-sm md:shadow-none"
    >
      + Publicar producto
    </Link>
  );
}
