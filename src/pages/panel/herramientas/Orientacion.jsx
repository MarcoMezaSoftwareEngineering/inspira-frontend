// Herramientas gratuitas que orientan y llevan a contratar (03/11/2026): cada
// una da una respuesta útil y deja con candado lo que hace el asesor.
import { useEffect, useRef, useState } from "react";
import Icono from "../../../components/common/Icono";
import { apiGET } from "../../../services/api";
import { navigate } from "../../../services/navigate";
import { Cabecera } from "./Herramientas";
import { useHerramienta, useReferido } from "./useHerramienta";
import { ESCALAS, notaEspanola, tramoNota, hitosDesde, inicioPorDefecto } from "./calculos";

const hoyIso = () => new Date().toISOString().slice(0, 10);
const fechaCorta = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
const eur = (n) => `${Math.round(n).toLocaleString("es-ES")}\u00a0€`;

/** El candado al pie de cada herramienta: lo que sigue lo hace el asesor. */
export function SoloClientes({ titulo, texto, boton = "Reservar mi asesoría" }) {
  return (
    <section className="pnl-hr-cta pnl-hr-cta-candado">
      <span className="pnl-hr-candado-grande"><Icono nombre="candado" size={14} /> Solo clientes</span>
      <strong>{titulo}</strong>
      <p>{texto}</p>
      <a href="/reservar" onClick={(e) => { e.preventDefault(); navigate("/reservar"); }} className="pnl-btn-cta pnl-btn-grande ux-tap">{boton}</a>
    </section>
  );
}

function Opciones({ pregunta, opciones, valor, onElegir }) {
  return (
    <fieldset className="pnl-hr-caja pnl-hr-pregunta">
      <legend>{pregunta}</legend>
      <div className="pnl-hr-chips">
        {opciones.map(([id, texto]) => (
          <button key={id} type="button" aria-pressed={valor === id} onClick={() => onElegir(id)}>{texto}</button>
        ))}
      </div>
    </fieldset>
  );
}

// ── Mi nota en España ───────────────────────────────────────────────────────
export function MiNota() {
  const [d, guardar, estado] = useHerramienta("nota", { pais: "pe", nota: "", max: "", aprueba: "" });
  const escala = d.pais === "otra" ? { max: d.max, aprueba: d.aprueba } : ESCALAS.find((e) => e.id === d.pais) || ESCALAS[0];
  const es = notaEspanola(d.nota, escala);
  const poner = (k) => (e) => guardar({ ...d, [k]: e.target.value });
  return (
    <div className="pnl-hr">
      <Cabecera icono="grafico" titulo="Tu nota en España" lema="Tu nota media convertida a la escala española del 0 al 10." estado={estado} />
      <section className="pnl-hr-caja">
        <label className="pnl-hr-campo"><span>País donde estudiaste</span>
          <select value={d.pais} onChange={poner("pais")}>
            {ESCALAS.map((e) => <option key={e.id} value={e.id}>{e.pais} ({e.aprueba}–{e.max})</option>)}
            <option value="otra">Otra escala</option>
          </select>
        </label>
        {d.pais === "otra" && (
          <>
            <label className="pnl-hr-campo"><span>Nota máxima</span><input type="number" inputMode="decimal" value={d.max} onChange={poner("max")} /></label>
            <label className="pnl-hr-campo"><span>Nota para aprobar</span><input type="number" inputMode="decimal" value={d.aprueba} onChange={poner("aprueba")} /></label>
          </>
        )}
        <label className="pnl-hr-campo"><span>Tu nota media</span><input type="number" inputMode="decimal" step="0.01" value={d.nota} onChange={poner("nota")} /></label>
      </section>
      <div className="pnl-hr-total">
        <small>Tu nota en España</small>
        {es !== null
          ? <><strong>{es.toLocaleString("es-ES")} / 10</strong><span>{tramoNota(es)}. Así la leerá la comisión de admisión.</span></>
          : <span>{d.nota === "" ? "Escribe tu nota media y la convertimos." : "Esa nota no entra en la escala: revísala."}</span>}
      </div>
      {es !== null && (
        <button type="button" className="pnl-btn ux-tap" onClick={() => navigate("/panel/herramientas/admision")}>¿Con cuántos másteres hago match? →</button>
      )}
      <SoloClientes titulo="La conversión oficial, firmada" texto="Las universidades piden la equivalencia con el método del Ministerio. La preparamos con tu certificado de notas y la sumamos a tu expediente." />
      <p className="pnl-hr-pie">Conversión lineal y orientativa. Cada universidad puede aplicar su propio cálculo.</p>
    </div>
  );
}

