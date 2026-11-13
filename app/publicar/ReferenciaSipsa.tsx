"use client";

import { useEffect, useState } from "react";
import { buscarReferencia, formatearSemana, type Referencia } from "@/lib/precioReferencia";
import { pesos } from "@/lib/formato";

type Props = {
  // undefined = todavía no escogió producto (no mostramos nada).
  // null = el producto no tiene nombre SIPSA (Café, Otro).
  nombreSipsa: string | null | undefined;
  unidad: "kg" | "racimo";
};

// Lo que respondió la base, junto con el producto por el que se preguntó.
// Si el productor cambió de producto y la respuesta es de otro, sabemos que está "cargando".
type Respuesta =
  | { para: string; tipo: "listo"; referencia: Referencia | null }
  | { para: string; tipo: "error" };

export default function ReferenciaSipsa({ nombreSipsa, unidad }: Props) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (!nombreSipsa) return;
    // Si el productor cambia de producto antes de que llegue la respuesta,
    // ignoramos la vieja para no mostrar el precio de otro producto.
    let vigente = true;
    buscarReferencia(nombreSipsa)
      .then((referencia) => {
        if (vigente) setRespuesta({ para: nombreSipsa, tipo: "listo", referencia });
      })
      .catch(() => {
        if (vigente) setRespuesta({ para: nombreSipsa, tipo: "error" });
      });
    return () => {
      vigente = false;
    };
  }, [nombreSipsa]);

  if (nombreSipsa === undefined) return null;

  const caja = "mt-2 rounded-lg border border-cafe/20 bg-white p-3 text-sm";

  if (nombreSipsa === null) {
    return <p className={caja}>No hay precio de referencia SIPSA para este producto.</p>;
  }

  if (respuesta?.para !== nombreSipsa) {
    return <p className={`${caja} text-cafe/70`}>Buscando precio de referencia...</p>;
  }

  if (respuesta.tipo === "error") {
    return (
      <p className={`${caja} text-cafe/70`}>
        No pudimos consultar el precio de referencia. Puedes publicar de todas formas.
      </p>
    );
  }

  const ref = respuesta.referencia;
  if (!ref) {
    return <p className={caja}>No hay precio de referencia SIPSA para este producto.</p>;
  }

  return (
    <div className={caja}>
      <p className="font-semibold">
        Referencia SIPSA en {ref.ciudad}: {pesos(ref.minimo)} – {pesos(ref.maximo)} por kg
      </p>
      <p className="text-cafe/70">
        {ref.ciudad !== "Pereira" && "No hay dato de Pereira. "}
        {ref.mercados.join(" y ")} · semana {formatearSemana(ref.fechaInicio, ref.fechaFin)}
      </p>
      {unidad === "racimo" && (
        <p className="mt-1 text-cafe/70">
          Ojo: SIPSA reporta el precio por kg, no por racimo.
        </p>
      )}
      <p className="mt-1 text-cafe/70">El precio lo decides tú.</p>
    </div>
  );
}
