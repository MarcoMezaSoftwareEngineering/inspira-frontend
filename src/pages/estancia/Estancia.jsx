// src/pages/estancia/Estancia.jsx
//
// /estancia: la landing de venta de la estancia por estudios, para quien ya
// está en España (o va a entrar como turista). Lo que Marco pidió que se
// subraye (25/09/2026): que se presenta con la firma digital del abogado vía
// MERCURIO y que nos encargamos de todo para que el cliente se ocupe de sus
// clases; la casilla electrónica y las notificaciones en la app de Inspira; y
// la seguridad que respalda los 350 €. Un solo plazo (llegada + 90 días − dos
// meses), documentos en genérico, sin comparativa con el visado.
//
// Reglas y textos en ./textos.js y en config (visaOEstancia, metodo,
// serviciosProceso, casos, plataforma). Nada escrito aquí.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "../../components/common/Icono";
import BarraCta, { ProgresoLectura } from "../../components/common/BarraCta";
import { CarruselVideos } from "../../components/common/VideoVertical";
import { Cinta, Numeral, Stickers } from "../../components/common/EfectosLanding";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CATEGORIAS_CASOS } from "../../config/casos";
import { ANIOS_ESTANCIA, CASOS_ESTANCIA, diasResolucion, etiquetaTipo, mesesVigencia } from "../../config/casosEstancia";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { DIAS_ANTELACION } from "../../config/visaOEstancia";
import { PROCESOS } from "../../config/serviciosProceso";
import { eur } from "../../config/paqueteMaster2027Resumen";
import { registrarEvento } from "../../lib/analytics";
import { cascada, useRevelar } from "../../lib/revelar";
import { useParallax } from "../../lib/parallax";
import { CifraAnimada } from "../landing/master2027/comunes";
import Opiniones from "../landing/master2027/Opiniones";
import ilusAsesora from "../../assets/images/landing/master-2027/ilus-asesora-auriculares.webp";
import ilusCarpeta from "../../assets/images/landing/master-2027/ilus-carpeta-archivos.webp";
import ilusPortapapeles from "../../assets/images/landing/master-2027/ilus-portapapeles-lapiz.webp";
import { ESTANCIA_ESTUDIOS, ESTANCIA as T } from "./textos";
import "../../styles/movimiento.css";
import "./estancia.css";

const PASOS = PROCESOS["estancia-estudios"];
const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};
const irASeccion = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const DIA = 86400000;
const sumar = (fecha, dias) => new Date(fecha.getTime() + dias * DIA);
const fmt = (fecha) => fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
const fmtIso = (iso, conAnio = true) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", conAnio ? { day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "long" });
const hoy0 = () => {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return h;
};

/** La tarjeta de comunicaciones de Extranjería del portal, reconstruida con
 *  datos de muestra: nítida, no una captura desenfocada. Lo que enseña existe
 *  tal cual en el portal (config/plataforma.js, POR_SERVICIO estancia). */
function AppMock() {
  const A = T.app.mock;
  return (
    <div className="est-appmock" aria-label={`${A.ejemplo}: ${A.cab}`}>
      <div className="est-appmock-cab">
        <span className="est-appmock-num">{A.n}</span>
        <span>
          <strong>{A.cab}</strong>
          <small>{A.sub}</small>
        </span>
      </div>
      <ul className="est-appmock-lista">
        {A.filas.map((f) => (
          <li key={f.titulo} className={f.urgente ? "est-appmock-urgente" : ""}>
            <Icono nombre={f.icono} size={16} />
            <span>
              <strong>{f.titulo}</strong>
              <small>{f.detalle}</small>
            </span>
            <b>{f.plazo}</b>
          </li>
        ))}
      </ul>
      <div className="est-appmock-plazos">
        {A.plazos.map(([k, v]) => (
          <span key={k}>{k} <b>{v}</b></span>
        ))}
      </div>
      <small className="est-appmock-pie">{A.ejemplo}</small>
    </div>
  );
}

/** La resolución a pantalla completa. Por portal a <body>: el envoltorio de
 *  página lleva transformaciones y un position: fixed dentro se mide mal. */
