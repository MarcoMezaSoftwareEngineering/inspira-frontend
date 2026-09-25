// src/pages/estancia/Estancia.jsx
//
// /estancia: la landing de venta de la estancia por estudios, para quien ya
// está en España (o va a entrar como turista). Misma estructura que /visado
// con lo que aquí importa: los plazos (calculadora con las dos fechas), los
// documentos (checklist que arma el WhatsApp), los motivos de denegación, los
// resultados, la comparativa con el visado, el paquete único y los seis pasos.
//
// Reglas y textos en ./textos.js y en config (visaOEstancia, metodo,
// serviciosProceso, casos). Nada escrito aquí.
import { useEffect, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import BarraCta, { ProgresoLectura } from "../../components/common/BarraCta";
import { CarruselVideos } from "../../components/common/VideoVertical";
import { Cinta, Numeral, Stickers } from "../../components/common/EfectosLanding";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CATEGORIAS_CASOS } from "../../config/casos";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { COMPARATIVA, DIAS_ANTELACION, DIAS_PROCESO_ESTANCIA } from "../../config/visaOEstancia";
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
const hoy0 = () => {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return h;
};

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
 * Los plazos con las dos fechas: el tope (los días como turista desde la
 * entrada), la recomendada (DIAS_ANTELACION antes de clases) y la resolución
 * estimada (DIAS_PROCESO_ESTANCIA desde la entrada). Los mismos números que
 * usa el test /visa-o-estancia.
 */
function Plazos() {
  const [entrada, setEntrada] = useState("");
  const [clases, setClases] = useState("");
  const P = T.plazos;
  const fe = entrada ? new Date(`${entrada}T00:00:00`) : null;
  const fc = clases ? new Date(`${clases}T00:00:00`) : null;
  let salida = null;
  if (fe && fc) {
    const hoy = hoy0();
    const tope = sumar(fe, P.diasTurista - 1);
    const recomendada = sumar(fc, -DIAS_ANTELACION);
    const resolucion = sumar(fe, DIAS_PROCESO_ESTANCIA);
    const diasClases = Math.round((fc - hoy) / DIA);
    let estado = "verde";
    let aviso = P.verde(fmt(recomendada), fmt(tope));
    if (diasClases < 0) {
      estado = "rojo";
      aviso = P.pasadas;
    } else if (tope < hoy) {
      estado = "rojo";
      aviso = P.rojo;
    } else if (recomendada < hoy) {
      estado = "ambar";
      aviso = P.ambar(diasClases, fmt(tope));
    }
    salida = { tope, recomendada, resolucion, estado, aviso };
  }
  const registrar = () => salida && registrarEvento("estancia_plazos", { estado: salida.estado });

  return (
    <div className="est-plazos">
      <div className="est-plazos-campos">
        <label>
          {P.entrada}
          <input type="date" value={entrada} onChange={(e) => setEntrada(e.target.value)} onBlur={registrar} />
          <small>{P.entradaAyuda}</small>
        </label>
        <label>
          {P.clases}
          <input type="date" value={clases} onChange={(e) => setClases(e.target.value)} onBlur={registrar} />
          <small>{P.clasesAyuda}</small>
        </label>
      </div>
      {salida && (
        <div className="est-entra">
          <div className="est-plazos-res">
            <div className={`est-plazo est-plazo-${salida.estado === "rojo" ? "rojo" : "verde"}`}>
              <span>{P.tope}</span>
              <strong>{fmt(salida.tope)}</strong>
              <small>{P.topeNota(P.diasTurista)}</small>
            </div>
            <div className={`est-plazo est-plazo-${salida.estado}`}>
              <span>{P.recomendada}</span>
              <strong>{fmt(salida.recomendada)}</strong>
              <small>{P.recomendadaNota(DIAS_ANTELACION)}</small>
            </div>
            <div className="est-plazo">
              <span>{P.resolucion}</span>
              <strong>{fmt(salida.resolucion)}</strong>
              <small>{P.resolucionNota}</small>
            </div>
          </div>
          <p className={`est-plazos-aviso est-plazos-aviso-${salida.estado}`}>{salida.aviso}</p>
        </div>
      )}
      <p className="est-descargo">{P.descargo}</p>
    </div>
  );
}

