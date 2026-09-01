// El buscador de másteres: el catálogo final.
//
// Es el que contesta la pregunta que de verdad se hace delante de un asesorado:
// «con este presupuesto, en esta comunidad, y con este perfil, ¿qué puede
// estudiar y le da tiempo a postular?». Un listado de nombres de máster no lo
// contesta: hace falta el precio real, la ciudad y si el plazo sigue abierto,
// y eso vive en la universidad, no en el máster.
//
// Por eso el servidor devuelve cada máster con lo heredado ya resuelto. Aquí no
// se recalcula nada: si la pantalla y el informe hicieran sus propias cuentas,
// tarde o temprano dirían importes distintos del mismo máster.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import MapaDelCatalogo from "./MapaDelCatalogo";

const RAMA_ETIQ = {
  ARTES_HUMANIDADES: "Artes y Humanidades",
  CIENCIAS: "Ciencias",
  CIENCIAS_SALUD: "Ciencias de la Salud",
  CIENCIAS_SOCIALES_JURIDICAS: "Sociales y Jurídicas",
  INGENIERIA_ARQUITECTURA: "Ingeniería y Arquitectura",
};

const VENTANA = {
  abierta: { texto: "plazo abierto", clase: "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35" },
  "abre pronto": { texto: "abre pronto", clase: "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/25" },
  cerrada: { texto: "plazo cerrado", clase: "bg-neutral-100 text-neutral-500 border-neutral-300" },
  "sin fecha": { texto: "sin fechas", clase: "bg-[#FEF3E7] text-[#B9770E] border-amber-300/60" },
};

