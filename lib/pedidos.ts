import { supabase } from "@/lib/supabase";

// Los estados que acepta la base (triggers de la migración 03).
export type EstadoPedido = "pendiente" | "aceptado" | "rechazado" | "en_camino" | "entregado";

// Cómo se ve cada estado en pantalla: texto y color de la etiqueta.
// Las clases van completas (no armadas con pedazos) para que Tailwind las encuentre.
// Es como un Dictionary<EstadoPedido, ...> de C#, pero TypeScript exige que estén todos.
export const ESTADOS: Record<EstadoPedido, { texto: string; clase: string }> = {
  pendiente: { texto: "Pendiente", clase: "bg-amarillo/20 text-cafe" },
  aceptado: { texto: "Aceptado", clase: "bg-verde/15 text-verde" },
  rechazado: { texto: "Rechazado", clase: "bg-rojo/10 text-rojo" },
  en_camino: { texto: "En camino", clase: "bg-cafe/10 text-cafe" },
  entregado: { texto: "Entregado", clase: "bg-verde text-white" },
};

// El numerito de "Pedidos recibidos" (HU-08, criterio 9).
// Cuenta los pedidos pendientes de MIS productos. Ojo: la regla RLS de pedidos también
// me deja ver los que hice como comprador; por eso se une con productos y se filtra
// por productor_id. "!inner" = INNER JOIN: solo pedidos cuyo producto cumple el filtro.
// head: true = no trae las filas, solo el conteo (como .Count() sin .ToList() en C#).
// Devuelve 0 si no hay sesión o si falla: ante la duda, el numerito no aparece.
export async function contarPendientesRecibidos(): Promise<number> {
  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion.session) return 0;

  const { count, error } = await supabase
    .from("pedidos")
    .select("id, productos!inner(productor_id)", { count: "exact", head: true })
    .eq("estado", "pendiente")
    .eq("productos.productor_id", sesion.session.user.id);

  if (error) return 0;
  return count ?? 0;
}

// "3" o "9+": el numerito no crece sin límite, como el de WhatsApp.
export function textoNumerito(cuantos: number): string {
  return cuantos > 9 ? "9+" : String(cuantos);
}
