import { supabase } from "@/lib/supabase";

// Regla de entrada según el rol (HU-01 y HU-02):
// - Solo compra      -> directo al catálogo.
// - También vende    -> se le pregunta "¿Qué quieres hacer hoy?".
// Todos los usuarios compran, así que basta con saber si también vende.
export function rutaSegunRol(esProductor: boolean): string {
  return esProductor ? "/elegir" : "/";
}

// ¿Quien tiene la sesión abierta en este celular también vende?
// Devuelve false si no hay sesión, si no encuentra la ficha o si falla la conexión:
// ante la duda, se trata como comprador (todos pueden comprar).
// Ojo: esto solo decide qué botones mostrar. La seguridad real la ponen las reglas RLS.
export async function sesionEsProductor(): Promise<boolean> {
  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion.session) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("es_productor")
    .eq("id", sesion.session.user.id)
    .maybeSingle();
  return data?.es_productor ?? false;
}