// ── ¿Me admiten? ────────────────────────────────────────────────────────────
export function MeAdmiten() {
  const [d, guardar, estado] = useHerramienta("admision", { t: "", titulacion: "" });
  // null: todavía no escribió nada en esta visita; se ve la carrera guardada.
  const [texto, setTexto] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [res, setRes] = useState(null);
  const espera = useRef(null);

  useEffect(() => {
    if (!d.t) return undefined;
    let vivo = true;
    apiGET(`/api/catalogo/acceso?t=${encodeURIComponent(d.t)}`).then((r) => { if (vivo && r?.ok) setRes(r); }).catch(() => {});
    return () => { vivo = false; };
  }, [d.t]);

  const escribir = (v) => {
    setTexto(v);
    clearTimeout(espera.current);
    if (v.trim().length < 3) { setSugerencias([]); return; }
    espera.current = setTimeout(() => {
      apiGET(`/api/catalogo/titulaciones?q=${encodeURIComponent(v)}`).then((r) => setSugerencias(r?.titulaciones || [])).catch(() => {});
    }, 300);
  };
  const elegir = (s) => { setSugerencias([]); setTexto(null); setRes(null); guardar({ t: s.norm, titulacion: s.titulacion }); };
  const max = res?.comunidades?.[0]?.n || 1;

  return (
    <div className="pnl-hr">
      <Cabecera icono="diana" titulo="¿Con cuántos másteres haces match?" lema="Escribe tu carrera y te decimos cuántos másteres oficiales en España encajan contigo." estado={estado} />
      <section className="pnl-hr-caja pnl-hr-buscador">
        <label htmlFor="carrera"><b>Tu carrera</b></label>
        <input id="carrera" type="text" autoComplete="off" placeholder="Ej.: Derecho, Ingeniería industrial…" value={texto ?? d.titulacion ?? ""} onChange={(e) => escribir(e.target.value)} />
        {sugerencias.length > 0 && (
          <ul role="listbox" className="pnl-hr-sugerencias">
            {sugerencias.map((s) => (
              <li key={s.norm}><button type="button" onClick={() => elegir(s)}>{s.titulacion}</button></li>
            ))}
          </ul>
        )}
      </section>
      {res && res.total === 0 && <p className="pnl-hr-vacio">Todavía no tenemos esa carrera en el catálogo. Prueba con otra forma de escribirla.</p>}
      {res && res.total > 0 && (
        <>
          <div className="pnl-hr-total pnl-hr-match">
            <small>Con {d.titulacion}</small>
            <strong>Haces match con {res.total} másteres</strong>
            <span>{res.directos} nombran tu carrera en su acceso{res.desde ? ` · desde ${eur(res.desde)}` : ""}</span>
          </div>
          {res.ejemplo && (
            <article className="pnl-hr-caja pnl-hr-ejemplo">
              <span className="pnl-hr-sello-ok">✓ Uno de tus matches</span>
              <h3>{res.ejemplo.nombre}</h3>
              <p>{[res.ejemplo.universidad, res.ejemplo.ciudad].filter(Boolean).join(" · ")}</p>
              <dl className="pnl-hr-datos">
                {res.ejemplo.precio && <div><dt>Matrícula</dt><dd>{eur(res.ejemplo.precio)}</dd></div>}
                {res.ejemplo.ects && <div><dt>Créditos</dt><dd>{res.ejemplo.ects} ECTS</dd></div>}
                {res.ejemplo.modalidad && <div><dt>Modalidad</dt><dd>{res.ejemplo.modalidad.charAt(0) + res.ejemplo.modalidad.slice(1).toLowerCase()}</dd></div>}
                {res.ejemplo.curso && <div><dt>Curso</dt><dd>{res.ejemplo.curso}</dd></div>}
              </dl>
            </article>
          )}
          <div className="pnl-hr-velados" aria-label={`${res.total - 1} másteres más, reservados para clientes`}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="pnl-hr-velado" aria-hidden="true"><i style={{ width: `${70 - i * 12}%` }} /><i style={{ width: `${45 + i * 8}%` }} /></div>
            ))}
            <span className="pnl-hr-velo-candado"><Icono nombre="candado" size={16} /> {res.total - 1} másteres más</span>
          </div>
          {res.comunidades.length > 0 && (
            <section className="pnl-hr-caja">
              <h3>Dónde están</h3>
              {res.comunidades.slice(0, 6).map((c) => (
                <div key={c.nombre} className="pnl-hr-barra-fila">
                  <span>{c.nombre}</span>
                  <span className="pnl-hr-barra-h" style={{ "--p": (c.n / max) * 100 }} aria-hidden="true" />
                  <b>{c.n}</b>
                </div>
              ))}
            </section>
          )}
          <SoloClientes titulo={`Tus ${res.total} másteres, guiados por profesionales`} texto="Tu asesor los ordena según tu nota, tu presupuesto y tu objetivo, con becas y plazos de cada uno, en tu Informe de másteres." boton="Quiero mi informe" />
        </>
      )}
      <p className="pnl-hr-pie">Del catálogo de másteres oficiales de Inspira. Cada universidad decide la admisión final.</p>
    </div>
  );
}

