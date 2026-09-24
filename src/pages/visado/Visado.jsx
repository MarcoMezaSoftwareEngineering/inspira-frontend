// src/pages/visado/Visado.jsx
//
// /visado: la landing de venta del visado de estudios. Se manda por WhatsApp a
// quien escribe «ya tengo carta de admisión», así que asume esa situación y
// va al grano en este orden: la cara (quién te atiende), la prueba (cifras),
// la decisión (visado o estancia, en tres preguntas), los vídeos, las
// opiniones, los tres paquetes con lo que incluyen y lo que no, cómo se
// empieza (la sesión antes que el paquete), el checklist de lo que ya tiene,
// las preguntas de siempre y la puerta.
//
// Lo interactivo aquí no es adorno: el mini test usa la misma `evaluar` de
// /visa-o-estancia (la regla de negocio vive en config/visaOEstancia.js) y el
// checklist reutiliza los nueve documentos de /expediente. Todo lo que se
// afirma sale de config: precios de metodo.js, cifras de CATEGORIAS_CASOS.
import { useEffect, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import { CarruselVideos } from "../../components/common/VideoVertical";
import BarraCta, { ProgresoLectura } from "../../components/common/BarraCta";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CATEGORIAS_CASOS } from "../../config/casos";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { PREGUNTAS, evaluar } from "../../config/visaOEstancia";
import { eur } from "../../config/paqueteMaster2027Resumen";
import { registrarEvento } from "../../lib/analytics";
import { cascada, useRevelar } from "../../lib/revelar";
import { CifraAnimada } from "../landing/master2027/comunes";
import Opiniones from "../landing/master2027/Opiniones";
import { DOCUMENTOS } from "../expediente/textos";
import { ESTANCIA_ESTUDIOS, PLANES_VISADO, VISADO as T } from "./textos";
import "../../styles/movimiento.css";
import "./visado.css";

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const P_DONDE = PREGUNTAS.find((p) => p.id === "donde");
const irASeccion = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

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
      }, 320);
    }, 2200);
    return () => clearInterval(t);
  }, [palabras.length]);
  return <span className={`vis-palabra${saliendo ? " vis-palabra-sale" : ""}`}>{palabras[i]}</span>;
}
const P_DINERO = PREGUNTAS.find((p) => p.id === "dinero");

