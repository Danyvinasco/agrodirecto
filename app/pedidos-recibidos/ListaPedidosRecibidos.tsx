"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { EstadoPedido } from "@/lib/pedidos";
import TarjetaPedidoRecibido from "./TarjetaPedidoRecibido";

// Un pedido con los datos de su producto y de su comprador, como llega de Supabase.
// Lo exporta para que la tarjeta use el mismo tipo (como un DTO compartido en C#).
export type PedidoRecibido = {
  id: number;
  created_at: string;
  cantidad: number;
  precio: number; // el precio guardado en el pedido (migración 09), no el actual del producto
  estado: EstadoPedido;
  comprador: { nombre: string; telefono: string; municipio: string };
  productos: {
    producto: string;
    variedad: string | null;
    calidad: string | null;
    unidad: string;
    cantidad: number; // lo que le queda al productor HOY (para el aviso "No alcanza")
  };
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "visitante" }
  | { tipo: "sin-permiso" }
  | { tipo: "error" }
  | { tipo: "listo"; pedidos: PedidoRecibido[]; ahora: Date };

// Va a la base y DEVUELVE en qué estado debe quedar la pantalla; no la cambia ella misma.
// Así el componente decide qué hacer con la respuesta (como un método de servicio en C#
// que devuelve un resultado en vez de tocar la vista).
async function traerPedidos(): Promise<Estado> {
  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion.session) return { tipo: "visitante" }; // criterio 1
  const idUsuario = sesion.session.user.id;

  const { data: ficha, error: errorFicha } = await supabase
    .from("usuarios")
    .select("es_productor")
    .eq("id", idUsuario)
    .maybeSingle();
  if (errorFicha) return { tipo: "error" };
  if (!ficha?.es_productor) return { tipo: "sin-permiso" }; // criterio 1

  // Una sola consulta trae el pedido, su producto y su comprador (como un Include() de EF).
  // - productos!inner + filtro productor_id: solo pedidos de MIS productos (ver lib/pedidos.ts).
  // - comprador:usuarios!comprador_id: la ficha de quien pidió, con el alias "comprador".
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, created_at, cantidad, precio, estado, " +
        "comprador:usuarios!comprador_id(nombre, telefono, municipio), " +
        "productos!inner(productor_id, producto, variedad, calidad, unidad, cantidad)",
    )
    .eq("productos.productor_id", idUsuario)
    .order("created_at", { ascending: false });
  if (error) return { tipo: "error" };

  // Sin tipos generados, TypeScript no sabe la forma exacta: se la decimos nosotros.
  const pedidos = data as unknown as PedidoRecibido[];
  // La hora se toma aquí (en el navegador) y no al dibujar, para que todas las tarjetas
  // usen la misma y "Pedido hace X días" no cambie entre un dibujo y otro.
  return { tipo: "listo", pedidos, ahora: new Date() };
}

export default function ListaPedidosRecibidos() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  // Pide los pedidos y aplica la respuesta cuando llega.
  // useCallback guarda la misma función entre dibujos: la usa el efecto y también
  // cada tarjeta, para recargar después de aceptar o rechazar.
  const cargar = useCallback(() => {
    traerPedidos().then((nuevo) => {
      if (nuevo.tipo === "visitante") {
        router.replace("/login?volver=/pedidos-recibidos");
        return;
      }
      setEstado(nuevo);
    });
  }, [router]);

  // Con cacheComponents este efecto se repite cada vez que el productor vuelve a la pantalla,
  // así la lista siempre está fresca.
  useEffect(cargar, [cargar]);

  if (estado.tipo === "cargando" || estado.tipo === "visitante") {
    return <p className="text-center text-cafe/70">Cargando pedidos...</p>;
  }

  if (estado.tipo === "error") {
    return (
      <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">
        No pudimos cargar tus pedidos. Revisa tu conexión y vuelve a abrir esta pantalla.
      </p>
    );
  }

  if (estado.tipo === "sin-permiso") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg border border-amarillo bg-white p-4">
          Tu cuenta está registrada solo para comprar. Para recibir pedidos necesitas tener
          activada la opción de vender.
        </p>
        <Link href="/" className="rounded-lg bg-cafe py-3 font-semibold text-white">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  const { pedidos, ahora } = estado;

  // Criterio 8: vacío amable.
  if (pedidos.length === 0) {
    return (
      <p className="rounded-xl border border-cafe/20 bg-white p-6 text-center">
        Aún no tienes pedidos. Cuando un comprador te pida, aparecerá aquí.
      </p>
    );
  }

  // Criterio 3: pendientes arriba, el más viejo primero (que nadie espere de más).
  // Los demás, del más reciente al más viejo (así ya vienen de la base).
  // [...x].reverse() copia antes de voltear: reverse() solo cambiaría el original.
  const pendientes = [...pedidos.filter((p) => p.estado === "pendiente")].reverse();
  const anteriores = pedidos.filter((p) => p.estado !== "pendiente");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-bold text-cafe">Por responder ({pendientes.length})</h2>
        {pendientes.length === 0 ? (
          <p className="text-cafe/70">No tienes pedidos por responder. ¡Al día!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {pendientes.map((p) => (
              <TarjetaPedidoRecibido key={p.id} pedido={p} ahora={ahora} alCambiar={cargar} />
            ))}
          </div>
        )}
      </section>

      {anteriores.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-cafe">Anteriores</h2>
          <div className="flex flex-col gap-4">
            {anteriores.map((p) => (
              <TarjetaPedidoRecibido key={p.id} pedido={p} ahora={ahora} alCambiar={cargar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