function VisorResolucion({ caso, onCerrar }) {
  useEffect(() => {
    const tecla = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
    };
  }, [onCerrar]);
  return createPortal(
    <div className="est-visor" onClick={onCerrar} role="dialog" aria-modal="true" aria-label={T.resultados.resolucionDe(caso.nombre)}>
      <div className="est-visor-caja" onClick={(e) => e.stopPropagation()}>
        <header className="est-visor-cab">
          <div>
            <strong>{T.resultados.resolucionDe(caso.nombre)}</strong>
            <small>{etiquetaTipo(caso)} · {T.resultados.oficina(caso.oficina)}</small>
          </div>
          <button type="button" className="est-visor-cerrar" onClick={onCerrar} aria-label={T.resultados.cerrar}>×</button>
        </header>
        <div className="est-visor-cuerpo">
          <img src={caso.resolucion} alt={`${T.resultados.resolucionDe(caso.nombre)}, con los datos personales tapados`} loading="eager" />
        </div>
        <p className="est-visor-pie">{T.resultados.tapado}</p>
      </div>
    </div>,
    document.body,
  );
}

/** La palabra del titular que va cambiando. */
function PalabraRotante({ palabras }) {
  const [i, setI] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setSaliendo(true);
      setTimeout(() => {
        setI((x) => (x + 1) % palabras.length);
        setSaliendo(false);
      }, 220);
    }, 2400);
    return () => clearInterval(t);
  }, [palabras.length]);
  return (
    <span key={i} className={`est-palabra lfx-palabra-entra${saliendo ? " est-palabra-sale" : ""}`}>
      {palabras[i]}
    </span>
  );
}

/**
 * Un solo plazo, el que fija Marco: la llegada más los 90 días de turista,
 * menos los dos meses de antelación que pide Extranjería (DIAS_ANTELACION,
 * el mismo número que usa el test /visa-o-estancia).
 */
function Plazo() {
  const [entrada, setEntrada] = useState("");
  const P = T.plazo;
  const fe = entrada ? new Date(`${entrada}T00:00:00`) : null;
  let salida = null;
  if (fe && !Number.isNaN(fe.getTime())) {
    const hoy = hoy0();
    const tope = sumar(fe, P.diasTurista - DIAS_ANTELACION);
    const dias = Math.round((tope - hoy) / DIA);
    let estado = "verde";
    let aviso = P.verde(dias, fmt(tope));
    if (fe > hoy) aviso = P.futuro(fmt(tope));
    else if (dias < 0) {
      estado = "rojo";
      aviso = P.rojo;
    }
    salida = { tope, estado, aviso };
  }
  return (
    <div className="est-plazos">
      <div className="est-plazos-campos est-plazos-uno">
        <label>
          {P.entrada}
          <input type="date" value={entrada} onChange={(e) => setEntrada(e.target.value)} onBlur={() => salida && registrarEvento("estancia_plazo", { estado: salida.estado })} />
          <small>{P.entradaAyuda}</small>
        </label>
      </div>
      {salida && (
        <div className="est-entra">
          <div className={`est-plazo est-plazo-grande est-plazo-${salida.estado}`}>
            <span>{P.tope}</span>
            <strong>{fmt(salida.tope)}</strong>
            <small>{P.formula}</small>
          </div>
          <p className={`est-plazos-aviso est-plazos-aviso-${salida.estado}`}>{salida.aviso}</p>
        </div>
      )}
      <p className="est-descargo">{P.descargo}</p>
    </div>
  );
}

