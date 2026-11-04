// Los paquetes autónomos de la app (03/11/2026): Guía de documentos (115 €),
// Búsqueda de máster (150 €) y Máster autónomo (225 €). Se cobran en soles con
// la comisión de la tarjeta (compras.js en el servidor) y se desbloquean en la
// cuenta. Ninguno incluye revisión: para dudas, la sesión de 25 €.
import { Suspense, useEffect, useMemo, useState } from "react";
import Icono from "../../../components/common/Icono";
import { lazyConRecarga } from "../../../lib/cargaDiferida";
import { apiGET } from "../../../services/api";
import { navigate } from "../../../services/navigate";
import { Cabecera } from "./Herramientas";
import { comprar, useHerramienta, useResumen, uid } from "./useHerramienta";

const GuiaMaster = lazyConRecarga(() => import("../GuiaMaster"));
const GuiaApostilla = lazyConRecarga(() => import("../GuiaApostilla"));
const API_URL = (import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud").replace(/\/+$/, "");

const PAQUETES = [
  {
    id: "guia-documentos", icono: "documento", titulo: "Guía de documentos",
    lema: "Prepara tus documentos tú mismo, con modelos y videos.",
    incluye: ["Guía del máster y guía de apostillas", "Modelos en PDF: cartas, CV y más", "Videos paso a paso", "Lista de documentos obligatorios y complementarios"],
    noIncluye: "Sin revisión: tú revisas tus documentos.",
  },
  {
    id: "busqueda-master", icono: "diana", titulo: "Búsqueda de máster",
    lema: "Tu lista completa de matches y el tracker de tu autopostulación.",
    incluye: ["Todos tus másteres con precio, créditos y enlaces", "Filtros por comunidad, precio y modalidad", "Mis postulaciones: estado de cada una", "Avisos al móvil antes de cada cierre"],
    noIncluye: "Lista automática según tu carrera, sin asesor.",
  },
  {
    id: "master-autonomo", icono: "estrella", titulo: "Máster autónomo", destacado: true,
    lema: "Todo lo anterior y tu informe completo de másteres.",
    incluye: ["Informe completo de másteres, revisado por el equipo", "Búsqueda de máster y tracker de postulaciones", "Guía de documentos con modelos y videos", "Guía de autopostulación"],
    noIncluye: "Un solo informe, sin correcciones. Tú postulas.",
  },
];

const soles = (n) => `S/\u00a0${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function BotonComprar({ id, texto = "Desbloquear" }) {
  const { tienda, compras } = useResumen();
  const [error, setError] = useState("");
  const [yendo, setYendo] = useState(false);
  const precio = tienda.find((t) => t.id === id);
  if (compras[id]) return <span className="pnl-hr-activo">✓ Ya lo tienes</span>;
  return (
    <div className="pnl-hr-comprar">
      <button type="button" className="pnl-btn-cta pnl-btn-grande ux-tap" disabled={!precio || yendo}
        onClick={async () => { setYendo(true); setError((await comprar(id)) || ""); setYendo(false); }}>
        {yendo ? "Abriendo el pago…" : `${texto} · ${precio ? soles(precio.total) : "…"}`}
      </button>
      {precio && <small>{precio.eur} € = {soles(precio.pen)} + {soles(precio.recargo)} de comisión de la tarjeta. Pago seguro con Mercado Pago.</small>}
      {error && <small className="pnl-hr-error" role="alert">{error}</small>}
    </div>
  );
}

/** La sección de la portada con los tres paquetes. */
export function Paquetes() {
  const { compras, tienda } = useResumen();
  // Solo llega para las cuentas internas: comprueba el cobro pagando S/ 1.
  const prueba = tienda.find((t) => t.id === "prueba");
  return (
    <>
      <h3 className="pnl-hr-grupo">Hazlo tú mismo</h3>
      <div className="pnl-hr-paquetes">
        {PAQUETES.map((p) => (
          <article key={p.id} className={`pnl-hr-paquete${p.destacado ? " es-destacado" : ""}`}>
            {p.destacado && <span className="pnl-hr-paquete-cinta">El más completo</span>}
            <span className="pnl-hr-tile"><Icono nombre={p.icono} size={22} /></span>
            <h4>{p.titulo}</h4>
            <p>{p.lema}</p>
            <ul>{p.incluye.map((x) => <li key={x}><Icono nombre="check" size={14} />{x}</li>)}</ul>
            <small className="pnl-hr-paquete-no">{p.noIncluye}</small>
            {compras[p.id]
              ? <button type="button" className="pnl-btn ux-tap" onClick={() => navigate(p.id === "guia-documentos" ? "/panel/herramientas/guia-documentos" : "/panel/herramientas/admision")}>✓ Abrir</button>
              : <BotonComprar id={p.id} texto="Comprar" />}
          </article>
        ))}
      </div>
      {prueba && (
        <section className="pnl-hr-caja pnl-hr-prueba">
          <h3>Prueba de cobro (solo equipo)</h3>
          <p>Paga {soles(prueba.total)} con Mercado Pago para comprobar el cobro, el desbloqueo y el aviso de venta. No da ningún beneficio.</p>
          <BotonComprar id="prueba" texto="Probar el cobro" />
        </section>
      )}
      <p className="pnl-hr-pie">Con cualquiera de los tres, 15 % de descuento en tu visa o estancia por estudios. ¿Dudas? Agenda una sesión de 25 € con un asesor.</p>
    </>
  );
}

/** Pantalla de una herramienta de pago para quien aún no la tiene. */
function Bloqueado({ paquete }) {
  const p = PAQUETES.find((x) => x.id === paquete);
  return (
    <section className="pnl-hr-pro">
      <span className="pnl-hr-pro-sello"><Icono nombre="candado" size={13} /> {p.titulo}</span>
      <h3>{p.lema}</h3>
      <ul>{p.incluye.map((x) => <li key={x}><Icono nombre="check" size={14} />{x}</li>)}</ul>
      <BotonComprar id={paquete} />
    </section>
  );
}

// ── La lista completa de la Búsqueda de máster ──────────────────────────────
const eur = (n) => `${Math.round(n).toLocaleString("es-ES")}\u00a0€`;

export function ListaMasteres({ t }) {
  const [lista, setLista] = useState(null);
  const [filtro, setFiltro] = useState({ comunidad: "", max: "" });
  const [post, guardarPost] = useHerramienta("postulaciones", { items: [] });
  useEffect(() => {
    let vivo = true;
    apiGET(`/cliente/herramientas/masteres?t=${encodeURIComponent(t)}`).then((r) => { if (vivo) setLista(r?.ok ? r.masteres : []); }).catch(() => vivo && setLista([]));
    return () => { vivo = false; };
  }, [t]);
  const comunidades = useMemo(() => [...new Set((lista || []).map((m) => m.comunidad).filter(Boolean))].sort(), [lista]);
  if (!lista) return <p className="pnl-hr-vacio">Cargando tus másteres…</p>;
  const vistos = lista.filter((m) => (!filtro.comunidad || m.comunidad === filtro.comunidad) && (!filtro.max || (m.precio && m.precio <= Number(filtro.max))));
  const enPost = new Set((post.items || []).map((x) => x.master));
  const anadir = (m) => guardarPost({ ...post, items: [...(post.items || []), { id: uid(), master: m.id, nombre: m.nombre, universidad: m.universidad, url: m.preinscripcion || m.url, estado: "preparando", cierre: "" }].slice(-60) });
  return (
    <>
      <section className="pnl-hr-caja">
        <h3>Filtra tus {lista.length} másteres</h3>
        <label className="pnl-hr-campo"><span>Comunidad</span>
          <select value={filtro.comunidad} onChange={(e) => setFiltro({ ...filtro, comunidad: e.target.value })}>
            <option value="">Todas</option>{comunidades.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="pnl-hr-campo"><span>Matrícula hasta</span><span className="pnl-hr-num"><input type="number" inputMode="numeric" value={filtro.max} onChange={(e) => setFiltro({ ...filtro, max: e.target.value })} /><i>€</i></span></label>
      </section>
      <p className="pnl-hr-pie">{vistos.length} másteres. Los que nombran tu carrera en su acceso salen primero.</p>
      {vistos.slice(0, 120).map((m) => (
        <article key={m.id} className="pnl-hr-caja pnl-hr-master">
          {m.nombra_tu_carrera && <span className="pnl-hr-sello-ok">✓ Nombra tu carrera</span>}
          <strong>{m.nombre}</strong>
          <small>{[m.universidad, m.ciudad].filter(Boolean).join(" · ")}</small>
          <span className="pnl-hr-master-datos">{[m.precio && eur(m.precio), m.ects && `${m.ects} ECTS`, m.modalidad && m.modalidad.toLowerCase(), m.curso].filter(Boolean).join(" · ")}</span>
          <div className="pnl-hr-botones">
            {enPost.has(m.id)
              ? <span className="pnl-hr-activo">✓ En mis postulaciones</span>
              : <button type="button" className="pnl-btn ux-tap" onClick={() => anadir(m)}>+ Voy a postular</button>}
            {(m.url || m.preinscripcion) && <a className="pnl-hr-enlace" href={m.url || m.preinscripcion} target="_blank" rel="noopener noreferrer">Ficha oficial ↗</a>}
          </div>
        </article>
      ))}
    </>
  );
}

// ── Mis postulaciones ───────────────────────────────────────────────────────
const ESTADOS_POST = [["preparando", "Preparando"], ["enviada", "Enviada"], ["espera", "Lista de espera"], ["admitido", "¡Admitido!"], ["no", "No admitido"]];

export function MisPostulaciones() {
  const { compras } = useResumen();
  const [d, guardar, estado] = useHerramienta("postulaciones", { items: [] });
  const [cal, guardarCal] = useHerramienta("calendario", { viaje: "", eventos: [] });
  const items = d.items || [];
  const cambiar = (id, k, v) => guardar({ ...d, items: items.map((x) => (x.id === id ? { ...x, [k]: v } : x)) });
  const avisar = (x) => guardarCal({ ...cal, eventos: [...(cal.eventos || []).filter((e) => e.postulacion !== x.id), { id: uid(), fecha: x.cierre, titulo: `Cierra ${x.nombre}`, postulacion: x.id }].slice(-150) });
  const admitido = items.some((x) => x.estado === "admitido");
  return (
    <div className="pnl-hr">
      <Cabecera icono="diana" titulo="Mis postulaciones" lema="Tu autopostulación, máster por máster." estado={compras["busqueda-master"] ? estado : null} />
      {!compras["busqueda-master"] ? <Bloqueado paquete="busqueda-master" /> : (
        <>
          {items.length === 0 && (
            <p className="pnl-hr-vacio">Aún no tienes ninguna. Abre tu <button type="button" className="pnl-hr-enlace" onClick={() => navigate("/panel/herramientas/admision")}>lista de másteres</button> y toca «Voy a postular».</p>
          )}
          {items.map((x) => (
            <article key={x.id} className="pnl-hr-caja" data-estado={x.estado}>
              <strong>{x.nombre}</strong>
              <small>{x.universidad}</small>
              <div className="pnl-hr-estados">
                {ESTADOS_POST.map(([id, t]) => <button key={id} type="button" aria-pressed={x.estado === id} onClick={() => cambiar(x.id, "estado", id)}>{t}</button>)}
              </div>
              <label className="pnl-hr-campo"><span>Cierre de la preinscripción</span>
                <input type="date" value={x.cierre || ""} onChange={(e) => cambiar(x.id, "cierre", e.target.value)} />
              </label>
              <div className="pnl-hr-botones">
                {x.cierre && <button type="button" className="pnl-btn ux-tap" onClick={() => avisar(x)}>🔔 Avisarme</button>}
                {x.url && <a className="pnl-hr-enlace" href={x.url} target="_blank" rel="noopener noreferrer">Ir a postular ↗</a>}
                <button type="button" className="pnl-hr-quitar" aria-label={`Quitar ${x.nombre}`} onClick={() => guardar({ ...d, items: items.filter((y) => y.id !== x.id) })}>×</button>
              </div>
            </article>
          ))}
          {admitido && (
            <section className="pnl-hr-cta">
              <strong>¡Felicidades por tu admisión! 🎉</strong>
              <p>Tramita tu visa o estancia con nosotros con un 15 % de descuento por tu paquete autónomo.</p>
              <a href="/reservar" onClick={(e) => { e.preventDefault(); navigate("/reservar"); }} className="pnl-btn-cta pnl-btn-grande ux-tap">Quiero mi visa o estancia</a>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ── Guía de documentos ──────────────────────────────────────────────────────
export function GuiaDocumentos() {
  const { compras } = useResumen();
  const [tab, setTab] = useState("modelos");
  const [modelos, setModelos] = useState(null);
  const tiene = Boolean(compras["guia-documentos"]);
  useEffect(() => {
    if (!tiene) return undefined;
    let vivo = true;
    apiGET("/cliente/herramientas/guia-documentos").then((r) => { if (vivo) setModelos(r?.ok ? r.modelos : []); }).catch(() => vivo && setModelos([]));
    return () => { vivo = false; };
  }, [tiene]);
  const url = (u) => (/^https?:\/\//i.test(u) ? u : `${API_URL}/${String(u).replace(/^\/+/, "")}`);
  return (
    <div className="pnl-hr">
      <Cabecera icono="documento" titulo="Guía de documentos" lema="Modelos, videos y guías para preparar todo tú mismo." />
      {!tiene ? <Bloqueado paquete="guia-documentos" /> : (
        <>
          <div className="pnl-hr-chips">
            {[["modelos", "Modelos y videos"], ["guia", "Guía del máster"], ["apostilla", "Apostillas"]].map(([id, t]) => (
              <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>{t}</button>
            ))}
          </div>
          {tab === "modelos" && (
            <div className="pnl-hr-lista">
              {modelos === null && <p className="pnl-hr-vacio">Cargando…</p>}
              {modelos?.map((m) => (
                <a key={m.id_instructivo} href={url(m.archivo_url)} target="_blank" rel="noopener noreferrer" className="pnl-hr-fila ux-tap">
                  <span className="pnl-hr-tile pnl-hr-tile-s"><Icono nombre={/\.(mp4|mov|webm)$|youtu|vimeo/i.test(m.archivo_url) ? "video" : "documento"} size={18} /></span>
                  <span className="min-w-0 flex-1"><strong>{m.label}</strong>{m.descripcion && <small>{m.descripcion}</small>}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
          {tab !== "modelos" && (
            <Suspense fallback={<p className="pnl-hr-vacio">Cargando…</p>}>
              {tab === "guia" ? <GuiaMaster /> : <GuiaApostilla />}
            </Suspense>
          )}
          <section className="pnl-hr-cta">
            <strong>¿Dudas con algún documento?</strong>
            <p>Agenda una sesión con un asesor por 25 € y lo vemos juntos.</p>
            <a href="/reservar" onClick={(e) => { e.preventDefault(); navigate("/reservar"); }} className="pnl-btn-cta pnl-btn-grande ux-tap">Agendar sesión</a>
          </section>
        </>
      )}
    </div>
  );
}