function Checklist({ wa }) {
  const [tengo, setTengo] = useState(() => new Set());
  const D = T.documentos;
  const total = D.lista.length;
  const faltan = D.lista.filter((d) => !tengo.has(d.id)).map((d) => d.corto);
  const marcar = (id) =>
    setTengo((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  return (
    <div className="est-check">
      <div className="est-check-lista">
        {D.lista.map((d) => (
          <label key={d.id} className={`est-check-item${tengo.has(d.id) ? " est-check-on" : ""}`}>
            <input type="checkbox" checked={tengo.has(d.id)} onChange={() => marcar(d.id)} />
            <Icono nombre={d.icono} size={16} />
            <span>{d.nombre}</span>
          </label>
        ))}
      </div>
      <div className="est-check-pie">
        <div className="est-barra" aria-hidden="true"><span style={{ width: `${(tengo.size / total) * 100}%` }} /></div>
        <strong>{D.de(tengo.size, total)}</strong>
        <span>{tengo.size === total ? D.completo : D.faltan(total - tengo.size)}</span>
        <a href={wa(D.whatsappDetalle(tengo.size, faltan))} target="_blank" rel="noopener" className="est-btn est-btn-wa mov-brillo" onClick={() => registrarEvento("estancia_whatsapp", { donde: "checklist", faltan: faltan.length })}>
          <Icono nombre="whatsapp" size={18} />
          {D.whatsapp}
        </a>
      </div>
    </div>
  );
}

function Compara() {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="est-compara">
      {COMPARATIVA.map((c, i) => (
        <div key={c.criterio} className={`est-compara-fila${abierta === i ? " est-compara-on" : ""}`}>
          <button type="button" onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
            <Icono nombre={c.icono} size={18} />
            {c.criterio}
            <span aria-hidden="true">+</span>
          </button>
          {abierta === i && (
            <div className="est-compara-cuerpo est-entra">
              <p><b>{T.compara.visa}</b>{c.visa}</p>
              <p className="est-compara-yo"><b>{T.compara.estancia}</b>{c.estancia}</p>
            </div>
          )}
        </div>
      ))}
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
  const pasoMotivo = cascada(60, 300);
  const pasoPaso = cascada();
  const pasoResultado = cascada();
  const clave = CATEGORIAS_CASOS.find((c) => c.id === T.resultados.clave);
  const otros = CATEGORIAS_CASOS.filter((c) => c.id !== T.resultados.clave);
  const numero = (c) => Number(String(c.cifra).replace(/[^\d]/g, ""));
  const prefijo = (c) => String(c.cifra).replace(/[\d.]/g, "");

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
            {[["plazos", "Tus plazos"], ["documentos", "Documentos"], ["denegaciones", "Por qué deniegan"], ["resultados", "Resultados"], ["paquete", "El paquete"]].map(([id, t]) => (
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
                { texto: "100 % telemática", top: "46%", right: "-7%", rot: 5 },
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

      {/* Los plazos */}
      <section className="est-seccion lfx-banda lfx-banda-cielo" id="plazos">
        <Numeral n="01" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="est-rotulo">{T.plazos.rotulo}</p>
            <h2 className="est-h2">{T.plazos.titulo}</h2>
            <p className="est-lead">{T.plazos.lead}</p>
          </div>
          <img src={ilusPortapapeles} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
        </div>
        <div data-revelar="escala">
          <Plazos />
        </div>
      </section>

      {/* Los documentos */}
      <section className="est-seccion" id="documentos">
        <Numeral n="02" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="est-rotulo">{T.documentos.rotulo}</p>
            <h2 className="est-h2">{T.documentos.titulo}</h2>
            <p className="est-lead">{T.documentos.lead}</p>
          </div>
          <img src={ilusCarpeta} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
        </div>
        <div data-revelar="escala">
          <Checklist wa={wa} />
        </div>
      </section>

      {/* Por qué deniegan */}
      <section className="est-seccion est-seccion-ancha est-seccion-noche" id="denegaciones">
        <Numeral n="03" claro />
        <div data-revelar>
          <p className="est-rotulo est-rotulo-sol">{T.denegaciones.rotulo}</p>
          <h2 className="est-h2">{T.denegaciones.titulo}</h2>
          <p className="est-lead">{T.denegaciones.lead}</p>
        </div>
        <div className="est-motivos">
          {T.denegaciones.lista.map((m) => (
            <article key={m.titulo} className="est-motivo" data-revelar="escala" style={pasoMotivo()}>
              <span className="est-paquete-icono est-icono-sol"><Icono nombre={m.icono} size={18} /></span>
              <h3>{m.titulo}</h3>
              <p className="est-motivo-mal"><b>{T.denegaciones.motivo}</b> {m.motivo}</p>
              <p className="est-motivo-bien"><b>{T.denegaciones.evitamos}</b> {m.evitamos}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Resultados */}
      <section className="est-seccion" id="resultados">
        <Numeral n="04" />
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
        <a href="/casos-de-exito" onClick={irA("/casos-de-exito")} className="est-enlace est-enlace-bloque">
          {T.resultados.casos}
        </a>
      </section>
      <section className="est-opiniones">
        <Opiniones ubicacion="estancia" />
      </section>

      {/* Visado o estancia */}
      <section className="est-seccion" id="compara">
        <Numeral n="05" />
        <div data-revelar>
          <p className="est-rotulo">{T.compara.rotulo}</p>
          <h2 className="est-h2">{T.compara.titulo}</h2>
          <p className="est-lead">{T.compara.lead}</p>
        </div>
        <div data-revelar="escala">
          <Compara />
        </div>
        <a href="/visa-o-estancia" onClick={irA("/visa-o-estancia")} className="est-enlace est-enlace-bloque">
          {T.compara.test}
        </a>
      </section>

      {/* El paquete */}
      <section className="est-seccion est-seccion-ancha lfx-puntos" id="paquete">
        <Numeral n="06" />
        <div data-revelar>
          <p className="est-rotulo">{T.paquete.rotulo}</p>
          <h2 className="est-h2">{T.paquete.titulo}</h2>
          <p className="est-lead">{T.paquete.lead}</p>
        </div>
        <div className="est-paquetes">
          <article className="est-paquete est-paquete-destacado" data-revelar="escala">
            <span className="est-paquete-cinta">{T.paquete.permisoCorto}</span>
            <span className="est-paquete-icono"><Icono nombre={ESTANCIA_ESTUDIOS.icono} size={20} /></span>
            <h3>{ESTANCIA_ESTUDIOS.nombre}</h3>
            <p className="est-paquete-sub">{ESTANCIA_ESTUDIOS.subtitulo}</p>
            <p className="est-paquete-precio">{eur(ESTANCIA_ESTUDIOS.precio)}</p>
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
            <a href={wa(`Me interesa el paquete ${ESTANCIA_ESTUDIOS.nombre} (${eur(ESTANCIA_ESTUDIOS.precio)}). Ya estoy en España o entro pronto como turista.`)} target="_blank" rel="noopener" className="est-btn est-btn-sol mov-brillo" onClick={() => registrarEvento("estancia_paquete", {})}>
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
      <section className="est-seccion est-como lfx-banda lfx-banda-sol" id="como">
        <Numeral n="07" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="est-rotulo">{T.como.rotulo}</p>
            <h2 className="est-h2">{T.como.titulo}</h2>
            <p className="est-lead">{T.como.lead}</p>
          </div>
          <img src={ilusAsesora} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
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
        <Numeral n="08" />
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