/** Las opciones de una pregunta, como botones de radio. */
function Opciones({ pregunta, valor, onElegir }) {
  return (
    <div className="vis-opciones" role="radiogroup" aria-label={pregunta.pregunta}>
      {pregunta.opciones.map((o, i) => (
        <button
          type="button"
          key={o.valor}
          style={{ "--i": i }}
          role="radio"
          aria-checked={valor === o.valor}
          className={`vis-opcion${valor === o.valor ? " vis-opcion-on" : ""}`}
          onClick={() => onElegir(o.valor)}
        >
          <Icono nombre={o.icono} size={18} />
          <span>
            <strong>{o.txt}</strong>
            <small>{o.desc}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

/** Tres preguntas y la misma regla que el test completo. */
function MiniTest() {
  const [r, setR] = useState({ donde: null, dinero: null, clases: "" });
  const [resultado, setResultado] = useState(null);
  const listo = r.donde && r.dinero;

  const ver = () => {
    const res = evaluar({ donde: r.donde, dinero: r.dinero, clases: r.clases || null, admision: "si", denegada: "no" });
    setResultado(res);
    registrarEvento("visado_test", { donde: r.donde, dinero: r.dinero, via: res.paquete.id });
  };

  if (resultado) {
    const { paquete, titular, porque, visa, estancia } = resultado;
    const via = paquete.id === "estancia" ? estancia : visa;
    return (
      <div className="vis-resultado vis-entra">
        <p className="vis-rotulo">{T.test.paquete}</p>
        <h3>{titular}</h3>
        <p className="vis-resultado-porque">{porque}</p>
        <div className="vis-resultado-paquete">
          <div>
            <strong>{paquete.nombre}</strong>
            <span>{paquete.subtitulo}</span>
          </div>
          <b>
            {paquete.desde ? "desde " : ""}
            {eur(paquete.precio)}
          </b>
        </div>
        {via.pendientes.length > 0 && (
          <>
            <p className="vis-h5">{T.test.resolver}</p>
            <ul className="vis-lista vis-lista-ambar">
              {via.pendientes.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
        <div className="vis-resultado-acciones">
          <a href="#paquetes" className="vis-btn vis-btn-sol">
            Ver los paquetes
          </a>
          <button type="button" className="vis-enlace" onClick={() => setResultado(null)}>
            {T.test.otraVez}
          </button>
        </div>
        <a href="/visa-o-estancia" onClick={irA("/visa-o-estancia")} className="vis-enlace vis-enlace-bloque">
          {T.test.completo}
        </a>
      </div>
    );
  }

  return (
    <div className="vis-test">
      <p className="vis-pregunta">1 · {T.test.donde}</p>
      <Opciones pregunta={P_DONDE} valor={r.donde} onElegir={(v) => setR((x) => ({ ...x, donde: v }))} />
      <p className="vis-pregunta">2 · {T.test.dinero}</p>
      <Opciones pregunta={P_DINERO} valor={r.dinero} onElegir={(v) => setR((x) => ({ ...x, dinero: v }))} />
      <p className="vis-pregunta">3 · {T.test.clases}</p>
      <label className="vis-fecha">
        <input type="date" value={r.clases} onChange={(e) => setR((x) => ({ ...x, clases: e.target.value }))} />
        <small>{T.test.clasesAyuda}</small>
      </label>
      <button type="button" className="vis-btn vis-btn-sol vis-btn-ancho" disabled={!listo} onClick={ver}>
        {T.test.ver}
      </button>
    </div>
  );
}

/** Los tres paquetes, de menos a más, con lo que incluye cada uno. */
function Paquetes({ wa }) {
  const paso = cascada();
  return (
    <div className="vis-paquetes">
      {PLANES_VISADO.map((p) => (
        <article key={p.id} data-revelar="escala" style={paso()} className={`vis-paquete${p.destacado ? " vis-paquete-destacado" : ""}`}>
          {p.destacado && <span className="vis-paquete-cinta">{T.paquetes.recomendado}</span>}
          <span className="vis-paquete-icono mov-flota"><Icono nombre={p.icono} size={20} /></span>
          <h3>{p.nombre}</h3>
          <p className="vis-paquete-sub">{p.subtitulo}</p>
          <p className="vis-paquete-precio">{eur(p.precio)}</p>
          <ul className="vis-lista vis-lista-ok">
            {p.incluye.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="vis-paquete-para">
            <strong>{T.paquetes.para}</strong> {p.para}
          </p>
          <a
            href={wa(`Me interesa la ${p.nombre} de visado (${eur(p.precio)}). Ya tengo carta de admisión.`)}
            target="_blank"
            rel="noopener"
            className={`vis-btn ${p.destacado ? "vis-btn-sol" : "vis-btn-claro"}`}
            onClick={() => registrarEvento("visado_paquete", { id: p.id })}
          >
            {T.paquetes.elegir}
          </a>
        </article>
      ))}
    </div>
  );
}

function Checklist({ wa }) {
  const [tengo, setTengo] = useState(() => new Set());
  const total = DOCUMENTOS.length;
  const faltan = DOCUMENTOS.filter((d) => !tengo.has(d.id)).map((d) => d.corto);
  const marcar = (id) =>
    setTengo((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  return (
    <div className="vis-check">
      <div className="vis-check-lista">
        {DOCUMENTOS.map((d) => (
          <label key={d.id} className={`vis-check-item${tengo.has(d.id) ? " vis-check-on" : ""}`}>
            <input type="checkbox" checked={tengo.has(d.id)} onChange={() => marcar(d.id)} />
            <Icono nombre={d.icono} size={16} />
            <span>{d.nombre}</span>
          </label>
        ))}
      </div>
      <div className="vis-check-pie">
        <div className="vis-barra" aria-hidden="true"><span style={{ width: `${(tengo.size / total) * 100}%` }} /></div>
        <strong>{T.checklist.de(tengo.size, total)}</strong>
        <span>{tengo.size === total ? T.checklist.completo : T.checklist.faltan(total - tengo.size)}</span>
        <a href={wa(T.checklist.whatsappDetalle(tengo.size, faltan))} target="_blank" rel="noopener" className="vis-btn vis-btn-wa mov-brillo" onClick={() => registrarEvento("visado_whatsapp", { donde: "checklist", faltan: faltan.length })}>
          <Icono nombre="whatsapp" size={18} />
          {T.checklist.whatsapp}
        </a>
        <a href="/expediente" onClick={irA("/expediente")} className="vis-enlace">
          {T.checklist.ver}
        </a>
      </div>
    </div>
  );
}

function Faq() {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="vis-faq">
      {T.faq.lista.map((f, i) => (
        <div key={f.q} className={`vis-faq-item${abierta === i ? " vis-faq-on" : ""}`}>
          <button type="button" onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
            {f.q}
            <span aria-hidden="true">{abierta === i ? "−" : "+"}</span>
          </button>
          {abierta === i && <p className="vis-entra">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Visado() {
  useSEO(T.seo);
  const wa = (detalle) => whatsappDesde("visado", detalle);
  const raiz = useRef(null);
  useRevelar(raiz);
  const pasoCifra = cascada();
  const pasoPunto = cascada();
  const pasoPaso = cascada();

  return (
    <main className="vis" ref={raiz}>
      <ProgresoLectura />
      {/* La cara y la promesa */}
      <header className="vis-hero">
        <span className="vis-orbe vis-orbe-a" aria-hidden="true" />
        <span className="vis-orbe vis-orbe-b" aria-hidden="true" />
        <div className="vis-hero-texto" data-revelar="izquierda">
          <p className="vis-rotulo vis-rotulo-sol">
            <Icono nombre="pasaporte" size={14} />
            {T.hero.rotulo}
          </p>
          <h1>
            {T.hero.tituloInicio} <PalabraRotante palabras={T.hero.palabras} />?
            <br />
            {T.hero.tituloFin}
          </h1>
          <p className="vis-lead">{T.hero.lead}</p>
          <div className="vis-acciones">
            <a href={wa(T.cierre.whatsappDetalle)} target="_blank" rel="noopener" className="vis-btn vis-btn-wa mov-brillo" onClick={() => registrarEvento("visado_whatsapp", { donde: "hero" })}>
              <Icono nombre="whatsapp" size={20} />
              {T.hero.whatsapp}
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="vis-btn vis-btn-borde" onClick={() => registrarEvento("visado_sesion", { donde: "hero" })}>
              <Icono nombre="calendario" size={18} />
              {T.hero.sesion}
            </a>
          </div>
          <nav className="vis-atajos" aria-label="Secciones">
            {[["test", "¿Visa o estancia?"], ["videos", "Vídeos"], ["paquetes", "Paquetes"], ["como", "Cómo empezamos"], ["checklist", "Tu expediente"]].map(([id, t]) => (
              <button type="button" key={id} onClick={() => irASeccion(id)}>{t}</button>
            ))}
          </nav>
        </div>
        <figure className="vis-hero-foto" data-revelar="escala">
          <img src={T.retrato} alt="Carina Meza, CEO y consultora legal de Inspira Legal" width="640" height="619" loading="eager" />
          <figcaption>{T.hero.quien}</figcaption>
        </figure>
      </header>

      {/* La prueba */}
      <section className="vis-cifras" aria-label="Resultados de Inspira Legal">
        {CATEGORIAS_CASOS.map((c) => {
          const n = Number(String(c.cifra).replace(/[^\d]/g, ""));
          const prefijo = String(c.cifra).replace(/[\d.]/g, "");
          return (
            <div key={c.id} className="vis-cifra" data-revelar="escala" style={pasoCifra()}>
              <span className="vis-cifra-icono"><Icono nombre={c.icono} size={16} /></span>
              <strong>{n > 0 ? <CifraAnimada valor={n} prefijo={prefijo} /> : c.cifra}</strong>
              <span>{c.titulo}</span>
            </div>
          );
        })}
      </section>

      {/* La decisión */}
      <section className="vis-seccion" id="test">
        <div data-revelar>
          <p className="vis-rotulo">{T.test.rotulo}</p>
          <h2 className="vis-h2">{T.test.titulo}</h2>
          <p className="vis-lead">{T.test.lead}</p>
        </div>
        <div data-revelar="escala">
          <MiniTest />
        </div>
      </section>

      {/* Los vídeos */}
      <section className="vis-seccion vis-videos" id="videos">
        <div data-revelar>
          <h2 className="vis-h2">{T.videos.titulo}</h2>
          <p className="vis-lead">{T.videos.lead}</p>
        </div>
        <div className="vis-videos-rejilla" data-revelar="escala">
          <CarruselVideos lista={T.videos.lista} evento="visado_video" />
        </div>
      </section>

      {/* Lo que dicen */}
      <section className="vis-opiniones">
        <Opiniones ubicacion="visado" />
      </section>

      {/* Los paquetes */}
      <section className="vis-seccion vis-seccion-ancha" id="paquetes">
        <div data-revelar>
          <p className="vis-rotulo">{T.paquetes.rotulo}</p>
          <h2 className="vis-h2">{T.paquetes.titulo}</h2>
          <p className="vis-lead">{T.paquetes.lead}</p>
        </div>
        <Paquetes wa={wa} />
        <div className="vis-estancia" data-revelar>
          <span className="vis-paquete-icono"><Icono nombre={ESTANCIA_ESTUDIOS.icono} size={20} /></span>
          <div>
            <strong>{T.paquetes.estanciaTitulo}</strong>
            <p>
              {T.paquetes.estanciaTexto} {ESTANCIA_ESTUDIOS.nombre}: {eur(ESTANCIA_ESTUDIOS.precio)}.
            </p>
            <a href="/servicios/estancia-estudios" onClick={irA("/servicios/estancia-estudios")} className="vis-enlace">
              {T.paquetes.estanciaEnlace} →
            </a>
          </div>
        </div>

        <div className="vis-incluye" data-revelar>
          <h3>{T.incluye.titulo}</h3>
          <div className="vis-incluye-cols">
            <div>
              <p className="vis-h5">{T.incluye.si}</p>
              <ul className="vis-lista vis-lista-ok">
                {[...PLANES_VISADO[1].incluye, ...PLANES_VISADO[2].incluye.slice(1)].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="vis-h5">{T.incluye.no}</p>
              <ul className="vis-lista vis-lista-no">
                {T.incluye.noLista.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo empezamos */}
      <section className="vis-seccion vis-como" id="como">
        <div data-revelar>
          <p className="vis-rotulo">{T.como.rotulo}</p>
          <h2 className="vis-h2">{T.como.titulo}</h2>
          <p className="vis-lead">{T.como.lead}</p>
        </div>
        <ol className="vis-pasos">
          {T.como.pasos.map((p, i) => (
            <li key={p.titulo} data-revelar="izquierda" style={pasoPaso()}>
              <span className="vis-paso-num">{i + 1}</span>
              <div>
                <h3>
                  <Icono nombre={p.icono} size={16} /> {p.titulo}
                </h3>
                <p>{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <a href={CALENDLY_URL} target="_blank" rel="noopener" className="vis-btn vis-btn-sol mov-brillo" data-revelar onClick={() => registrarEvento("visado_sesion", { donde: "como" })}>
          <Icono nombre="calendario" size={18} />
          {T.hero.sesion}
        </a>
      </section>

      {/* Tipos de acompañamiento */}
      <section className="vis-seccion">
        <div data-revelar>
          <h2 className="vis-h2">{T.acompanamiento.titulo}</h2>
          <p className="vis-lead">{T.acompanamiento.lead}</p>
        </div>
        <div className="vis-puntos">
          {T.acompanamiento.puntos.map((p, i) => (
            <div key={p.titulo} className="vis-punto" data-revelar="escala" style={pasoPunto()}>
              <span className="vis-paquete-icono mov-flota" style={{ "--r": `${i * 400}ms` }}><Icono nombre={p.icono} size={18} /></span>
              <strong>{p.titulo}</strong>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* El checklist */}
      <section className="vis-seccion" id="checklist">
        <div data-revelar>
          <p className="vis-rotulo">{T.checklist.rotulo}</p>
          <h2 className="vis-h2">{T.checklist.titulo}</h2>
          <p className="vis-lead">{T.checklist.lead}</p>
        </div>
        <div data-revelar="escala">
          <Checklist wa={wa} />
        </div>
      </section>

      {/* Preguntas */}
      <section className="vis-seccion">
        <div data-revelar>
          <h2 className="vis-h2">{T.faq.titulo}</h2>
          <Faq />
        </div>
      </section>

      {/* La puerta */}
      <section className="vis-cierre" data-revelar="escala">
        <h2 className="vis-h2">{T.cierre.titulo}</h2>
        <p className="vis-lead">{T.cierre.texto}</p>
        <div className="vis-acciones">
          <a href={wa(T.cierre.whatsappDetalle)} target="_blank" rel="noopener" className="vis-btn vis-btn-wa mov-brillo" onClick={() => registrarEvento("visado_whatsapp", { donde: "cierre" })}>
            <Icono nombre="whatsapp" size={20} />
            {T.cierre.whatsapp}
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener" className="vis-btn vis-btn-claro" onClick={() => registrarEvento("visado_sesion", { donde: "cierre" })}>
            <Icono nombre="calendario" size={18} />
            {T.cierre.sesion}
          </a>
        </div>
        <p className="vis-descargo">{T.descargo}</p>
      </section>

      <BarraCta
        whatsapp={wa(T.cierre.whatsappDetalle)}
        sesion={CALENDLY_URL}
        textoWhatsapp="WhatsApp"
        textoSesion={T.hero.sesionCorta}
        onWhatsapp={() => registrarEvento("visado_whatsapp", { donde: "barra" })}
        onSesion={() => registrarEvento("visado_sesion", { donde: "barra" })}
      />
    </main>
  );
}