const eur = (n) =>
  n == null ? "—" : `${Number(n).toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;

/** Un retardo corto: sin él, cada tecla dispara una consulta a mil filas. */
function useRetardo(valor, ms = 350) {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}

function Ficha({ m }) {
  const v = VENTANA[m.ventana?.estado] || VENTANA["sin fecha"];
  const u = m.universidad || {};

  return (
    <article className="bg-white border border-neutral-200 rounded-xl p-3.5 hover:border-neutral-300
      transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold text-neutral-900 leading-snug min-w-0">
          {m.nombre}
        </h3>
        <div className="text-right shrink-0">
          <p className="text-[15px] font-bold text-[#1A3557] tabular-nums leading-none">
            {eur(m.precio)}
          </p>
          <p className="text-[9.5px] text-neutral-400 mt-0.5">
            {m.precio_origen === "confirmado" ? "confirmado" : "estimado"}
          </p>
        </div>
      </div>

      <p className="text-[11.5px] text-neutral-600 mt-1.5 leading-snug">
        {u.sigla ? <b className="text-neutral-800">{u.sigla}</b> : null}
        {u.nombre ? ` · ${u.nombre}` : ""}
      </p>
      <p className="text-[11px] text-neutral-500 mt-0.5">
        {[u.ciudad, u.comunidad].filter(Boolean).join(" · ")}
        {u.ranking_nacional ? ` · nº ${u.ranking_nacional} de España` : ""}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
        <span className={`text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5
          rounded border ${v.clase}`}>{v.texto}</span>
        <span className="text-[10.5px] text-neutral-500 px-1.5 py-0.5 rounded bg-neutral-100">
          {RAMA_ETIQ[m.rama] || m.rama}
        </span>
        <span className="text-[10.5px] text-neutral-500 tabular-nums px-1.5 py-0.5 rounded bg-neutral-100">
          {m.ects} ECTS
        </span>
        {m.modalidad !== "PRESENCIAL" && (
          <span className="text-[10.5px] text-neutral-500 px-1.5 py-0.5 rounded bg-neutral-100">
            {String(m.modalidad).toLowerCase()}
          </span>
        )}
        {m.es_habilitante && (
          <span className="text-[10.5px] text-[#7D3C98] px-1.5 py-0.5 rounded bg-[#F5EEF8]">
            habilitante
          </span>
        )}
      </div>

      {/* El plazo, en claro. La etiqueta dice el estado; esto dice la fecha,
          que es lo que hay que decirle al asesorado. */}
      {m.ventana?.estado === "abierta" && m.ventana.cierra && (
        <p className="text-[11px] text-[#14532d] mt-2">
          Cierra el {m.ventana.cierra}
          {m.ventana.dias != null ? ` · quedan ${m.ventana.dias} días` : ""}
        </p>
      )}
      {m.ventana?.estado === "abre pronto" && m.ventana.abre && (
        <p className="text-[11px] text-[#1A3557] mt-2">
          Abre el {m.ventana.abre} · {m.ventana.fase}
        </p>
      )}

      {u.url && (
        <a href={u.url} target="_blank" rel="noreferrer"
          className="inline-block text-[11px] text-[#046C8C] hover:underline mt-2">
          web de la universidad ↗
        </a>
      )}
    </article>
  );
}

export default function BuscadorMasteres() {
  const [texto, setTexto] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [rama, setRama] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("precio");
  const [pagina, setPagina] = useState(1);

  // La respuesta se guarda junto a la consulta que la produjo, y de ahi sale si
  // esta cargando. Marcar «cargando» dentro del efecto obliga a un render de
  // mas por cada tecla, y aqui se teclea mucho.
  const [respuesta, setRespuesta] = useState(null);
  const [unis, setUnis] = useState([]);

  const textoLento = useRetardo(texto);
  const precioLento = useRetardo(precioMax, 500);

  // Las comunidades salen de la ficha de universidades: es la misma lista y no
  // tiene sentido mantener dos.
  useEffect(() => {
    let vivo = true;
    boGET("/backoffice/universidades")
      .then((r) => { if (vivo && r?.ok) setUnis(r.universidades || []); })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);

  const comunidades = useMemo(
    () => [...new Set(unis.map((u) => u.comunidad).filter(Boolean))].sort(),
    [unis],
  );

  const consulta = useMemo(() => {
    const p = new URLSearchParams();
    if (textoLento.trim()) p.set("texto", textoLento.trim());
    if (comunidad) p.set("comunidad", comunidad);
    if (rama) p.set("rama", rama);
    if (modalidad) p.set("modalidad", modalidad);
    if (precioLento && Number(precioLento) > 0) p.set("precio_max", String(Number(precioLento)));
    p.set("orden", orden);
    p.set("pagina", String(pagina));
    return p.toString();
  }, [textoLento, comunidad, rama, modalidad, precioLento, orden, pagina]);

  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/masteres?${consulta}`)
      .then((r) => { if (vivo) setRespuesta({ consulta, datos: r?.ok ? r : null }); })
      // Sin esto, un fallo de red dejaria «Buscando…» puesto para siempre.
      .catch(() => { if (vivo) setRespuesta({ consulta, datos: null, fallo: true }); });
    return () => { vivo = false; };
  }, [consulta]);

  const cargando = !respuesta || respuesta.consulta !== consulta;
  const datos = respuesta?.datos || null;
  const fallo = Boolean(respuesta?.fallo) && !cargando;

  // Cualquier filtro nuevo devuelve a la primera página: quedarse en la siete
  // de una búsqueda que ahora tiene dos páginas enseña una lista vacía.
  const cambiar = useCallback((set) => (e) => { set(e.target.value); setPagina(1); }, []);

  const masteres = datos?.masteres || [];
  const total = datos?.total || 0;
  const paginas = datos?.paginas || 1;

  const sel = "text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white "
    + "text-neutral-700 focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Buscador de másteres</h1>
        <p className="text-[12.5px] text-neutral-500">
          El catálogo del que sale el informe. Cada máster con su precio real y su plazo.
        </p>
      </div>

      <MapaDelCatalogo activo="masteres" />

      {/* Filtros. En el móvil, dos por fila; el buscador ocupa el ancho. */}
      <div className="space-y-1.5">
        <input value={texto} onChange={cambiar(setTexto)}
          placeholder="Buscar por nombre del máster o titulación de acceso…"
          className={`${sel} w-full`} />

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-1.5">
          <select value={comunidad} onChange={cambiar(setComunidad)} className={sel}>
            <option value="">Toda España</option>
            {comunidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={rama} onChange={cambiar(setRama)} className={sel}>
            <option value="">Cualquier rama</option>
            {(datos?.facetas?.ramas || []).map((r) => (
              <option key={r.valor} value={r.valor}>
                {RAMA_ETIQ[r.valor] || r.valor} ({r.cuantos})
              </option>
            ))}
          </select>

          <select value={modalidad} onChange={cambiar(setModalidad)} className={sel}>
            <option value="">Cualquier modalidad</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="SEMIPRESENCIAL">Semipresencial</option>
            <option value="VIRTUAL">Virtual</option>
          </select>

          {/* En euros y no en tramos: el asesorado dice una cifra, no una lista. */}
          <input value={precioMax} onChange={cambiar(setPrecioMax)} inputMode="numeric"
            placeholder="Hasta … €" className={sel} />

          <select value={orden} onChange={cambiar(setOrden)} className={sel}>
            <option value="precio">Más barato primero</option>
            <option value="nombre">Por nombre</option>
            <option value="ects">Menos créditos</option>
            <option value="duracion">Más corto</option>
          </select>
        </div>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-[12px] text-neutral-500">
          {cargando ? "Buscando…" : (
            <>
              <b className="text-neutral-800 tabular-nums">{total.toLocaleString("es-ES")}</b>
              {total === 1 ? " máster" : " másteres"}
              {paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}
            </>
          )}
        </p>
        {/* El catálogo está a medias y callarlo sería peor: quien busca tiene
            que saber que el vacío puede ser del catálogo, no de la oferta. */}
        <p className="text-[11px] text-neutral-400 sm:ml-auto">
          Sólo másteres oficiales ya cargados en el catálogo.
        </p>
      </div>

      {fallo ? (
        <div className="bg-white border border-red-200 rounded-xl py-10 px-4 text-center">
          <p className="text-[13px] text-red-700">No se pudo consultar el catálogo.</p>
          <p className="text-[11.5px] text-neutral-500 mt-1">
            Vuelve a intentarlo; si sigue igual, es el servidor y no la búsqueda.
          </p>
        </div>
      ) : !cargando && !masteres.length ? (
        <div className="bg-white border border-dashed border-neutral-300 rounded-xl py-12 px-4 text-center">
          <p className="text-[13px] text-neutral-600">No hay ninguno con esos filtros.</p>
          <p className="text-[11.5px] text-neutral-400 mt-1 leading-relaxed">
            Puede que esa universidad todavía no tenga su oferta cargada. Se carga desde el
            sistematizador.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {masteres.map((m) => <Ficha key={m.id_master} m={m} />)}
        </div>
      )}

      {paginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button type="button" disabled={pagina <= 1 || cargando}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-neutral-300
              text-neutral-700 disabled:opacity-35">
            Anterior
          </button>
          <span className="text-[12px] text-neutral-500 tabular-nums">{pagina} / {paginas}</span>
          <button type="button" disabled={pagina >= paginas || cargando}
            onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-neutral-300
              text-neutral-700 disabled:opacity-35">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