// ── ¿Llego a tiempo? ────────────────────────────────────────────────────────
export function LlegoATiempo() {
  const hoy = hoyIso();
  const [d, guardar, estado] = useHerramienta("plazos", { inicio: inicioPorDefecto(hoy) });
  const hitos = hitosDesde(d.inicio, hoy);
  const vencidos = hitos.filter((h) => h.faltan < 0).length;
  const justo = hitos.some((h) => h.faltan >= 0 && h.faltan < 30);
  return (
    <div className="pnl-hr">
      <Cabecera icono="reloj" titulo="¿Llego a tiempo?" lema="Pon cuándo empieza tu máster y te damos tus fechas límite." estado={estado} />
      <section className="pnl-hr-caja">
        <label className="pnl-hr-campo"><span>Mi máster empieza el</span><input type="date" value={d.inicio} onChange={(e) => guardar({ ...d, inicio: e.target.value })} /></label>
      </section>
      <div className="pnl-hr-total" data-alerta={vencidos || justo ? "1" : undefined}>
        <small>Tu situación</small>
        <strong>{vencidos ? "Vas tarde" : justo ? "Vas justo" : "Vas a tiempo"}</strong>
        <span>{vencidos ? `${vencidos} fecha(s) ya pasaron: hay que recuperar tiempo.` : justo ? "Una fecha cierra en menos de un mes." : "Si empiezas ahora, llegas con margen."}</span>
      </div>
      <ol className="pnl-hr-hitos">
        {hitos.map((h) => (
          <li key={h.titulo} data-estado={h.faltan < 0 ? "pasado" : h.faltan < 30 ? "justo" : undefined}>
            <span className="pnl-hr-hito-fecha">{fechaCorta(h.fecha)}</span>
            <strong>{h.titulo}</strong>
            <small>{h.texto} {h.faltan < 0 ? "· Ya pasó" : `· Faltan ${h.faltan} días`}</small>
          </li>
        ))}
      </ol>
      <SoloClientes
        titulo={vencidos || justo ? "Te ayudamos a recuperar el tiempo" : "Llega con margen, con un plan"}
        texto="Tu asesor arma tu calendario real: universidad por universidad, apostillas, cita consular y visa o estancia."
      />
      <p className="pnl-hr-pie">Fechas orientativas para un máster que empieza en septiembre. Si vas justo con la visa, mira también la estancia por estudios en <button type="button" className="pnl-hr-enlace" onClick={() => navigate("/visa-o-estancia")}>¿visa o estancia?</button></p>
    </div>
  );
}

// ── ¿Me puedo quedar a trabajar? ────────────────────────────────────────────
export function QuedarmeATrabajar() {
  const [r, setR] = useState({});
  const listo = r.estudio && r.plan;
  const vias = [];
  if (listo) {
    vias.push({ t: "Trabajar mientras estudias", x: "Hasta 30 horas a la semana, si el trabajo es compatible con tus clases." });
    if (r.plan === "buscar") vias.push({ t: "Residencia para buscar empleo", x: r.estudio === "fp" ? "Con FP de grado superior puede aplicar: tu asesora lo confirma." : "Al terminar tus estudios superiores, te quedas a buscar trabajo." });
    if (r.plan === "oferta") vias.push({ t: "De estudiante a residencia y trabajo", x: "Cambias tu autorización de estudios a una de trabajo con tu empresa." });
    if (r.plan === "oferta" && (r.estudio === "master" || r.estudio === "doctorado")) vias.push({ t: "Profesional altamente cualificado", x: "Si tu oferta y tu salario cumplen los requisitos, es la vía más rápida." });
    if (r.plan === "emprender") vias.push({ t: "Residencia para emprender", x: "Para montar tu proyecto en España al terminar." });
  }
  return (
    <div className="pnl-hr">
      <Cabecera icono="maletin" titulo="¿Me puedo quedar a trabajar?" lema="Dos preguntas y te mostramos tus caminos para quedarte en España." />
      <Opciones pregunta="¿Qué vas a estudiar en España?" valor={r.estudio} onElegir={(v) => setR({ ...r, estudio: v })}
        opciones={[["master", "Máster"], ["grado", "Grado"], ["fp", "FP"], ["doctorado", "Doctorado"]]} />
      <Opciones pregunta="¿Y al terminar?" valor={r.plan} onElegir={(v) => setR({ ...r, plan: v })}
        opciones={[["buscar", "Buscar trabajo"], ["oferta", "Ya tengo oferta"], ["emprender", "Emprender"]]} />
      {listo && (
        <>
          <section className="pnl-hr-caja">
            <h3>Tus caminos</h3>
            {vias.map((v) => (
              <div key={v.t} className="pnl-hr-via"><Icono nombre="check" size={16} /><span><strong>{v.t}</strong><small>{v.x}</small></span></div>
            ))}
          </section>
          <SoloClientes titulo="Cuál te conviene y cuándo pedirlo" texto="Tu asesora revisa tu caso, elige la vía y presenta el trámite contigo para que no pierdas tu residencia entre una y otra." />
        </>
      )}
      <p className="pnl-hr-pie">Orientativo según el Reglamento de Extranjería vigente. Cada caso tiene requisitos propios.</p>
    </div>
  );
}

