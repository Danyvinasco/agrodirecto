import { textoNumerito } from "@/lib/pedidos";

// El circulito verde con el número, como el de WhatsApp. Con 0 no aparece.
// Lo usan "📥 Recibidos" y "🧾 Mis pedidos".
export default function Numerito({ cuantos }: { cuantos: number }) {
  if (cuantos <= 0) return null;
  return (
    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-verde px-1.5 text-xs font-bold text-white">
      {textoNumerito(cuantos)}
    </span>
  );
}
