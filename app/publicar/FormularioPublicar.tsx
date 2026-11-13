"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MUNICIPIOS_RISARALDA } from "@/lib/municipios";
import { conPuntosDeMiles, soloDigitos, validarNumeroProducto } from "@/lib/validaciones";
import { reducirFoto } from "@/lib/reducirFoto";
import ReferenciaSipsa from "./ReferenciaSipsa";

// Nombre de la bodega de Storage (migración 08).
const BUCKET_FOTOS = "fotos-productos";

// Una fila de la tabla catalogo_productos (migración 06).
type ProductoCatalogo = {
  id: number;
  nombre: string;
  nombre_sipsa: string | null;
  usa_calidad: boolean;
};

// Los únicos valores que acepta la base de datos (check de la tabla productos).
// "" = todavía no ha escogido.
type Calidad = "" | "primera" | "segunda" | "por racimo";
const CALIDADES: { valor: Exclude<Calidad, "">; texto: string }[] = [
  { valor: "primera", texto: "Primera" },
  { valor: "segunda", texto: "Segunda" },
  { valor: "por racimo", texto: "Por racimo" },
];

// En qué punto está la pantalla mientras revisamos quién entró.
type Estado = "cargando" | "sin-permiso" | "listo" | "error";

type Campo = "producto" | "calidad" | "variedad" | "cantidad" | "precio" | "municipio" | "foto";
type Errores = Partial<Record<Campo, string>>;

const estiloCampo =
  "w-full rounded-lg border bg-white px-3 py-3 text-base text-cafe outline-none focus:border-verde";

function MensajeError({ texto }: { texto?: string }) {
  if (!texto) return null;
  return <p className="mt-1 text-sm text-rojo">{texto}</p>;
}