// ── ¿Grado, FP o homologación? ──────────────────────────────────────────────
const RUTAS = {
  grado: { t: "Grado universitario", pasos: ["Homologa tu secundaria al título de Bachiller español.", "Pide la acreditación de UNEDasiss y, si quieres subir nota, las PCE.", "Preinscríbete en las universidades de tu comunidad."], enlace: "/grado-en-espana" },
  fp: { t: "Formación Profesional", pasos: ["Homologa tu secundaria: a Bachiller para grado superior, o a ESO para grado medio.", "Solicita plaza en el ciclo dentro del plazo de tu comunidad."], enlace: null },
  titulo: { t: "Que tu título valga en España", pasos: ["Para un máster no necesitas homologar tu título.", "Para ejercer una profesión regulada (medicina, derecho, arquitectura…) necesitas la homologación.", "Para oposiciones o un trabajo que pida un nivel, basta la equivalencia."], enlace: null },
};
export function GradoOFP() {
  const [q, setQ] = useState(null);
  const ruta = RUTAS[q];
  return (
    <div className="pnl-hr">
      <Cabecera icono="birrete" titulo="¿Grado, FP u homologar?" lema="Te decimos qué trámite necesitas según lo que quieres hacer." />
      <Opciones pregunta="¿Qué quieres hacer en España?" valor={q} onElegir={setQ}
        opciones={[["grado", "Estudiar un grado"], ["fp", "Estudiar FP"], ["titulo", "Que valga mi título"]]} />
      {ruta && (
        <>
          <section className="pnl-hr-caja">
            <h3>{ruta.t}: tus pasos</h3>
            <ol className="pnl-hr-pasos">{ruta.pasos.map((p) => <li key={p}>{p}</li>)}</ol>
            {ruta.enlace && <button type="button" className="pnl-btn ux-tap" onClick={() => navigate(ruta.enlace)}>Ver la guía completa →</button>}
          </section>
          <SoloClientes titulo="Hacemos el trámite por ti" texto="Revisamos tus documentos, presentamos la homologación y te avisamos de cada paso desde tu Expediente Digital." />
        </>
      )}
    </div>
  );
}

// ── Invita a un amigo ───────────────────────────────────────────────────────
export function InvitaAmigo() {
  const r = useReferido();
  const [copiado, setCopiado] = useState(false);
  const enlace = r ? `https://www.inspira-legal.cloud/panel?ref=${r.codigo}` : "";
  const mensaje = `Estoy preparando mi viaje a España con la App Inspira: presupuesto, becas, calendario y más, gratis. Entra con mi enlace: ${enlace}`;
  const copiar = async () => {
    try { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin portapapeles */ }
  };
  return (
    <div className="pnl-hr">
      <Cabecera icono="regalo" titulo="Invita a un amigo" lema="Si tu amigo contrata su asesoría con Inspira, los dos reciben un descuento." />
      <div className="pnl-hr-total">
        <small>Tu enlace</small>
        <span className="pnl-hr-enlace-propio">{enlace || "Cargando…"}</span>
        <div className="pnl-hr-botones">
          <button type="button" className="pnl-btn-cta ux-tap" onClick={copiar} disabled={!enlace}>{copiado ? "✓ Copiado" : "Copiar enlace"}</button>
          <a className="pnl-btn ux-tap" href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
        </div>
      </div>
      <section className="pnl-hr-caja pnl-hr-dos">
        <div><strong>{r?.invitados ?? "–"}</strong><small>amigos entraron con tu enlace</small></div>
        <div><strong>{r?.contrataron ?? "–"}</strong><small>ya son clientes</small></div>
      </section>
      <p className="pnl-hr-pie">El descuento se aplica cuando tu amigo contrata. Te lo confirma tu asesor.</p>
    </div>
  );
}
