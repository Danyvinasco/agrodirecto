"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { EstadoPedido } from "@/lib/pedidos";
import TarjetaMiPedido from "./TarjetaMiPedido";

// Un pedido que YO hice, con su producto y el productor que lo vende.
export type MiPedido = {
  id: number;
  created_at: string;
  cantidad: number;
  precio: number; // el precio guardado en el pedido (migración 09)
  estado: EstadoPedido;
  productos: {
    producto: string;
    variedad: string | null;
    calidad: string | null;
    unidad: string;
    productor: { nombre: string; telefono: string; municipio: string };
  };
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "visitante" }
  | { tipo: "error" }
  | { tipo: "listo"; pedidos: MiPedido[]; ahora: Date };

// Igual que en Pedidos recibidos: consulta y DEVUELVE el estado; no toca la pantalla.
async function traerMisPedidos(): Promise<Estado> {
  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion.session) return { tipo: "visitante" }; // criterio 1
  // Sin revisar el rol: todos los usuarios registrados compran.

  // Criterio 2: solo los que YO hice (comprador_id). La regla RLS también me deja ver
  // los que recibí como productor; esos van en /pedidos-recibidos, no aquí.
  // productos(... productor:usuarios!productor_id(...)): el producto y, dentro de él,
  // la ficha de quien lo vende. Es un Include().ThenInclude() de Entity Framework.
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, created_at, cantidad, precio, estado, " +
        "productos(producto, variedad, calidad, unidad, " +
        "productor:usuarios!productor_id(nombre, telefono, municipio))",
    )
    .eq("comprador_id", sesion.session.user.id)
    .order("created_at", { ascending: false });
  if (error) return { tipo: "error" };

  return { tipo: "listo", pedidos: data as unknown as MiPedido[], ahora: new Date() };
}

export default function ListaMisPedidos() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  const cargar = useCallback(() => {
    traerMisPedidos().then((nuevo) => {
      if (nuevo.tipo === "visitante") {
        router.replace("/login?volver=/mis-pedidos");
        return;
      }
      setEstado(nuevo);
    });
  }, [router]);

  useEffect(cargar, [cargar]);

  if (estado.tipo === "cargando" || estado.tipo === "visitante") {
    return <p className="text-center text-cafe/70">Cargando tus pedidos...</p>;
  }

  if (estado.tipo === "error") {
    return (
      <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">
        No pudimos cargar tus pedidos. Revisa tu conexión y vuelve a abrir esta pantalla.
      </p>
    );
  }

  const { pedidos, ahora } = estado;

  // Criterio 7: vacío amable.
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-cafe/20 bg-white p-6 text-center">
        <p>Aún no has hecho pedidos.</p>
        <Link href="/" className="rounded-lg bg-cafe px-6 py-3 font-semibold text-white">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  // Criterio 6: "En curso" con los en camino arriba (piden que confirmes);
  // luego pendientes y aceptados. "Anteriores": entregados y rechazados.
  // Todos ya vienen del más reciente al más viejo.
  const enCamino = pedidos.filter((p) => p.estado === "en_camino");
  const esperando = pedidos.filter((p) => p.estado === "pendiente" || p.estado === "aceptado");
  const enCurso = [...enCamino, ...esperando]; // "..." junta las dos listas, como Concat() en C#
  const anteriores = pedidos.filter((p) => p.estado === "entregado" || p.estado === "rechazado");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-bold text-cafe">En curso ({enCurso.length})</h2>
        {enCurso.length === 0 ? (
          <p className="text-cafe/70">No tienes pedidos en curso.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {enCurso.map((p) => (
              <TarjetaMiPedido key={p.id} pedido={p} ahora={ahora} alCambiar={cargar} />
            ))}
          </div>
        )}
      </section>

      {anteriores.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-cafe">Anteriores</h2>
          <div className="flex flex-col gap-4">
            {anteriores.map((p) => (
              <TarjetaMiPedido key={p.id} pedido={p} ahora={ahora} alCambiar={cargar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
