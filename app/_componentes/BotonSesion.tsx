"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Botón pequeño para la esquina de la pantalla:
// - con sesión abierta muestra "Cerrar sesión";
// - sin sesión (visitante) muestra el enlace "Iniciar sesión".
// La carpeta empieza con "_" para que Next.js no la convierta en una ruta (/_componentes).
export default function BotonSesion() {
  // null = todavía no sabemos si hay sesión (no mostramos nada para evitar parpadeos).
  const [conSesion, setConSesion] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setConSesion(data.session !== null));
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    // Recarga completa (no router.push): con cacheComponents, Next 16 esconde las pantallas
    // en vez de desmontarlas y guarda su estado (correo, contraseña, "Entrando...").
    // Recargar borra todo lo que dejó el usuario anterior en este celular.
    // La guía "preserving-ui-state" de Next 16 recomienda la recarga completa para cerrar sesión.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  if (conSesion === null) return null;

  if (!conSesion) {
    return (
      <Link href="/login" className="text-sm font-semibold text-verde underline">
        Iniciar sesión
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      className="rounded-lg border border-cafe/40 px-3 py-1 text-sm font-semibold text-cafe"
    >
      Cerrar sesión
    </button>
  );
}
