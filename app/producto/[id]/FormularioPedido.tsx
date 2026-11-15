"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { cantidadConUnidad, pesos } from "@/lib/formato";
import { conPuntosDeMiles, soloDigitos, validarCantidadPedido } from "@/lib/validaciones";

type Props = {
  productoId: number;
  compradorId: string;
  disponible: number;
  unidad: string;
  precio: number;
};

// Pedidos que este comprador ya tiene pendientes de este producto (para el aviso).
type Pendientes = { cuantos: number; total: number };

// Lo que se muestra después de enviar: la cantidad y el precio que guardó la base.
type Enviado = { cantidad: number; precio: number };

// HU-07: el formulario "Hacer pedido", debajo de WhatsApp.
// Solo lo ve un usuario registrado que no es el dueño: eso ya lo decide ContactoProductor.
export default function FormularioPedido({ productoId, compradorId, disponible, unidad, precio }: Props) {
  const [cantidad, setCantidad] = useState(""); // solo dígitos, ej. "50"
  const [error, setError] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<Enviado | null>(null);
  const [pendientes, setPendientes] = useState<Pendientes>({ cuantos: 0, total: 0 });

  // ¿Ya tiene pedidos pendientes de este producto? Se vuelve a preguntar tras cada pedido.
  // (Decisión de Dany: se permite pedir otra vez, pero se avisa.)
  useEffect(() => {
    async function contarPendientes() {
      const { data } = await supabase
        .from("pedidos")
        .select("cantidad")
        .eq("producto_id", productoId)
        .eq("comprador_id", compradorId)
        .eq("estado", "pendiente");
      if (!data) return; // si falla, simplemente no mostramos el aviso
      const total = data.reduce((suma, p) => suma + Number(p.cantidad), 0); // como .Sum() en C#
      setPendientes({ cuantos: data.length, total });
    }
    contarPendientes();
  }, [productoId, compradorId, enviado]);

  const valor = Number(cantidad);
  const unidadPlural = unidad === "racimo" ? "racimos" : "kg";

  async function pedir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral("");

    // Criterio 3: avisar antes de enviar, sin borrar lo escrito.
    const encontrado = validarCantidadPedido(cantidad, disponible, unidad);
    setError(encontrado ?? "");
    if (encontrado) return;

    // Criterio 6: el botón queda bloqueado mientras se envía (sin pedidos dobles por doble toque).
    setEnviando(true);

    // No mandamos el precio: lo pone el trigger revisar_pedido_nuevo (migración 09).
    // .select("precio") le pide a la base que nos devuelva el precio que guardó.
    const { data, error } = await supabase
      .from("pedidos")
      .insert({ producto_id: productoId, comprador_id: compradorId, cantidad: valor })
      .select("precio")
      .single();

    setEnviando(false);

    if (error) {
      // P0001 = el error que lanza nuestro trigger con "raise exception".
      // Su mensaje ya está en español y es claro ("Solo hay 120 kg disponibles").
      setErrorGeneral(
        error.code === "P0001"
          ? `${error.message}. Recarga la página para ver la cantidad actual.`
          : "No pudimos enviar el pedido. Revisa tu conexión e inténtalo de nuevo.",
      );
      return;
    }

    // Criterio 5: el pedido quedó pendiente.
    setEnviado({ cantidad: valor, precio: Number(data.precio) });
    setCantidad("");
  }

  // ---------- Ya se envió ----------
  if (enviado) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-verde bg-verde/10 p-4">
        <p className="font-semibold text-verde">✓ Pedido enviado</p>
        <p>
          Pediste {cantidadConUnidad(enviado.cantidad, unidad)} por {pesos(enviado.cantidad * enviado.precio)}{" "}
          aproximadamente. El productor debe aceptarlo; mientras tanto puedes escribirle por WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setEnviado(null)}
          className="self-start text-sm font-semibold text-cafe underline"
        >
          Hacer otro pedido
        </button>
      </div>
    );
  }

  // ---------- El formulario ----------
  return (
    <form onSubmit={pedir} noValidate className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-cafe">Hacer pedido</h2>

      {/* Decisión 2: se permite otro pedido, pero se avisa (amarillo banano = aviso). */}
      {pendientes.cuantos > 0 && (
        <p className="rounded-lg border border-amarillo bg-amarillo/10 p-3 text-sm">
          {pendientes.cuantos === 1
            ? `Ya tienes un pedido pendiente de ${cantidadConUnidad(pendientes.total, unidad)} de este producto.`
            : `Ya tienes ${pendientes.cuantos} pedidos pendientes de este producto por ${cantidadConUnidad(pendientes.total, unidad)} en total.`}{" "}
          Si pides de nuevo, será un pedido aparte.
        </p>
      )}

      <div>
        <label htmlFor="cantidad-pedido" className="mb-1 block font-semibold">
          ¿Cuánto quieres? ({unidadPlural})
        </label>
        <input
          id="cantidad-pedido"
          type="text"
          inputMode="numeric"
          placeholder={`Disponibles: ${conPuntosDeMiles(String(disponible))}`}
          value={conPuntosDeMiles(cantidad)}
          onChange={(e) => {
            setCantidad(soloDigitos(e.target.value));
            setError(""); // el aviso se quita apenas corrige
          }}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-base text-cafe outline-none focus:border-verde ${
            error ? "border-rojo" : "border-cafe/30"
          }`}
        />
        {/* Criterio 2: se muestra cuánto hay. */}
        <p className="mt-1 text-sm text-cafe/70">Disponibles: {cantidadConUnidad(disponible, unidad)}</p>
        {error && <p className="mt-1 text-sm text-rojo">{error}</p>}
      </div>

      {/* Criterio 4: total aproximado mientras escribe. */}
      {valor > 0 && (
        <p className="text-sm">
          Total aproximado:{" "}
          <span className="font-semibold">
            {cantidadConUnidad(valor, unidad)} × {pesos(precio)} = {pesos(valor * precio)}
          </span>
        </p>
      )}

      {errorGeneral && (
        <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">{errorGeneral}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-cafe py-3 text-lg font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Hacer pedido"}
      </button>
    </form>
  );
}
