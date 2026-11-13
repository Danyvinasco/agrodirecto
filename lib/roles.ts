// Regla de entrada según el rol (HU-01 y HU-02):
// - Solo compra      -> directo al catálogo.
// - También vende    -> se le pregunta "¿Qué quieres hacer hoy?".
// Todos los usuarios compran, así que basta con saber si también vende.
export function rutaSegunRol(esProductor: boolean): string {
  return esProductor ? "/elegir" : "/";
}
