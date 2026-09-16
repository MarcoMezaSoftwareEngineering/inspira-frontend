// Lista de clientes.
//
// Sustituye a la tabla de columnas sueltas (Tel · País · Alta), que en cien
// filas no distinguía nada. Lo que hace falta ver de un vistazo es qué tiene
// cada uno en marcha, si debe dinero y si nadie lo está llevando.
import { useMemo, useState } from "react";

const SERVICIO = {
  master: { corto: "Máster",      tono: "bg-[#EEF2F8] text-[#1A3557]" },
  visa:   { corto: "Visado",      tono: "bg-[#FEF3E7] text-[#B9770E]" },
  ee:     { corto: "Estancia",    tono: "bg-[#F5EEF8] text-[#7D3C98]" },
  mod:    { corto: "Modificatoria", tono: "bg-[#FEF3E7] text-[#B9770E]" },
  fp:     { corto: "FP",          tono: "bg-[#E8F5EE] text-[#1D6A4A]" },
  legal:  { corto: "Extranjería", tono: "bg-[#FDEDEC] text-[#C0392B]" },
};

/* En el distintivo solo cabe el nombre de pila del titular: los nombres
   legales completos pasan de 35 caracteres y romperían la fila. */
function primerNombre(nombre) {
  return String(nombre || "").trim().split(/\s+/)[0] || "otro cliente";
}

