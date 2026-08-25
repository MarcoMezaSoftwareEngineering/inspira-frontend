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
  fp:     { corto: "FP",          tono: "bg-[#E8F5EE] text-[#1D6A4A]" },
  legal:  { corto: "Extranjería", tono: "bg-[#FDEDEC] text-[#C0392B]" },
};

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

function Ficha({ c, ahora, onAbrir, onEditar, onServicios, onActivo, onPurgar, isAdmin }) {
  const [menu, setMenu] = useState(false);
  const nuevo = c.fecha_registro && (ahora - new Date(c.fecha_registro)) < 7 * 86400000;

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => onAbrir(c)}
      onKeyDown={(e) => { if (e.key === "Enter") onAbrir(c); }}
      className={`group bg-white border rounded-xl px-3.5 py-3 cursor-pointer transition-all
        hover:border-[#1D6A4A]/40 hover:shadow-sm ${
          c.activo === false ? "border-neutral-200 opacity-60" : "border-neutral-200"
        }`}
    >
      <div className="flex items-start gap-3">
        <span className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center text-[12px] font-bold ${
          c.activos > 0 ? "bg-[#023A4B] text-white" : "bg-neutral-100 text-neutral-400"
        }`}>
          {iniciales(c.nombre)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13.5px] font-semibold text-neutral-900 truncate">{c.nombre}</p>
            {nuevo && (
              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#1D6A4A] text-white">
                nuevo
              </span>
            )}
            {c.activo === false && (
              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-500">
                inactivo
              </span>
            )}
          </div>

          <p className="text-[11.5px] text-neutral-400 truncate">
            {c.email_contacto}{c.telefono ? ` · ${c.telefono}` : ""}
          </p>

          {/* Qué tiene en marcha */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {c.etapas?.length > 0 ? (
              c.etapas.map((e) => {
                const sv = SERVICIO[e.servicio] || SERVICIO.master;
                return (
                  <span key={e.id_solicitud}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sv.tono}`}>
                    {sv.corto}{e.etapa ? ` · ${e.etapa}` : ""}
                  </span>
                );
              })
            ) : c.total_servicios > 0 ? (
              <span className="text-[10.5px] text-neutral-400">
                {c.total_servicios} servicio{c.total_servicios > 1 ? "s" : ""}, ninguno activo
              </span>
            ) : (
              <span className="text-[10.5px] font-semibold text-amber-600">Sin servicios</span>
            )}

            {c.debe > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                debe {c.debe.toFixed(0)}
              </span>
            )}
            {c.sin_responsable && c.activos > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                sin responsable
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10.5px] text-neutral-400 whitespace-nowrap">{desdeCuando(c.fecha_registro, ahora)}</p>
          {c.canal_origen && (
            <p className="text-[10px] text-neutral-300 whitespace-nowrap">{c.canal_origen}</p>
          )}
          {isAdmin && (
            <div className="relative mt-1">
              <button
                type="button" aria-label="Más acciones"
                onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }}
                className="text-[13px] leading-none text-neutral-300 group-hover:text-neutral-600 px-1"
              >
                ⋯
              </button>
              {menu && (
                <>
                  {/* Capa para cerrar al pulsar fuera, sin listeners globales */}
                  <div className="fixed inset-0 z-10"
                    onClick={(e) => { e.stopPropagation(); setMenu(false); }} />
                  <div className="absolute right-0 top-5 z-20 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 text-left">
                    {[
                      ["Editar datos", () => onEditar(c)],
                      ["Ver servicios", () => onServicios(c)],
                      [c.activo === false ? "Reactivar" : "Desactivar", () => onActivo(c)],
                      ["Eliminar", () => onPurgar(c), true],
                    ].map(([txt, fn, peligro]) => (
                      <button
                        key={txt} type="button"
                        onClick={(e) => { e.stopPropagation(); setMenu(false); fn(); }}
                        className={`block w-full text-left text-[12px] px-3 py-1.5 hover:bg-neutral-50 ${
                          peligro ? "text-red-600" : "text-neutral-700"
                        }`}
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientesLista({
  clientes, loading, orden, onOrden, onAbrir, onEditar,
  onServicios, onActivo, onPurgar, isAdmin,
}) {
  const [filtro, setFiltro] = useState("");
  // Se fija al montar: leer el reloj en cada render hace impuro el componente.
  const [ahora] = useState(() => Date.now());

  const contadores = useMemo(() => ({
    todos: clientes.length,
    activos: clientes.filter((c) => c.activos > 0).length,
    sin_servicio: clientes.filter((c) => c.total_servicios === 0).length,
    deuda: clientes.filter((c) => c.debe > 0).length,
    sin_resp: clientes.filter((c) => c.sin_responsable && c.activos > 0).length,
  }), [clientes]);

  const visibles = useMemo(() => clientes.filter((c) => {
    if (filtro === "activos") return c.activos > 0;
    if (filtro === "sin_servicio") return c.total_servicios === 0;
    if (filtro === "deuda") return c.debe > 0;
    if (filtro === "sin_resp") return c.sin_responsable && c.activos > 0;
    return true;
  }), [clientes, filtro]);

  const chip = (id, texto, n, tono) => (
    <button
      key={id} type="button" onClick={() => setFiltro(filtro === id ? "" : id)}
      className={`shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
        filtro === id
          ? "border-[#1D6A4A] bg-[#1D6A4A] text-white"
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
      <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {chip("", "Todos", contadores.todos)}
        {chip("activos", "Con proceso activo", contadores.activos, "bg-[#E8F5EE] text-[#1D6A4A]")}
        {chip("sin_servicio", "Sin servicios", contadores.sin_servicio, "bg-amber-50 text-amber-700")}
        {chip("deuda", "Con deuda", contadores.deuda, "bg-red-50 text-red-700")}
        {chip("sin_resp", "Sin responsable", contadores.sin_resp, "bg-amber-50 text-amber-700")}

        <select
          value={orden} onChange={(e) => onOrden(e.target.value)}
          className="shrink-0 ml-auto text-[12px] text-neutral-600 border border-neutral-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]"
        >
          <option value="recientes">Últimos creados</option>
          <option value="antiguos">Más antiguos</option>
          <option value="nombre">Por nombre</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {/* Esqueleto: mantiene la altura para que la lista no dé un salto
              cuando llegan los datos. */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl px-3.5 py-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100" />
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
            {filtro ? "Ningún cliente en este filtro" : "Todavía no hay clientes"}
          </p>
          <p className="text-[12px] text-neutral-400 mt-1">
            {filtro ? "Prueba con otro." : "Usa «Nuevo cliente» para dar de alta al primero."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
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
