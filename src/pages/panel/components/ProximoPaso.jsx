// «Tu próximo paso» y «Resumen de tu expediente», arriba de Inicio.
//
// El próximo paso es el primero de «Hoy» —misma lista, mismo orden—, dicho
// en grande y con su botón. El resumen cuenta, por servicio, solo lo que
// llega en /solicitudes/mias; lo que no llega no se enseña.
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { SERVICIO, servicioDe } from "../servicios";
import { recorta, plural } from "../pendientes";
import { cuentaPostulaciones, puntoDeRuta } from "../rutaCliente";
import { fechaLegible } from "../queMeFalta";

const CON_FALTA = [SERVICIO.MASTER, SERVICIO.VISADO, SERVICIO.ESTANCIA];

function diasHasta(iso) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(iso || ""))) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return Math.round((new Date(a, m - 1, d) - hoy) / 86400000);
}

export function ProximoPaso({ items, servicios }) {
  const primero = items[0] || null;
  const propios = (servicios || []).filter((s) => !s.invitado && CON_FALTA.includes(servicioDe(s)));
  // «¿Qué me falta?» del servicio del paso; si el paso es el perfil, del primero.
  const idFalta = primero?.idServicio && propios.some((s) => s.id_solicitud === primero.idServicio)
    ? primero.idServicio
    : propios[0]?.id_solicitud;
  const irFalta = idFalta ? () => navigate(`${rutaDe({ idServicio: idFalta })}?falta=1`) : null;

  if (!primero) {
    const { siguiente, actual } = puntoDeRuta(servicios);
    const despues = actual || siguiente;
    return (
      <section className="ex-proximo" data-tono="ok">
        <span className="ex-proximo-eyebrow">Tu próximo paso</span>
        <div className="ex-proximo-fila">
          <span className="ex-proximo-icono"><Icono nombre="escudo" size={20} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="ex-proximo-titulo">Todo al día</h2>
            <p className="ex-proximo-detalle">
              {despues
                ? <>No tienes nada pendiente. Lo que viene en tu ruta: <b>{despues.titulo}</b>{despues.de ? ` (${despues.de})` : ""}.</>
                : "No tienes nada pendiente. Te avisaremos aquí y por correo cuando haya algo."}
            </p>
          </div>
        </div>
        <div className="ex-proximo-botones">
          <button type="button" className="pnl-btn ux-tap" onClick={() => navigate(rutaDe({ tab: "ruta" }))}>
            <Icono nombre="avion" size={15} />
            Ver mi ruta
          </button>
        </div>
      </section>
    );
  }

  const dias = diasHasta(primero.fecha);
  return (
    <section className="ex-proximo" data-tono={primero.tono}>
      <span className="ex-proximo-eyebrow">Tu próximo paso</span>
      <div className="ex-proximo-fila">
        <span className="ex-proximo-icono"><Icono nombre={primero.icono} size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="ex-proximo-titulo">{primero.texto}</h2>
          {(primero.detalle || primero.servicio) && (
            <p className="ex-proximo-detalle">{[primero.detalle, primero.servicio].filter(Boolean).join(" · ")}</p>
          )}
          {primero.fecha && (
            <p className="ex-proximo-fecha">
              <Icono nombre="calendario" size={14} />
              Fecha límite: {fechaLegible(primero.fecha)}
              {dias != null && dias >= 0 && <span> · {dias === 0 ? "hoy" : dias === 1 ? "mañana" : `quedan ${dias} días`}</span>}
            </p>
          )}
        </div>
      </div>
      <div className="ex-proximo-botones">
        <button type="button" className="pnl-btn-cta ux-tap" onClick={() => navigate(primero.href)}>
          {primero.accion}
        </button>
        {irFalta && (
          <button type="button" className="ex-proximo-falta" onClick={irFalta}>¿Qué me falta?</button>
        )}
      </div>
    </section>
  );
}

function Dato({ n, texto, tono = "tipo" }) {
  return <span className={`pnl-chip pnl-chip-${tono}`}>{n != null ? <b>{n}</b> : null}{texto}</span>;
}