function iniciales(nombre) {
  return String(nombre || "?")
    .trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

/* "hace 3 días" dice más que una fecha cuando lo que se mira es quién acaba
   de entrar. Pasada la semana ya se prefiere la fecha. */
function desdeCuando(iso, ahora) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dias = Math.floor((ahora - d) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

/* Color del servicio principal, para el avatar y la franja de la tarjeta. */
const ACENTO = {
  master: "#1A3557", visa: "#B9770E", ee: "#7D3C98", mod: "#B9770E", fp: "#1D6A4A", legal: "#C0392B",
};

function soloDigitos(t) {
  return String(t || "").replace(/[^\d]/g, "");
}

/* Un proceso activo: servicio, etapa, avance y quién lo lleva. Es lo que se
   mira de un cliente; el correo y el teléfono van a los botones. */
function ProcesoMini({ e }) {
  const sv = SERVICIO[e.servicio] || SERVICIO.master;
  const pct = e.paso && e.pasos ? Math.round((e.paso / e.pasos) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50 border border-neutral-100 px-2.5 py-2">
      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${sv.tono}`}>{sv.corto}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold text-neutral-800 truncate">{e.etapa || "Sin etapa"}</span>
          {e.paso && <span className="shrink-0 text-[10px] text-neutral-400 tabular-nums">{e.paso}/{e.pasos}</span>}
        </div>
        <div className="h-1 rounded-full bg-neutral-200/80 mt-1 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ACENTO[e.servicio] || "#1A3557" }} />
        </div>
      </div>
      <span title={e.responsable || "Sin responsable"}
        className={`shrink-0 w-6 h-6 rounded-full grid place-items-center text-[9px] font-bold ${
          e.responsable ? "bg-[#023A4B] text-white" : "bg-amber-100 text-amber-700 border border-amber-300 border-dashed"}`}>
        {e.responsable ? iniciales(e.responsable) : "?"}
      </span>
    </div>
  );
}

function Ficha({ c, ahora, onAbrir, onEditar, onServicios, onActivo, onPurgar, isAdmin }) {
  const [menu, setMenu] = useState(false);
  const principal = c.etapas?.[0]?.servicio;
  const acento = principal ? ACENTO[principal] : null;
  const tel = soloDigitos(c.telefono);
  const parar = (e) => e.stopPropagation();

  // Lo que pide atención, en una sola línea y por orden de gravedad.
  const alertas = [
    ...(c.sin_abrir || []).map((x) => ({
      k: `sa${x.id_solicitud}`, rojo: x.horas >= 48,
      t: `Sin abrir · ${x.horas < 24 ? `${x.horas} h` : `${Math.floor(x.horas / 24)} d`}`,
    })),
    c.debe > 0 && { k: "debe", rojo: true, t: `Debe ${c.debe.toFixed(0)}` },
    c.sin_responsable && c.activos > 0 && { k: "resp", t: "Sin responsable" },
  ].filter(Boolean);

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => onAbrir(c)}
      onKeyDown={(e) => { if (e.key === "Enter") onAbrir(c); }}
      className={`relative overflow-hidden bg-white rounded-2xl border border-neutral-200/80
        shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_-18px_rgba(2,58,75,.35)]
        hover:shadow-[0_2px_4px_rgba(16,24,40,.05),0_16px_32px_-18px_rgba(2,58,75,.45)]
        active:scale-[.995] transition-all cursor-pointer select-none touch-manipulation
        ${c.activo === false ? "opacity-60" : ""}`}
    >
      {acento && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1" style={{ background: acento }} />}

      <div className="p-3.5 pl-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-11 h-11 rounded-2xl grid place-items-center text-[13px] font-bold text-white"
            style={{ background: acento ? `linear-gradient(135deg, ${acento}, #023A4B)` : "#cfd4da" }}>
            {iniciales(c.nombre)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold text-neutral-900 leading-snug line-clamp-2 break-words">
              {c.nombre || c.email_contacto}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              {c.nuevo && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#E8F5EE] text-[#1D6A4A]">Nuevo</span>
              )}
              {c.activo === false && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500">Inactivo</span>
              )}
              <span className="text-[11px] text-neutral-400 truncate">
                {desdeCuando(c.fecha_registro, ahora)}{c.canal_origen ? ` · ${c.canal_origen}` : ""}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="relative shrink-0 -mr-1 -mt-1">
              <button type="button" aria-label="Más acciones"
                onClick={(e) => { parar(e); setMenu((v) => !v); }}
                className="w-8 h-8 rounded-full grid place-items-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
                </svg>
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { parar(e); setMenu(false); }} />
                  <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 text-left">
                    {[
                      ["Editar datos", () => onEditar(c)],
                      ["Ver servicios", () => onServicios(c)],
                      [c.activo === false ? "Reactivar" : "Desactivar", () => onActivo(c)],
                      ["Eliminar", () => onPurgar(c), true],
                    ].map(([txt, fn, peligro]) => (
                      <button key={txt} type="button"
                        onClick={(e) => { parar(e); setMenu(false); fn(); }}
                        className={`block w-full text-left text-[12.5px] px-3 py-2 hover:bg-neutral-50 ${peligro ? "text-red-600" : "text-neutral-700"}`}>
                        {txt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {c.etapas?.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            {c.etapas.map((e) => <ProcesoMini key={e.id_solicitud} e={e} />)}
          </div>
        ) : !c.solo_invitado && (
          <p className="mt-2.5 text-[11.5px] text-neutral-400">
            {c.total_servicios > 0
              ? `${c.total_servicios} servicio${c.total_servicios > 1 ? "s" : ""}, ninguno activo`
              : "Sin servicios contratados"}
          </p>
        )}

        {c.invitado_en?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {c.invitado_en.map((i) => {
              const sv = SERVICIO[i.servicio] || SERVICIO.master;
              return (
                <span key={i.id_solicitud}
                  title={`${i.quien} · ${i.puede_editar ? "puede subir documentos y rellenar datos" : "solo lectura"}`}
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border border-dashed ${sv.tono}`}>
                  Invitada a {sv.corto} de {primerNombre(i.titular)}{!i.ha_entrado && " · sin entrar"}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-100">
          <div className="min-w-0 flex-1 flex flex-wrap gap-1.5">
            {alertas.length ? alertas.map((a) => (
              <span key={a.k}
                className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${a.rojo ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                {a.t}
              </span>
            )) : (
              <span className="text-[11px] text-neutral-400 truncate">{c.responsables?.join(", ")}</span>
            )}
          </div>
          {tel && (
            <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer" onClick={parar}
              aria-label="Escribir por WhatsApp" title={c.telefono}
              className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#E8F5EE] text-[#1D6A4A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" />
              </svg>
            </a>
          )}
          {c.email_contacto && (
            <a href={`mailto:${c.email_contacto}`} onClick={parar}
              aria-label="Enviar correo" title={c.email_contacto}
              className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#EEF2F8] text-[#1A3557]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientesLista({
  clientes, loading, orden, onOrden, onAbrir, onEditar,
  onServicios, onActivo, onPurgar, isAdmin, filtro, onFiltro, conteos = {},
}) {
  const setFiltro = onFiltro;
  // Va aparte de los chips para poder cruzarlos: «Estancia» con «Con deuda»
  // es la pregunta que de verdad se hace, y con un solo selector no cabría.
  const [servicio, setServicio] = useState("");
  // Se fija al montar: leer el reloj en cada render hace impuro el componente.
  const [ahora] = useState(() => Date.now());

  // Los filtros y sus cifras salen del servidor, sobre TODOS los clientes: en
  // el navegador solo contaban la primera página.
  const contadores = {
    todos: conteos.todos ?? clientes.length,
    activos: conteos.activos ?? 0,
    sin_servicio: conteos.sin_servicio ?? 0,
    deuda: conteos.con_deuda ?? 0,
    sin_resp: conteos.sin_responsable ?? 0,
    nuevos: conteos.nuevos ?? 0,
    sin_abrir: conteos.sin_abrir ?? 0,
    mios: conteos.mios ?? 0,
  };

  // Cuántos tienen algo en marcha de cada servicio.
  //
  // Sale de `etapas`, que son sus procesos activos. Las invitaciones viven
  // aparte en `invitado_en` y no cuentan: quien está invitado al expediente de
  // otra persona no tiene ese servicio, lo está mirando.
  const porServicio = useMemo(() => {
    const n = {};
    for (const c of clientes) {
      for (const clave of new Set((c.etapas || []).map((e) => e.servicio))) {
        n[clave] = (n[clave] || 0) + 1;
      }
    }
    return n;
  }, [clientes]);

  const visibles = useMemo(() => clientes.filter((c) =>
    !servicio || (c.etapas || []).some((e) => e.servicio === servicio)
  ), [clientes, servicio]);

  const chip = (id, texto, n, tono) => (
    <button
      key={id} type="button" onClick={() => setFiltro(filtro === id ? "" : id)}
      aria-pressed={filtro === id}
      className={`shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl border
        transition-all active:scale-95 ${
        filtro === id
          ? "border-[#1D6A4A] bg-[#1D6A4A] text-white shadow-[0_8px_18px_-12px_rgba(29,106,74,.95)]"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
      }`}
    >
      {texto}
      <span className={`text-[10.5px] font-bold px-1.5 rounded-full ${
        filtro === id ? "bg-white/20" : tono || "bg-neutral-100 text-neutral-500"
      }`}>{n}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      {/* La tira de filtros acompaña a la lista al desplazar. El pegado y el
          difuminado del borde van en elementos distintos: los dos fijan
          `position` y en el mismo nodo se anulaban. */}
      <div className="ase-sticky -mx-3 px-3 sm:-mx-6 sm:px-6 pt-1 pb-1.5">
        <div className="ase-tira">
        <div className="ase-tira-scroll">
        {chip("", "Todos", contadores.todos)}
        {chip("mios", "Mis clientes", contadores.mios, "bg-[#EEF2F8] text-[#1A3557]")}
        {chip("nuevos", "Nuevos (7 días)", contadores.nuevos, "bg-[#E8F5EE] text-[#1D6A4A]")}
        {chip("sin_abrir", "Sin abrir", contadores.sin_abrir, "bg-red-50 text-red-700")}
        {chip("activos", "Con proceso activo", contadores.activos, "bg-[#E8F5EE] text-[#1D6A4A]")}
        {chip("sin_servicio", "Sin servicios", contadores.sin_servicio, "bg-amber-50 text-amber-700")}
        {chip("con_deuda", "Con deuda", contadores.deuda, "bg-red-50 text-red-700")}
        {chip("sin_responsable", "Sin responsable", contadores.sin_resp, "bg-amber-50 text-amber-700")}

        <select
          value={servicio} onChange={(e) => setServicio(e.target.value)}
          className={`shrink-0 ml-auto text-[12px] border rounded-lg px-2 py-1.5 focus:outline-none ${
            servicio
              ? "border-[#1D6A4A] bg-[#1D6A4A] text-white font-semibold"
              : "border-neutral-200 bg-white text-neutral-600 focus:border-[#1D6A4A]"
          }`}
        >
          <option value="">Todos los servicios</option>
          {Object.entries(SERVICIO)
            .filter(([clave]) => porServicio[clave])
            .map(([clave, sv]) => (
              <option key={clave} value={clave}>{sv.corto} ({porServicio[clave]})</option>
            ))}
        </select>

        <select
          value={orden} onChange={(e) => onOrden(e.target.value)}
          className="shrink-0 text-[12px] text-neutral-600 border border-neutral-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]"
        >
          <option value="recientes">Últimos creados</option>
          <option value="antiguos">Más antiguos</option>
          <option value="nombre">Por nombre</option>
        </select>
        </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {/* Esqueleto: mantiene la altura para que la lista no dé un salto
              cuando llegan los datos. */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl px-3.5 py-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-3 bg-neutral-100 rounded w-1/3" />
                  <div className="h-2.5 bg-neutral-50 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">
            {filtro || servicio ? "Ningún cliente en este filtro" : "Todavía no hay clientes"}
          </p>
          <p className="text-[12px] text-neutral-400 mt-1">
            {filtro && servicio
              ? "Los dos filtros a la vez no dejan a nadie. Prueba quitando uno."
              : filtro || servicio
                ? "Prueba con otro."
                : "Usa «Nuevo cliente» para dar de alta al primero."}
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {visibles.map((c) => (
            <Ficha
              key={c.id_cliente} c={c} ahora={ahora} isAdmin={isAdmin}
              onAbrir={onAbrir} onEditar={onEditar}
              onServicios={onServicios} onActivo={onActivo} onPurgar={onPurgar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
