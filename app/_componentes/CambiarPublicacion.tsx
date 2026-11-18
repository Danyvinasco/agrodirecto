"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { cantidadConUnidad } from "@/lib/formato";

type Props = {
  productoId: number;
  producto: string; // el nombre, para la pregunta de confirmación
  publicado: boolean; // cómo está AHORA: decide si el botón quita o vuelve a publicar
  cantidad: number;
  unidad: string;
  alCambiar: () => void; // qué hacer después: el detalle va a Mis productos; la lista recarga
};

// HU-04 (parte mínima): "Quitar publicación" o "Volver a publicar", con confirmación.
// Lo usan el detalle de un producto propio y cada tarjeta de Mis productos.
// En pantalla nunca se dice "despublicar" (decisión de Dany: que lo entienda un productor
// de Quinchía). Por dentro es solo la columna publicado (migración 12).
export default function CambiarPublicacion({
  productoId,
  producto,
  publicado,
  cantidad,
  unidad,
  alCambiar,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Al abrir la confirmación de "Quitar", se cuentan los pedidos pendientes para avisar (criterio 2).
  // Va aquí (al tocar el botón) y no en un efecto: solo se pregunta si de verdad lo va a quitar.
  async function abrirConfirmacion() {
    setError("");
    setConfirmando(true);
    if (!publicado) return; // al volver a publicar no hace falta el aviso
    const { count } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("producto_id", productoId)
      .eq("estado", "pendiente");
    setPendientes(count ?? 0);
  }

  async function cambiar() {
    setGuardando(true);
    setError("");

    // Solo el dueño puede: lo decide la regla "productor edita lo suyo" (migración 02).
    const { data, error } = await supabase
      .from("productos")
      .update({ publicado: !publicado })
      .eq("id", productoId)
      .select("id")
      .maybeSingle();

    setGuardando(false);

    if (error || !data) {
      setError("No pudimos guardar el cambio. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    setConfirmando(false);
    alCambiar();
  }

  if (!confirmando) {
    return (
      <>
        <button
          type="button"
          onClick={abrirConfirmacion}
          className={
            publicado
              ? "rounded-lg border border-cafe/40 py-2 font-semibold text-cafe"
              : "rounded-lg bg-verde py-2 font-semibold text-white"
          }
        >
          {publicado ? "Quitar publicación" : "Volver a publicar"}
        </button>
        {error && <p className="text-sm text-rojo">{error}</p>}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-crema p-3">
      <p className="text-sm font-semibold">
        {publicado
          ? `¿Quitar ${producto} del catálogo? Tus pedidos se conservan y puedes volver a publicarla desde Mis productos.`
          : `¿Volver a publicar ${producto}? Aparecerá otra vez en el catálogo con ${cantidadConUnidad(cantidad, unidad)} disponibles.`}
      </p>

      {/* Criterio 2: avisar si quedan pedidos por responder. Amarillo banano = aviso. */}
      {publicado && pendientes > 0 && (
        <p className="rounded-lg border border-amarillo bg-amarillo/10 p-2 text-sm">
          Tienes {pendientes} {pendientes === 1 ? "pedido pendiente" : "pedidos pendientes"} de este
          producto; puedes seguir aceptándolos o rechazándolos en Recibidos.
        </p>
      )}

      {error && <p className="text-sm text-rojo">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={cambiar}
          disabled={guardando}
          className={`rounded-lg py-3 font-semibold text-white disabled:opacity-60 ${
            publicado ? "bg-cafe" : "bg-verde"
          }`}
        >
          {guardando ? "Guardando..." : publicado ? "Sí, quitarla" : "Sí, publicar"}
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
  );
}
