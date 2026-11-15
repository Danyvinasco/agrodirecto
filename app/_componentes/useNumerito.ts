"use client";

import { useEffect, useState } from "react";

// Hook propio (HU-08 y HU-10): lo comparten "📥 Recibidos" y "🧾 Mis pedidos".
// Un hook es una función de React que guarda estado y efectos, y se puede reutilizar
// en varios componentes, como una clase de servicio que inyectas en varias vistas en C#.
//
// contar: la pregunta que se le hace a la base. Devuelve null si el acceso no debe
// mostrarse (por ejemplo, no hay sesión o no es productor), o el número de pedidos.
// Importante: pasar una función definida FUERA del componente, para que sea la misma
// en cada dibujo y el efecto no se repita sin necesidad.
export function useNumerito(contar: () => Promise<number | null>): number | null {
  // null = todavía no sabemos o no aplica (no se muestra nada, sin parpadeos).
  const [valor, setValor] = useState<number | null>(null);

  useEffect(() => {
    function actualizar() {
      contar().then(setValor);
    }

    // 1) Al abrir la pantalla (con cacheComponents, también al volver a ella).
    actualizar();

    // 2) Al volver a la app desde otra (por ejemplo, de WhatsApp a AgroDirecto).
    function alVolver() {
      if (document.visibilityState === "visible") actualizar();
    }
    document.addEventListener("visibilitychange", alVolver); // como += en C#

    // Al salir de la pantalla se suelta el evento (como -= en C#): un solo "mandadero".
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, [contar]);

  return valor;
}