export default function FormularioPublicar() {
  const router = useRouter();

  const [estado, setEstado] = useState<Estado>("cargando");
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>([]);

  // Lo que va llenando el productor. Vive en el estado, así que no se borra con los errores.
  const [productoId, setProductoId] = useState(""); // el id del catálogo, como texto (así lo da el <select>)
  const [calidad, setCalidad] = useState<Calidad>("");
  const [variedad, setVariedad] = useState("");
  const [cantidad, setCantidad] = useState(""); // solo dígitos, ej. "200"
  const [precio, setPrecio] = useState(""); // solo dígitos, ej. "1500"
  const [municipio, setMunicipio] = useState("");

  // La foto ya reducida (lista para subir) y una dirección temporal para mostrarla en pantalla.
  const [foto, setFoto] = useState<Blob | null>(null);
  const [fotoVista, setFotoVista] = useState("");
  const [procesandoFoto, setProcesandoFoto] = useState(false);

  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Al aparecer la pantalla: ¿hay sesión?, ¿es productor?, y traer la lista de productos.
  // Ojo: con cacheComponents este efecto se repite cada vez que el productor vuelve a la pantalla.
  useEffect(() => {
    async function revisarEntrada() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        router.replace("/login"); // visitante sin cuenta: primero inicia sesión
        return;
      }

      // Las dos consultas salen al tiempo (como Task.WhenAll en C#).
      const [ficha, lista] = await Promise.all([
        supabase
          .from("usuarios")
          .select("es_productor, municipio")
          .eq("id", sesion.session.user.id)
          .maybeSingle(),
        supabase
          .from("catalogo_productos")
          .select("id, nombre, nombre_sipsa, usa_calidad")
          .order("id"), // el orden de la migración 06 deja "Otro" de último
      ]);

      if (ficha.error || lista.error) {
        setEstado("error");
        return;
      }
      // Criterio 6: quien solo compra no ve el formulario.
      if (!ficha.data?.es_productor) {
        setEstado("sin-permiso");
        return;
      }

      setCatalogo(lista.data);
      // Prellenar con el municipio de su ficha, pero sin pisar uno que ya haya escogido.
      // (Lo copiamos a una constante porque TypeScript no "recuerda" dentro de la flecha
      // que ficha.data ya no es null.)
      const municipioFicha: string = ficha.data.municipio;
      setMunicipio((actual) => actual || municipioFicha);
      setEstado("listo");
    }
    revisarEntrada();
  }, [router]);

  // Datos que se calculan a partir de otros (no necesitan su propio useState).
  // Es como una propiedad de solo lectura en C#: { get => ... }.
  const productoElegido = catalogo.find((p) => String(p.id) === productoId);
  const esOtro = productoElegido?.nombre === "Otro";
  const usaCalidad = productoElegido?.usa_calidad ?? false;
  const unidad = calidad === "por racimo" ? "racimo" : "kg";

  function cambiarProducto(nuevoId: string) {
    setProductoId(nuevoId);
    // Si el nuevo producto no usa calidad, borramos la que había (ej. pasó de Banano a Yuca).
    const nuevo = catalogo.find((p) => String(p.id) === nuevoId);
    if (!nuevo?.usa_calidad) setCalidad("");
  }

  function validar(): Errores {
    const e: Errores = {};
    if (!productoElegido) e.producto = "Escoge el producto.";
    if (usaCalidad && !calidad) e.calidad = "Escoge la calidad.";
    if (esOtro && variedad.trim().length < 2) e.variedad = "Escribe qué producto es.";
    const errorCantidad = validarNumeroProducto(cantidad, "la cantidad");
    if (errorCantidad) e.cantidad = errorCantidad;
    const errorPrecio = validarNumeroProducto(precio, "el precio");
    if (errorPrecio) e.precio = errorPrecio;
    if (!municipio) e.municipio = "Escoge el municipio.";
    if (!foto) e.foto = "Agrega una foto del producto.";
    return e;
  }

  // Criterio 2: el productor escoge una foto de la galería o la toma con la cámara.
  // Aquí la achicamos de una vez, así al tocar "Publicar" ya está lista.
  async function elegirFoto(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a escoger la misma foto si quiere
    if (!archivo) return; // cerró la galería sin escoger nada

    setProcesandoFoto(true);
    try {
      const reducida = await reducirFoto(archivo);
      if (fotoVista) URL.revokeObjectURL(fotoVista); // soltar la vista previa anterior
      setFoto(reducida);
      setFotoVista(URL.createObjectURL(reducida));
      setErrores((e) => ({ ...e, foto: undefined }));
    } catch {
      setErrores((e) => ({ ...e, foto: "No pudimos abrir esa foto. Prueba con otra." }));
    } finally {
      setProcesandoFoto(false);
    }
  }

  async function publicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral("");

    const encontrados = validar();
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return; // criterio 4: no se guarda, nada se borra
    if (!foto || !productoElegido) return; // ya validado; esto es para que TypeScript lo sepa

    setGuardando(true);
    const { data: sesion } = await supabase.auth.getSession();
    if (!sesion.session) {
      router.replace("/login"); // la sesión se venció mientras llenaba
      return;
    }
    const idUsuario = sesion.session.user.id;

    // 1) Subir la foto a la carpeta del productor: <id>/<momento>-<letras al azar>.jpg
    //    (No usamos crypto.randomUUID porque no funciona al probar desde el celular por http.)
    const ruta = `${idUsuario}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const subida = await supabase.storage
      .from(BUCKET_FOTOS)
      .upload(ruta, foto, { contentType: "image/jpeg" });
    if (subida.error) {
      setGuardando(false);
      setErrorGeneral("No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    const fotoUrl = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta).data.publicUrl;

    // 2) Guardar el producto. Con "Otro", lo que escribió ES el nombre del producto.
    const texto = variedad.trim();
    const { error } = await supabase.from("productos").insert({
      productor_id: idUsuario,
      producto: esOtro ? texto : productoElegido.nombre,
      variedad: esOtro || texto === "" ? null : texto,
      calidad: usaCalidad ? calidad : null,
      unidad,
      cantidad: Number(cantidad),
      precio: Number(precio),
      municipio,
      foto_url: fotoUrl,
    });

    if (error) {
      // Si no se guardó el producto, borramos la foto para que no quede huérfana en la bodega.
      await supabase.storage.from(BUCKET_FOTOS).remove([ruta]);
      setGuardando(false);
      setErrorGeneral(
        error.code === "42501" // código de Postgres cuando el portero (RLS) dice que no
          ? "Tu cuenta no tiene permiso para publicar productos."
          : "No pudimos guardar el producto. Inténtalo de nuevo; lo que llenaste sigue aquí.",
      );
      return;
    }

    // 3) Criterio 5: al catálogo. Recarga completa (no router.push) por dos razones:
    //    - el catálogo se pide de nuevo al servidor y ya trae el producto nuevo;
    //    - el formulario se borra, así si vuelve a "Publicar" lo encuentra limpio
    //      (con cacheComponents, Next solo escondería la pantalla con los datos viejos).
    //    "?publicado=1" es el "tiquete" para que el catálogo muestre el aviso verde.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/?publicado=1";
  }

  const borde = (campo: Campo) => (errores[campo] ? "border-rojo" : "border-cafe/30");

  // ---------- Pantallas antes del formulario ----------
  if (estado === "cargando") {
    return <p className="text-center text-cafe/70">Cargando...</p>;
  }

  if (estado === "error") {
    return (
      <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">
        No pudimos cargar la información. Revisa tu conexión y vuelve a abrir esta pantalla.
      </p>
    );
  }

  if (estado === "sin-permiso") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg border border-amarillo bg-white p-4">
          Tu cuenta está registrada solo para comprar. Para publicar productos necesitas
          tener activada la opción de vender.
        </p>
        <Link href="/" className="rounded-lg bg-cafe py-3 font-semibold text-white">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  // ---------- El formulario ----------
  return (
    <form onSubmit={publicar} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="producto" className="mb-1 block font-semibold">Producto</label>
        <select
          id="producto"
          value={productoId}
          onChange={(e) => cambiarProducto(e.target.value)}
          className={`${estiloCampo} ${borde("producto")}`}
        >
          <option value="">Escoge el producto</option>
          {catalogo.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <MensajeError texto={errores.producto} />
      </div>

      {/* La calidad solo aparece si el producto la usa (plátanos, banano, guineo). */}
      {usaCalidad && (
        <div>
          <label htmlFor="calidad" className="mb-1 block font-semibold">Calidad</label>
          <select
            id="calidad"
            value={calidad}
            onChange={(e) => setCalidad(e.target.value as Calidad)}
            className={`${estiloCampo} ${borde("calidad")}`}
          >
            <option value="">Escoge la calidad</option>
            {CALIDADES.map((c) => (
              <option key={c.valor} value={c.valor}>{c.texto}</option>
            ))}
          </select>
          <MensajeError texto={errores.calidad} />
        </div>
      )}

      {/* Variedad: opcional, salvo con "Otro", donde dice qué producto es. */}
      <div>
        <label htmlFor="variedad" className="mb-1 block font-semibold">
          {esOtro ? "¿Qué producto es?" : (
            <>Variedad <span className="font-normal text-cafe/70">(opcional)</span></>
          )}
        </label>
        <input
          id="variedad"
          type="text"
          maxLength={60}
          placeholder={esOtro ? "Ej: Mora de Castilla" : ""}
          value={variedad}
          onChange={(e) => setVariedad(e.target.value)}
          className={`${estiloCampo} ${borde("variedad")}`}
        />
        <MensajeError texto={errores.variedad} />
      </div>

      <div>
        <label htmlFor="cantidad" className="mb-1 block font-semibold">
          Cantidad disponible ({unidad === "kg" ? "kg" : "racimos"})
        </label>
        <input
          id="cantidad"
          type="text"
          inputMode="numeric"
          placeholder="Ej: 200"
          value={conPuntosDeMiles(cantidad)}
          onChange={(e) => setCantidad(soloDigitos(e.target.value))}
          className={`${estiloCampo} ${borde("cantidad")}`}
        />
        <MensajeError texto={errores.cantidad} />
      </div>

      <div>
        <label htmlFor="precio" className="mb-1 block font-semibold">Precio por {unidad}</label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-cafe/30 bg-crema px-3 text-base">
            $
          </span>
          <input
            id="precio"
            type="text"
            inputMode="numeric"
            placeholder="Ej: 1.500"
            value={conPuntosDeMiles(precio)}
            onChange={(e) => setPrecio(soloDigitos(e.target.value))}
            className={`${estiloCampo} rounded-l-none ${borde("precio")}`}
          />
        </div>
        <MensajeError texto={errores.precio} />
        {/* Criterio 3: referencia SIPSA al lado del precio. Informa, nunca bloquea. */}
        <ReferenciaSipsa nombreSipsa={productoElegido?.nombre_sipsa} unidad={unidad} />
      </div>

      <div>
        <label htmlFor="municipio" className="mb-1 block font-semibold">Municipio</label>
        <select
          id="municipio"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          className={`${estiloCampo} ${borde("municipio")}`}
        >
          <option value="">Escoge el municipio</option>
          {MUNICIPIOS_RISARALDA.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <MensajeError texto={errores.municipio} />
      </div>

      <div>
        <p className="mb-1 font-semibold">Foto del producto</p>
        {fotoVista && (
          // <img> normal y no <Image> de Next: la vista previa es un archivo que solo existe
          // en este celular (blob:), no una foto del servidor que Next pueda optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoVista}
            alt="Vista previa de la foto del producto"
            className="mb-2 aspect-[4/3] w-full rounded-lg object-cover"
          />
        )}
        {/* El <label> funciona como botón: al tocarlo abre el <input> escondido.
            accept="image/*" sin "capture": el celular ofrece galería O cámara. */}
        <label
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-white py-4 font-semibold ${
            errores.foto ? "border-rojo" : "border-cafe/40"
          }`}
        >
          {procesandoFoto ? "Preparando foto..." : fotoVista ? "📷 Cambiar foto" : "📷 Tomar o elegir foto"}
          <input
            type="file"
            accept="image/*"
            onChange={elegirFoto}
            disabled={procesandoFoto || guardando}
            className="sr-only"
          />
        </label>
        <MensajeError texto={errores.foto} />
      </div>

      {errorGeneral && (
        <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">{errorGeneral}</p>
      )}

      <button
        type="submit"
        disabled={guardando || procesandoFoto}
        className="rounded-lg bg-verde py-3 text-lg font-semibold text-white disabled:opacity-60"
      >
        {guardando ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}