function Faq() {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="est-faq">
      {T.faq.lista.map((f, i) => (
        <div key={f.q} className={`est-faq-item${abierta === i ? " est-faq-on" : ""}`}>
          <button type="button" onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
            {f.q}
            <span aria-hidden="true">{abierta === i ? "−" : "+"}</span>
          </button>
          {abierta === i && <p className="est-entra">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Estancia() {
  useSEO(T.seo);
  const wa = (detalle) => whatsappDesde("estancia", detalle);
  const raiz = useRef(null);
  useRevelar(raiz);
  const foto = useRef(null);
  useParallax(foto);
  const pasoCifra = cascada();
  const pasoTodo = cascada(40, 320);
  const pasoDoc = cascada(50, 350);
  const pasoApp = cascada(60, 360);
  const pasoMotivo = cascada(60, 300);
  const pasoPaso = cascada();
  const pasoResultado = cascada();
  const pasoResolucion = cascada(50, 350);
  const pasoGarantia = cascada();
  const clave = CATEGORIAS_CASOS.find((c) => c.id === T.resultados.clave);
  const otros = CATEGORIAS_CASOS.filter((c) => c.id !== T.resultados.clave);
  const numero = (c) => Number(String(c.cifra).replace(/[^\d]/g, ""));
  const prefijo = (c) => String(c.cifra).replace(/[\d.]/g, "");
  const precio = eur(ESTANCIA_ESTUDIOS.precio);
  const [visor, setVisor] = useState(null);
  const abrirVisor = (c) => {
    setVisor(c);
    registrarEvento("estancia_resolucion", { id: c.id });
  };

  return (
    <main className="est" ref={raiz}>
      <ProgresoLectura />

      {/* La cara y la promesa */}
      <header className="est-hero">
        <span className="est-orbe est-orbe-a" aria-hidden="true" />
        <span className="est-orbe est-orbe-b" aria-hidden="true" />
        <div className="est-hero-texto" data-revelar="izquierda">
          <p className="est-rotulo est-rotulo-sol">
            <Icono nombre="bandera" size={14} />
            {T.hero.rotulo}
          </p>
          <h1>
            {T.hero.tituloInicio} <PalabraRotante palabras={T.hero.palabras} />?
            <br />
            {T.hero.tituloFin}
          </h1>
          <p className="est-lead">{T.hero.lead}</p>
          <div className="est-acciones">
            <a href={wa(T.hero.whatsappDetalle)} target="_blank" rel="noopener" className="est-btn est-btn-wa mov-brillo lfx-latido" onClick={() => registrarEvento("estancia_whatsapp", { donde: "hero" })}>
              <Icono nombre="whatsapp" size={20} />
              {T.hero.whatsapp}
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="est-btn est-btn-borde" onClick={() => registrarEvento("estancia_sesion", { donde: "hero" })}>
              <Icono nombre="calendario" size={18} />
              {T.hero.sesion}
            </a>
          </div>
          <nav className="est-atajos" aria-label="Secciones">
            {[["plazo", "Tu plazo"], ["todo", "Nos encargamos"], ["app", "Tu expediente en la app"], ["denegaciones", "Por qué deniegan"], ["paquete", precio]].map(([id, t]) => (
              <button type="button" key={id} onClick={() => irASeccion(id)}>{t}</button>
            ))}
          </nav>
        </div>
        <figure className="est-hero-foto" data-revelar="escala">
          <div className="lfx-parallax" ref={foto}>
            <img src={T.retrato} alt="Carina Meza, CEO y consultora legal de Inspira Legal" width="640" height="619" loading="eager" />
            <Stickers
              lista={[
                { texto: `${clave.cifra} ${clave.titulo.toLowerCase()}`, top: "7%", left: "-5%", rot: -7, tono: "sol" },
                { texto: "Firma digital · MERCURIO", top: "46%", right: "-7%", rot: 5 },
                { texto: "30 h de trabajo", bottom: "12%", left: "-3%", rot: -4, tono: "noche" },
              ]}
            />
          </div>
          <figcaption>{T.hero.quien}</figcaption>
        </figure>
      </header>

      {/* La prueba */}
      <section className="est-cifras" aria-label="Resultados de Inspira Legal">
        {CATEGORIAS_CASOS.map((c) => (
          <div key={c.id} className="est-cifra" data-revelar="escala" style={pasoCifra()}>
            <span className="est-cifra-icono"><Icono nombre={c.icono} size={16} /></span>
            <strong>{numero(c) > 0 ? <CifraAnimada valor={numero(c)} prefijo={prefijo(c)} /> : c.cifra}</strong>
            <span>{c.titulo}</span>
          </div>
        ))}
      </section>

      <div className="est-cinta"><Cinta items={T.cinta} tono="noche" /></div>

      {/* El plazo */}
      <section className="est-seccion lfx-banda lfx-banda-cielo" id="plazo">
        <Numeral n="01" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="est-rotulo">{T.plazo.rotulo}</p>
            <h2 className="est-h2">{T.plazo.titulo}</h2>
            <p className="est-lead">{T.plazo.lead}</p>
          </div>
          <img src={ilusPortapapeles} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
        </div>
        <div data-revelar="escala">
          <Plazo />
        </div>
      </section>

      {/* Nos encargamos de todo */}
      <section className="est-seccion" id="todo">
        <Numeral n="02" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="est-rotulo">{T.todo.rotulo}</p>
            <h2 className="est-h2">{T.todo.titulo}</h2>
            <p className="est-lead">{T.todo.lead}</p>
          </div>
          <img src={ilusAsesora} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
        </div>
        <div className="est-firma" data-revelar="escala">
          <span className="est-paquete-icono est-icono-sol"><Icono nombre="laptop" size={22} /></span>
          <div>
            <strong>{T.todo.firmaTitulo}</strong>
            <p>{T.todo.firmaTexto}</p>
          </div>
        </div>
        <ul className="est-todo">
          {T.todo.lista.map((t) => (
            <li key={t} data-revelar="izquierda" style={pasoTodo()}>
              <span className="est-todo-check"><Icono nombre="check" size={14} /></span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Los documentos, en genérico */}
      <section className="est-seccion lfx-puntos" id="documentos">
        <Numeral n="03" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="est-rotulo">{T.documentos.rotulo}</p>
            <h2 className="est-h2">{T.documentos.titulo}</h2>
            <p className="est-lead">{T.documentos.lead}</p>
          </div>
          <img src={ilusCarpeta} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
        </div>
        <div className="est-docs">
          {T.documentos.lista.map((d) => (
            <div key={d.nombre} className="est-doc" data-revelar="escala" style={pasoDoc()}>
              <span className="est-paquete-icono"><Icono nombre={d.icono} size={18} /></span>
              <div>
                <strong>{d.nombre}</strong>
                <p>{d.nota}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tu expediente en la app */}
      <section className="est-seccion est-seccion-ancha est-seccion-noche" id="app">
        <Numeral n="04" claro />
        <div data-revelar>
          <p className="est-rotulo est-rotulo-sol">{T.app.rotulo}</p>
          <h2 className="est-h2">{T.app.titulo}</h2>
          <p className="est-lead">{T.app.lead}</p>
        </div>
        <div className="est-app">
          <div className="est-app-captura" data-revelar="escala">
            <AppMock />
          </div>
          <div className="est-app-puntos">
            {T.app.puntos.map((p) => (
              <div key={p.titulo} className="est-motivo" data-revelar="escala" style={pasoApp()}>
                <span className="est-paquete-icono est-icono-sol"><Icono nombre={p.icono} size={18} /></span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
        <a href={T.app.href} onClick={irA(T.app.href)} className="est-enlace est-enlace-claro est-enlace-bloque">
          {T.app.enlace} →
        </a>
      </section>

      {/* Por qué deniegan */}
      <section className="est-seccion est-seccion-ancha" id="denegaciones">
        <Numeral n="05" />
        <div data-revelar>
          <p className="est-rotulo">{T.denegaciones.rotulo}</p>
          <h2 className="est-h2">{T.denegaciones.titulo}</h2>
          <p className="est-lead">{T.denegaciones.lead}</p>
        </div>
        <div className="est-motivos est-motivos-claros">
          {T.denegaciones.lista.map((m) => (
            <article key={m.titulo} className="est-motivo" data-revelar="escala" style={pasoMotivo()}>
              <span className="est-paquete-icono"><Icono nombre={m.icono} size={18} /></span>
              <h3>{m.titulo}</h3>
              <p className="est-motivo-mal"><b>{T.denegaciones.motivo}</b> {m.motivo}</p>
              <p className="est-motivo-bien"><b>{T.denegaciones.evitamos}</b> {m.evitamos}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Resultados */}
      <section className="est-seccion" id="resultados">
        <Numeral n="06" />
        <div data-revelar>
          <p className="est-rotulo">{T.resultados.rotulo}</p>
          <h2 className="est-h2">{T.resultados.titulo}</h2>
          <p className="est-lead">{T.resultados.lead}</p>
        </div>
        <div className="est-resultados">
          <div className="est-resultado est-resultado-clave" data-revelar="escala">
            <strong><CifraAnimada valor={numero(clave)} prefijo={prefijo(clave)} /></strong>
            <b>{clave.titulo}</b>
            <p>{clave.descripcion}</p>
          </div>
          {otros.map((c) => (
            <div key={c.id} className="est-resultado" data-revelar="escala" style={pasoResultado()}>
              <strong>{c.cifra}</strong>
              <b>{c.titulo}</b>
              <p>{c.descripcion}</p>
            </div>
          ))}
        </div>
        {/* Las resoluciones, por año: nombre de pila, oficina, centro y fechas */}
        {ANIOS_ESTANCIA.map((anio) => (
          <div key={anio} className="est-resoluciones-anio">
            <div data-revelar>
              <p className="est-rotulo">{T.resultados.resolucionesRotulo(anio)}</p>
              <h3 className="est-h3">{T.resultados.resolucionesTitulo}</h3>
              <p className="est-lead">{T.resultados.resolucionesLead}</p>
            </div>
            <div className="est-resoluciones">
              {CASOS_ESTANCIA.filter((c) => c.anio === anio).map((c) => {
                const dias = diasResolucion(c);
                const meses = mesesVigencia(c);
                return (
                  <article key={c.id} className={`est-resolucion${c.tipo === "prorroga" ? " est-resolucion-prorroga" : ""}`} data-revelar="escala" style={pasoResolucion()}>
                    <div className="est-resolucion-cab">
                      <span className="est-resolucion-sello"><Icono nombre="check" size={12} /> {T.resultados.concedida}</span>
                      <span className="est-resolucion-tipo">{etiquetaTipo(c)}</span>
                    </div>
                    <strong>{c.nombre}</strong>
                    <p className="est-resolucion-donde">
                      {T.resultados.oficina(c.oficina)}
                      {c.universidad ? ` · ${c.universidad}` : ""}
                    </p>
                    <ul className="est-resolucion-datos">
                      <li><Icono nombre="calendario" size={14} /> {T.resultados.vigencia(fmtIso(c.vigencia.hasta))}{meses ? ` · ${T.resultados.meses(meses)}` : ""}</li>
                      {dias !== null && <li><Icono nombre="rayo" size={14} /> {T.resultados.dias(dias)}</li>}
                      {dias === null && c.presentada && <li><Icono nombre="documento" size={14} /> {T.resultados.presentada(fmtIso(c.presentada))}</li>}
                      <li><Icono nombre="maletin" size={14} /> {T.resultados.trabajo}</li>
                    </ul>
                    {c.resolucion && (
                      <button type="button" className="est-resolucion-foto" onClick={() => abrirVisor(c)} aria-label={`${T.resultados.verResolucion}: ${c.nombre}`}>
                        <img src={c.resolucion} alt="" loading="lazy" width="1100" height="1519" />
                        <span><Icono nombre="lupa" size={14} /> {T.resultados.verResolucion}</span>
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
        <p className="est-nota-chica" data-revelar>{T.resultados.nota}</p>
        <a href="/casos-de-exito" onClick={irA("/casos-de-exito")} className="est-enlace est-enlace-bloque">
          {T.resultados.casos}
        </a>
      </section>
      <section className="est-opiniones">
        <Opiniones ubicacion="estancia" />
      </section>

      {/* Seguridad: lo que vale el paquete */}
      <section className="est-seccion est-seccion-ancha lfx-banda lfx-banda-sol" id="paquete">
        <Numeral n="07" />
        <div data-revelar>
          <p className="est-rotulo">{T.paquete.rotulo}</p>
          <h2 className="est-h2">{T.paquete.titulo(precio)}</h2>
          <p className="est-lead">{T.paquete.lead}</p>
        </div>
        <div className="est-garantias">
          {T.paquete.garantias.map((g) => (
            <div key={g.titulo} className="est-garantia" data-revelar="escala" style={pasoGarantia()}>
              <span className="est-paquete-icono est-icono-sol"><Icono nombre={g.icono} size={18} /></span>
              <strong>{g.titulo}</strong>
              <p>{g.texto}</p>
            </div>
          ))}
        </div>
        <div className="est-paquetes">
          <article className="est-paquete est-paquete-destacado" data-revelar="escala">
            <span className="est-paquete-cinta">{T.paquete.permisoCorto}</span>
            <span className="est-paquete-icono"><Icono nombre={ESTANCIA_ESTUDIOS.icono} size={20} /></span>
            <h3>{ESTANCIA_ESTUDIOS.nombre}</h3>
            <p className="est-paquete-sub">{ESTANCIA_ESTUDIOS.subtitulo}</p>
            <p className="est-paquete-precio">{precio}</p>
            <p className="est-h5">{T.paquete.incluye}</p>
            <ul className="est-lista est-lista-ok">
              {ESTANCIA_ESTUDIOS.incluye.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="est-h5">{T.paquete.noIncluye}</p>
            <ul className="est-lista est-lista-no">
              {ESTANCIA_ESTUDIOS.noIncluye.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="est-paquete-para">
              <strong>{T.paquete.para}</strong> {ESTANCIA_ESTUDIOS.para.join(" · ")}
            </p>
            <p className="est-paquete-para">{T.paquete.garantiaTexto}</p>
            <a href={wa(`Me interesa el paquete ${ESTANCIA_ESTUDIOS.nombre} (${precio}). Ya estoy en España o entro pronto como turista.`)} target="_blank" rel="noopener" className="est-btn est-btn-sol mov-brillo" onClick={() => registrarEvento("estancia_paquete", {})}>
              {T.paquete.elegir}
            </a>
          </article>
          <div className="est-estancia" data-revelar>
            <span className="est-paquete-icono"><Icono nombre="balanza" size={20} /></span>
            <div>
              <strong>{T.paquete.sesionTitulo}</strong>
              <p>{T.paquete.sesionTexto}</p>
              <a href={CALENDLY_URL} target="_blank" rel="noopener" className="est-enlace" onClick={() => registrarEvento("estancia_sesion", { donde: "paquete" })}>
                {T.hero.sesion} →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo lo hacemos */}
      <section className="est-seccion est-como" id="como">
        <Numeral n="08" />
        <div data-revelar>
          <p className="est-rotulo">{T.como.rotulo}</p>
          <h2 className="est-h2">{T.como.titulo}</h2>
          <p className="est-lead">{T.como.lead}</p>
        </div>
        <ol className="est-pasos">
          {PASOS.map((p, i) => (
            <li key={p.titulo} data-revelar="izquierda" style={pasoPaso()}>
              <span className="est-paso-num">{i + 1}</span>
              <div>
                <h3>
                  <Icono nombre={p.icono} size={16} /> {p.titulo}
                </h3>
                <p>{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Los vídeos */}
      <section className="est-seccion est-videos" id="videos">
        <div data-revelar>
          <h2 className="est-h2">{T.videos.titulo}</h2>
          <p className="est-lead">{T.videos.lead}</p>
        </div>
        <div className="est-videos-rejilla" data-revelar="escala">
          <CarruselVideos lista={T.videos.lista} evento="estancia_video" />
        </div>
      </section>

      {/* Preguntas */}
      <section className="est-seccion">
        <Numeral n="09" />
        <div data-revelar>
          <h2 className="est-h2">{T.faq.titulo}</h2>
          <Faq />
        </div>
      </section>

      {/* La puerta */}
      <section className="est-cierre" data-revelar="escala">
        <img src={T.graduacion} alt="" className="lfx-foto-redonda" loading="lazy" width="480" height="308" />
        <h2 className="est-h2">{T.cierre.titulo}</h2>
        <p className="est-lead">{T.cierre.texto}</p>
        <div className="est-acciones">
          <a href={wa(T.hero.whatsappDetalle)} target="_blank" rel="noopener" className="est-btn est-btn-wa mov-brillo" onClick={() => registrarEvento("estancia_whatsapp", { donde: "cierre" })}>
            <Icono nombre="whatsapp" size={20} />
            {T.cierre.whatsapp}
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener" className="est-btn est-btn-claro" onClick={() => registrarEvento("estancia_sesion", { donde: "cierre" })}>
            <Icono nombre="calendario" size={18} />
            {T.cierre.sesion}
          </a>
        </div>
        <p className="est-descargo">{T.descargo}</p>
      </section>

      {visor && <VisorResolucion caso={visor} onCerrar={() => setVisor(null)} />}

      <BarraCta
        whatsapp={wa(T.hero.whatsappDetalle)}
        sesion={CALENDLY_URL}
        textoWhatsapp="WhatsApp"
        textoSesion={T.hero.sesionCorta}
        onWhatsapp={() => registrarEvento("estancia_whatsapp", { donde: "barra" })}
        onSesion={() => registrarEvento("estancia_sesion", { donde: "barra" })}
      />
    </main>
  );
}