function TarjetaResumen({ s }) {
  const r = s.resumen || {};
  const tipo = servicioDe(s);
  const propia = Boolean(r.servicio_propio);
  const ir = (seccion) => navigate(rutaDe({ idServicio: s.id_solicitud, seccion: propia ? null : seccion }));
  const filas = [];

  // Documentos: lo que llega en la lista. En máster `docs_pendientes` no es
  // tarea del asesorado (ver pendientes.js), así que no se enseña.
  const docs = [];
  if (r.docs_observados > 0) docs.push(<Dato key="obs" n={r.docs_observados} texto=" por corregir" tono="alto" />);
  if ((propia || tipo === SERVICIO.VISADO) && r.docs_pendientes > 0) docs.push(<Dato key="pen" n={r.docs_pendientes} texto=" sin subir" tono="aviso" />);
  if (r.docs_observados === 0 && !(propia && r.docs_pendientes > 0)) docs.push(<Dato key="ok" texto="Sin correcciones" tono="ok" />);
  filas.push({ clave: "docs", titulo: "Documentos", datos: docs, onIr: () => ir("docs") });

  if (tipo === SERVICIO.MASTER) {
    const post = cuentaPostulaciones(s);
    if (post && post.total) {
      filas.push({
        clave: "post", titulo: "Postulaciones",
        datos: [
          <Dato key="env" n={post.enviadas} texto={post.enviadas === 1 ? " enviada" : " enviadas"} tono="ok" />,
          <Dato key="pre" n={post.preparacion} texto=" en preparación" tono="info" />,
          post.admitidas ? <Dato key="adm" n={post.admitidas} texto={post.admitidas === 1 ? " admisión" : " admisiones"} tono="ok" /> : null,
        ].filter(Boolean),
        onIr: () => ir("post"),
      });
    }
    const pasos = [
      r.formulario_completo === false ? <Dato key="f" texto="Formulario pendiente" tono="aviso" /> : null,
      r.informe_disponible === false ? <Dato key="i" texto="Informe en preparación" tono="info" /> : null,
      r.eleccion_completa === false && r.informe_disponible ? <Dato key="e" texto="Elección pendiente" tono="aviso" /> : null,
    ].filter(Boolean);
    if (pasos.length) filas.push({ clave: "pasos", titulo: "Tu servicio", datos: pasos, onIr: () => ir(r.formulario_completo === false ? "form" : "informe") });
  }

  if (tipo === SERVICIO.ESTANCIA) {
    const est = [
      r.etapa_propia ? <Dato key="et" texto={r.etapa_propia} tono="info" /> : null,
      r.datos_faltan > 0 ? <Dato key="df" n={r.datos_faltan} texto=" datos por completar" tono="aviso" /> : null,
    ].filter(Boolean);
    if (est.length) filas.push({ clave: "estado", titulo: "Tu trámite", datos: est, onIr: () => ir(null) });
  }

  for (const q of r.requerimientos || []) {
    filas.push({
      clave: `req-${q.titulo}`, titulo: "Extranjería",
      datos: [<Dato key="q" texto={q.plazo ? `Requerimiento · plazo ${fechaLegible(q.plazo)}` : "Requerimiento abierto"} tono="alto" />],
      onIr: () => ir(null),
    });
  }
  if ((r.plazos || []).length) {
    const p = [...r.plazos].sort((a, b) => String(a.cierra).localeCompare(String(b.cierra)))[0];
    filas.push({
      clave: "plazos", titulo: "Plazos",
      datos: [<Dato key="p" texto={`${p.universidad || "Postulación"} · ${fechaLegible(p.cierra)}`} tono="aviso" />],
      onIr: () => ir("post"),
    });
  }

  return (
    <article className="ex-resumen-tarjeta">
      <header className="ex-resumen-cabeza">
        <h3 className="text-primary" title={s.titulo}>{recorta(s.invitado ? `Expediente de ${s.titular}` : s.titulo, 48)}</h3>
        <button type="button" className="ex-resumen-abrir text-primary" onClick={() => ir(null)} aria-label="Abrir expediente">
          Abrir
          <Icono nombre="documento" size={14} />
        </button>
      </header>
      <ul className="ex-resumen-filas">
        {filas.map((f) => (
          <li key={f.clave}>
            <button type="button" className="ex-resumen-fila ux-tap" onClick={f.onIr}>
              <span className="ex-resumen-fila-titulo">{f.titulo}</span>
              <span className="ex-resumen-fila-datos">{f.datos}</span>
            </button>
          </li>
        ))}
      </ul>
      {r.mensajes_sin_leer > 0 && (
        <p className="ex-resumen-pie">{plural(r.mensajes_sin_leer, "mensaje sin leer", "mensajes sin leer")} de tu asesor</p>
      )}
    </article>
  );
}

export function ResumenExpediente({ servicios }) {
  const lista = servicios || [];
  if (!lista.length) return null;
  return (
    <section>
      <div className="pnl-head mb-3">
        <div>
          <h2>Resumen de tu expediente</h2>
          <p>Cómo va cada servicio. Toca una línea para ir a su sección.</p>
        </div>
      </div>
      <div className="ex-resumen">
        {lista.map((s) => <TarjetaResumen key={s.id_solicitud} s={s} />)}
      </div>
    </section>
  );
}
