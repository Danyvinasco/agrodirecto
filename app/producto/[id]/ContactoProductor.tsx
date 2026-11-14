"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { enlaceWhatsApp } from "@/lib/whatsapp";

type Props = {
  productorId: string;
  productoId: number;
  producto: string;
};

// Los casos posibles. Como un enum en C#, pero cada caso puede traer sus propios datos.
type Estado =
  | { tipo: "cargando" }
  | { tipo: "visitante" }
  | { tipo: "dueno" }
  | { tipo: "listo"; nombre: string; telefono: string }
  | { tipo: "error" };

// Client Component: solo el navegador sabe si hay sesión abierta.
// El nombre y el teléfono los pide aquí, con la sesión del usuario, y Supabase (RLS)
// solo los entrega a usuarios registrados (criterio 3, Ley 1581 de 2012).
export default function ContactoProductor({ productorId, productoId, producto }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        setEstado({ tipo: "visitante" }); // criterio 4
        return;
      }
      if (sesion.session.user.id === productorId) {
        setEstado({ tipo: "dueno" }); // criterio 6
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("nombre, telefono") // solo lo necesario, nada más de la ficha
        .eq("id", productorId)
        .maybeSingle();

      if (error || !data) {
        setEstado({ tipo: "error" });
        return;
      }
      setEstado({ tipo: "listo", nombre: data.nombre, telefono: data.telefono });
    }
    cargar();
  }, [productorId]);

  const caja = "mt-4 rounded-xl border border-cafe/20 bg-white p-4";

  switch (estado.tipo) {
    case "cargando":
      return <p className={`${caja} text-cafe/70`}>Cargando contacto...</p>;

    case "visitante":
      return (
        <div className={`${caja} flex flex-col gap-3`}>
          <p>Inicia sesión o crea tu cuenta para ver quién vende y escribirle.</p>
          {/* ?volver= para regresar a este mismo producto después de entrar. */}
          <Link
            href={`/login?volver=/producto/${productoId}`}
            className="rounded-lg bg-verde py-3 text-center font-semibold text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-cafe py-3 text-center font-semibold text-white"
          >
            Crear cuenta
          </Link>
        </div>
      );

    case "dueno":
      return (
        <p className={`${caja} font-semibold`}>
          Este es tu producto. Así lo ven los compradores en el catálogo.
        </p>
      );

    case "error":
      return (
        <p className={`${caja} text-sm text-cafe/70`}>
          No pudimos cargar el contacto del productor. Recarga la página para intentarlo de nuevo.
        </p>
      );

    case "listo":
      return (
        <div className={`${caja} flex flex-col gap-3`}>
          <p>
            <span className="text-sm text-cafe/70">Vende: </span>
            <span className="font-semibold">{estado.nombre}</span>
          </p>
          {/* target="_blank": abre WhatsApp aparte y AgroDirecto queda abierto detrás.
              rel="noopener noreferrer": la otra página no puede tocar la nuestra. */}
          <a
            href={enlaceWhatsApp(estado.telefono, producto)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-verde py-3 text-center text-lg font-semibold text-white"
          >
            💬 Escribir por WhatsApp
          </a>
        </div>
      );
  }
}
