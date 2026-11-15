"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ESTADOS, FRASE_COMPRADOR } from "@/lib/pedidos";
import { cantidadConUnidad, haceCuanto, pesos, textoCalidad } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import type { MiPedido } from "./ListaMisPedidos";

type Props = {
  pedido: MiPedido;
  ahora: Date;
  alCambiar: () => void; // la lista vuelve a cargar después de confirmar
};

export default function TarjetaMiPedido({ pedido, ahora, alCambiar }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const { productos: prod } = pedido;
  const cantidad = Number(pedido.cantidad);
  const precio = Number(pedido.precio);
  const cuanto = cantidadConUnidad(cantidad, prod.unidad);
  const etiqueta = ESTADOS[pedido.estado];
  const enCamino = pedido.estado === "en_camino"; // el único estado donde el comprador actúa

  // HU-09, criterios 4 y 5: el comprador cierra el pedido.
  async function confirmarRecibido() {
    setGuardando(true);
    setError("");

    // Solo se manda el estado (migración 10). La migración 11 exige que sea MI pedido
    // y el trigger exige que venga de "en_camino".
    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado: "entregado" })
      .eq("id", pedido.id)
      .select("id")
      .maybeSingle();

    setGuardando(false);
    setConfirmando(false);

    if (error) {
      setError(
        error.code === "P0001"
          ? `${error.message}. Recarga la pantalla.` // ej. "No se puede pasar de aceptado a entregado"
          : "No pudimos guardar tu confirmación. Revisa tu conexión e inténtalo de nuevo.",
      );
      return;
    }
    if (!data) {
      setError("No pudimos cambiar este pedido. Recarga la pantalla.");
      return;
    }
    alCambiar(); // pasa a "Anteriores" como Entregado
  }

  return (
    // Borde verde en los que esperan tu confirmación, para que se noten.
    <article
      className={`flex flex-col gap-3 rounded-xl bg-white p-4 ${
        enCamino ? "border-2 border-verde" : "border border-cafe/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold leading-tight text-cafe">
          {prod.producto}
          {prod.variedad && <span className="font-normal"> · {prod.variedad}</span>}
          {prod.calidad && <span className="font-normal"> · {textoCalidad(prod.calidad)}</span>}
        </h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${etiqueta.clase}`}>
          {etiqueta.texto}
        </span>
      </div>

      {/* Criterio 4: en qué va el pedido, en palabras sencillas. */}
      <p className="text-sm font-semibold">{FRASE_COMPRADOR[pedido.estado]}</p>

      {/* Criterio 3. El precio es el guardado en el pedido, no el de hoy. */}
      <p>
        <span className="font-semibold">{cuanto}</span> × {pesos(precio)} ={" "}
        <span className="font-semibold">{pesos(cantidad * precio)}</span>
      </p>
      <p className="text-sm">
        Vende: <span className="font-semibold">{prod.productor.nombre}</span> · 📍 {prod.productor.municipio}
      </p>
      <p className="text-sm text-cafe/60">{haceCuanto(pedido.created_at, ahora, "Pedido")}</p>

      {error && <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">{error}</p>}

      {/* Criterio 5: escribirle al productor sobre este pedido. */}
      <a
        href={enlaceWhatsApp(prod.productor.telefono, prod.producto, "mi-pedido")}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-verde py-2 text-center font-semibold text-verde"
      >
        💬 Escribir al productor
      </a>

      {enCamino && !confirmando && (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="rounded-lg bg-verde py-3 font-semibold text-white"
        >
          📦 Ya lo recibí
        </button>
      )}

      {enCamino && confirmando && (
        <div className="flex flex-col gap-3 rounded-lg bg-crema p-3">
          <p className="text-sm font-semibold">
            ¿Confirmas que recibiste {cuanto} de {prod.producto}? No se puede deshacer.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={confirmarRecibido}
              disabled={guardando}
              className="rounded-lg bg-verde py-3 font-semibold text-white disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Sí, lo recibí"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={guardando}
              className="rounded-lg border border-cafe/40 py-3 font-semibold text-cafe"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
