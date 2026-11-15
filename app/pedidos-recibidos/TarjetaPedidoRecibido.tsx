"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ESTADOS } from "@/lib/pedidos";
import { cantidadConUnidad, haceCuanto, pesos, textoCalidad } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import type { PedidoRecibido } from "./ListaPedidosRecibidos";

type Props = {
  pedido: PedidoRecibido;
  ahora: Date;
  alCambiar: () => void; // la lista vuelve a cargar (el inventario y los avisos cambian)
};

// Lo que puede hacer el productor con un pedido:
// pendiente -> "aceptado" o "rechazado" (HU-08); aceptado -> "en_camino" (HU-09).
type Respuesta = "aceptado" | "rechazado" | "en_camino";

export default function TarjetaPedidoRecibido({ pedido, ahora, alCambiar }: Props) {
  // null = mostrando los botones; "aceptado"/"rechazado" = preguntando "¿Seguro?".
  const [confirmando, setConfirmando] = useState<Respuesta | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const { productos: prod, comprador } = pedido;
  const cantidad = Number(pedido.cantidad);
  const precio = Number(pedido.precio);
  const quedan = Number(prod.cantidad);
  const esPendiente = pedido.estado === "pendiente";
  const esAceptado = pedido.estado === "aceptado"; // HU-09: listo para despachar
  // Criterio 6: avisar antes de tocar el botón si ya no alcanza.
  const noAlcanza = esPendiente && cantidad > quedan;
  const etiqueta = ESTADOS[pedido.estado];
  const cuanto = cantidadConUnidad(cantidad, prod.unidad);

  // La pregunta "¿Seguro?" y el botón de cada acción. Todas son definitivas.
  const CONFIRMAR: Record<Respuesta, { pregunta: string; boton: string; color: string }> = {
    aceptado: {
      pregunta: `¿Aceptar ${cuanto} para ${comprador.nombre}? Se descontarán de tu inventario.`,
      boton: "Sí, aceptar",
      color: "bg-verde",
    },
    rechazado: {
      pregunta: `¿Rechazar el pedido de ${comprador.nombre}? No se puede deshacer.`,
      boton: "Sí, rechazar",
      color: "bg-rojo",
    },
    en_camino: {
      pregunta: `¿Ya despachaste ${cuanto} para ${comprador.nombre}? Después solo ${comprador.nombre} puede cerrar el pedido, confirmando que lo recibió.`,
      boton: "Sí, ya salió",
      color: "bg-verde",
    },
  };

  async function responder(respuesta: Respuesta) {
    setGuardando(true); // criterio 7: botones bloqueados mientras se guarda
    setError("");

    // Solo se manda el estado: es la única columna que deja tocar la migración 10.
    // Al pasar a "aceptado", el trigger descontar_inventario resta del producto.
    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado: respuesta })
      .eq("id", pedido.id)
      .select("id")
      .maybeSingle();

    setGuardando(false);
    setConfirmando(null);

    if (error) {
      // P0001 = mensaje de nuestros triggers ("Solo hay 120 kg disponibles"). Criterio 5.
      setError(
        error.code === "P0001"
          ? `${error.message}.`
          : "No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.",
      );
      return;
    }
    if (!data) {
      // Sin error pero sin fila: el portero (RLS) no dejó cambiarlo.
      setError("No pudimos cambiar este pedido. Recarga la pantalla.");
      return;
    }
    alCambiar(); // recargar: el pedido cambia de sección y el inventario bajó
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-cafe/20 bg-white p-4">
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

      {/* Criterio 2. El precio es el guardado en el pedido, no el de hoy. */}
      <p>
        <span className="font-semibold">{cantidadConUnidad(cantidad, prod.unidad)}</span> ×{" "}
        {pesos(precio)} = <span className="font-semibold">{pesos(cantidad * precio)}</span>
      </p>
      <p className="text-sm">
        Pide: <span className="font-semibold">{comprador.nombre}</span> · 📍 {comprador.municipio}
      </p>
      <p className="text-sm text-cafe/60">{haceCuanto(pedido.created_at, ahora, "Pedido")}</p>

      {noAlcanza && (
        <p className="rounded-lg border border-amarillo bg-amarillo/10 p-3 text-sm">
          {quedan > 0
            ? `No alcanza: te quedan ${cantidadConUnidad(quedan, prod.unidad)}.`
            : "No alcanza: ya no te queda de este producto."}{" "}
          Recházalo o escríbele al comprador para cuadrar.
        </p>
      )}

      {error && <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">{error}</p>}

      {/* Decisión de Dany: WhatsApp al comprador para cuadrar pago y entrega (la app no los maneja). */}
      <a
        href={enlaceWhatsApp(comprador.telefono, prod.producto, "pedido")}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-verde py-2 text-center font-semibold text-verde"
      >
        💬 Escribir al comprador
      </a>

      {/* Criterio 4: los botones, con confirmación en la misma tarjeta. */}
      {esPendiente && confirmando === null && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmando("aceptado")}
            disabled={noAlcanza}
            className="rounded-lg bg-verde py-3 font-semibold text-white disabled:opacity-40"
          >
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando("rechazado")}
            className="rounded-lg bg-cafe py-3 font-semibold text-white"
          >
            Rechazar
          </button>
        </div>
      )}

      {/* HU-09, criterio 2: el pedido aceptado se marca en camino cuando sale de la finca. */}
      {esAceptado && confirmando === null && (
        <button
          type="button"
          onClick={() => setConfirmando("en_camino")}
          className="rounded-lg bg-verde py-3 font-semibold text-white"
        >
          🚚 Marcar en camino
        </button>
      )}

      {confirmando !== null && (
        <div className="flex flex-col gap-3 rounded-lg bg-crema p-3">
          <p className="text-sm font-semibold">{CONFIRMAR[confirmando].pregunta}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => responder(confirmando)}
              disabled={guardando}
              className={`rounded-lg py-3 font-semibold text-white disabled:opacity-60 ${CONFIRMAR[confirmando].color}`}
            >
              {guardando ? "Guardando..." : CONFIRMAR[confirmando].boton}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(null)}
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
