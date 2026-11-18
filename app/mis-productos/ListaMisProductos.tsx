"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TarjetaMiProducto from "./TarjetaMiProducto";

// Un producto mío, publicado o no (columnas de la tabla productos).
export type MiProducto = {
  id: number;
  producto: string;
  variedad: string | null;
  calidad: string | null;
  cantidad: number;
  precio: number;
  unidad: string;
  foto_url: string | null;
  publicado: boolean;
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "visitante" }
  | { tipo: "sin-permiso" }
  | { tipo: "error" }
  | { tipo: "listo"; productos: MiProducto[] };

// Igual que en las pantallas de pedidos: consulta y DEVUELVE el estado; no toca la pantalla.
async function traerMisProductos(): Promise<Estado> {
  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion.session) return { tipo: "visitante" };
  const idUsuario = sesion.session.user.id;

  const { data: ficha, error: errorFicha } = await supabase
    .from("usuarios")
    .select("es_productor")
    .eq("id", idUsuario)
    .maybeSingle();
  if (errorFicha) return { tipo: "error" };
  if (!ficha?.es_productor) return { tipo: "sin-permiso" };

  // Criterio 7: TODAS mis publicaciones (sin filtrar por publicado ni por cantidad).
  const { data, error } = await supabase
    .from("productos")
    .select("id, producto, variedad, calidad, cantidad, precio, unidad, foto_url, publicado")
    .eq("productor_id", idUsuario)
    .order("created_at", { ascending: false });
  if (error) return { tipo: "error" };

  return { tipo: "listo", productos: data as MiProducto[] };
}

export default function ListaMisProductos() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  const cargar = useCallback(() => {
    traerMisProductos().then((nuevo) => {
      if (nuevo.tipo === "visitante") {
        router.replace("/login?volver=/mis-productos");
        return;
      }
      setEstado(nuevo);
    });
  }, [router]);

  useEffect(cargar, [cargar]);

  if (estado.tipo === "cargando" || estado.tipo === "visitante") {
    return <p className="text-center text-cafe/70">Cargando tus productos...</p>;
  }

  if (estado.tipo === "error") {
    return (
      <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">
        No pudimos cargar tus productos. Revisa tu conexión y vuelve a abrir esta pantalla.
      </p>
    );
  }

  if (estado.tipo === "sin-permiso") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg border border-amarillo bg-white p-4">
          Tu cuenta está registrada solo para comprar. Para publicar productos necesitas tener
          activada la opción de vender.
        </p>
        <Link href="/" className="rounded-lg bg-cafe py-3 font-semibold text-white">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  // Criterio 10: vacío amable.
  if (estado.productos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-cafe/20 bg-white p-6 text-center">
        <p>Aún no has publicado productos.</p>
        <Link href="/publicar" className="rounded-lg bg-verde px-6 py-3 font-semibold text-white">
          Publicar producto
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {estado.productos.map((p) => (
        <TarjetaMiProducto key={p.id} producto={p} alCambiar={cargar} />
      ))}
    </div>
  );
}
