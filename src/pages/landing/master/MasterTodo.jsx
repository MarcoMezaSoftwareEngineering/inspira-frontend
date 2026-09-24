// src/pages/landing/master/MasterTodo.jsx
//
// /master: la landing del máster para quien escribe «quiero hacer un máster
// en España». Cuenta, en este orden, lo que esa persona quiere saber: por qué
// España, por qué un máster oficial, cuánto cuesta el máster, qué hacemos por
// ella y cómo, y por qué nosotros. El precio del paquete no sale: se cotiza
// en la sesión y se manda por escrito.
//
// Reutiliza las piezas ya probadas de la landing del paquete (matrícula por
// comunidad, calculadora, fechas, equipo con opiniones) y las del portal
// (expediente digital). Textos en ./textos.js; nada escrito aquí.
import { useEffect, useRef, useState } from "react";
import Icono from "../../../components/common/Icono";
import BarraCta, { ProgresoLectura } from "../../../components/common/BarraCta";
import { CarruselVideos } from "../../../components/common/VideoVertical";
import { useSEO } from "../../../hooks/useSEO";
import { CATEGORIAS_CASOS } from "../../../config/casos";
import { CALENDLY_URL, whatsappDesde } from "../../../config/contacto";
import { ADEMAS, BENEFICIOS, FAQ, INCLUYE } from "../../../config/paqueteMaster2027";
import { registrarEvento } from "../../../lib/analytics";
import { cascada, useRevelar } from "../../../lib/revelar";
import { CifraAnimada, ESTILOS_M27 } from "../master2027/comunes";
import { fijarPagina } from "../master2027/medicion";
import MatriculaComunidades from "../master2027/MatriculaComunidades";
import Calculadora from "../master2027/Calculadora";
import Fechas from "../master2027/Fechas";
import Equipo from "../master2027/Equipo";
import ExpedienteDigital from "./ExpedienteDigital";
import Herramientas from "./Herramientas";
import { MASTER as T } from "./textos";
import logo from "../../../assets/images/logo.png";
import "../../../styles/movimiento.css";
import "./master.css";

const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/** La palabra del titular que va cambiando: una ciudad, luego otra. */
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
  return (
    <span className={`mst-palabra${saliendo ? " mst-palabra-sale" : ""}`} aria-live="off">
      {palabras[i]}
    </span>
  );
}

function Faq() {
  const [abierta, setAbierta] = useState(0);
  const lista = T.faqIds.map((id) => FAQ.preguntas.find((p) => p.id === id)).filter(Boolean);
  const texto = (a) => a.map((x) => (typeof x === "string" ? x : x.enlace)).join("");
  return (
    <div className="mst-faq">
      {lista.map((f, i) => (
        <div key={f.id} className={`mst-faq-item${abierta === i ? " mst-faq-on" : ""}`}>
          <button type="button" onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
            {f.q}
            <span aria-hidden="true">+</span>
          </button>
          {abierta === i && <p className="mst-entra">{texto(f.a)}</p>}
        </div>
      ))}
    </div>
  );
}

export default function MasterTodo() {
  useSEO(T.seo);
  const raiz = useRef(null);
  useRevelar(raiz);
  const wa = (detalle) => whatsappDesde("master-todo", detalle);
  const [calculadoraEnPantalla, setCalculadoraEnPantalla] = useState(false);

  useEffect(() => {
    fijarPagina("master_todo");
    document.body.classList.add("sin-barra-sitio");
    return () => {
      fijarPagina("landing_2027");
      document.body.classList.remove("sin-barra-sitio");
    };
  }, []);

  const pasoCifra = cascada();
  const pasoEspana = cascada();
  const pasoOficial = cascada();
  const pasoIncluye = cascada(40, 360);
  const pasoComo = cascada(80, 480);

  return (
    <div className="mst" ref={raiz}>
      <style>{ESTILOS_M27}</style>
      <ProgresoLectura />

      <header className="mst-cabecera">
        <img src={logo} alt="Inspira Legal" width={320} height={107} />
        <a href="/">Ver sitio completo →</a>
      </header>

      {/* Quién y qué */}
      <section className="mst-hero">
        <span className="mst-orbe mst-orbe-a" aria-hidden="true" />
        <span className="mst-orbe mst-orbe-b" aria-hidden="true" />
        <div className="mst-hero-texto" data-revelar="izquierda">
          <p className="mst-rotulo mst-rotulo-sol">
            <Icono nombre="birrete" size={14} />
            {T.hero.rotulo}
          </p>
          <h1>
            {T.hero.tituloInicio} <PalabraRotante palabras={T.hero.palabras} />
            <br />
            {T.hero.tituloFin}
          </h1>
          <p className="mst-lead">{T.hero.lead}</p>
          <div className="mst-acciones">
            <a href={wa(T.hero.whatsappDetalle)} target="_blank" rel="noopener" className="mst-btn mst-btn-wa mov-brillo" onClick={() => registrarEvento("master_todo_whatsapp", { donde: "hero" })}>
              <Icono nombre="whatsapp" size={20} />
              {T.hero.whatsapp}
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="mst-btn mst-btn-borde" onClick={() => registrarEvento("master_todo_sesion", { donde: "hero" })}>
              <Icono nombre="calendario" size={18} />
              {T.hero.sesion}
            </a>
          </div>
          <nav className="mst-atajos" aria-label="Secciones">
            {[["porque-espana", "Por qué España"], ["oficial", "Máster oficial"], ["cuesta", "Cuánto cuesta"], ["hacemos", "Qué hacemos"], ["como", "Cómo"], ["videos", "Vídeos"]].map(([id, t]) => (
              <button type="button" key={id} onClick={() => irA(id)}>{t}</button>
            ))}
          </nav>
        </div>
        <figure className="mst-hero-foto" data-revelar="escala">
          <img src={T.retrato} alt="Carina Meza, CEO y consultora legal de Inspira Legal" width="640" height="619" loading="eager" />
          <figcaption>{T.hero.quien}</figcaption>
        </figure>
      </section>

      {/* La prueba */}
      <section className="mst-cifras" aria-label="Resultados de Inspira Legal">
        {CATEGORIAS_CASOS.map((c) => {
          const n = Number(String(c.cifra).replace(/[^\d]/g, ""));
          const prefijo = String(c.cifra).replace(/[\d.]/g, "");
          return (
            <div key={c.id} className="mst-cifra" data-revelar="escala" style={pasoCifra()}>
              <span className="mst-icono-chico"><Icono nombre={c.icono} size={16} /></span>
              <strong>{n > 0 ? <CifraAnimada valor={n} prefijo={prefijo} /> : c.cifra}</strong>
              <span>{c.titulo}</span>
            </div>
          );
        })}
      </section>

      {/* Por qué España */}
      <section className="mst-seccion" id="porque-espana">
        <div data-revelar>
          <p className="mst-rotulo">{T.porqueEspana.rotulo}</p>
          <h2 className="mst-h2">{T.porqueEspana.titulo}</h2>
          <p className="mst-lead">{T.porqueEspana.lead}</p>
        </div>
        <div className="mst-rejilla-2">
          {T.porqueEspana.puntos.map((p, i) => (
            <div key={p.titulo} className="mst-tarjeta" data-revelar="escala" style={pasoEspana()}>
              <span className="mst-icono mov-flota" style={{ "--r": `${i * 350}ms` }}><Icono nombre={p.icono} size={20} /></span>
              <strong>{p.titulo}</strong>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué oficial */}
      <section className="mst-seccion mst-seccion-noche" id="oficial">
        <div data-revelar>
          <p className="mst-rotulo mst-rotulo-sol">{T.oficial.rotulo}</p>
          <h2 className="mst-h2">{T.oficial.titulo}</h2>
          <p className="mst-lead">{T.oficial.lead}</p>
        </div>
        <div className="mst-rejilla-3">
          {T.oficial.puntos.map((p) => (
            <div key={p.titulo} className="mst-tarjeta mst-tarjeta-vidrio" data-revelar="escala" style={pasoOficial()}>
              <span className="mst-icono mst-icono-sol"><Icono nombre={p.icono} size={20} /></span>
              <strong>{p.titulo}</strong>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
        <p className="mst-aviso" data-revelar>{T.oficial.aviso}</p>
      </section>

      {/* Cuánto cuesta */}
      <section className="mst-seccion mst-seccion-ancha" id="cuesta">
        <div data-revelar>
          <p className="mst-rotulo">{T.cuesta.rotulo}</p>
          <h2 className="mst-h2">{T.cuesta.titulo}</h2>
          <p className="mst-lead">{T.cuesta.lead}</p>
        </div>
      </section>
      <div className="mst-m27" data-revelar>
        <MatriculaComunidades />
        <Calculadora onEnPantalla={setCalculadoraEnPantalla} />
      </div>

      {/* Qué hacemos */}
      <section className="mst-seccion" id="hacemos">
        <div data-revelar>
          <p className="mst-rotulo">{T.hacemos.rotulo}</p>
          <h2 className="mst-h2">{T.hacemos.titulo}</h2>
          <p className="mst-lead">{T.hacemos.lead}</p>
        </div>
        <ul className="mst-incluye">
          {INCLUYE.map((t) => (
            <li key={t} data-revelar="izquierda" style={pasoIncluye()}>
              <span className="mst-check"><Icono nombre="check" size={14} /></span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mst-h5" data-revelar>{T.hacemos.ademas}</p>
        <div className="mst-rejilla-2">
          {BENEFICIOS.tarjetas.map((b, i) => (
            <div key={b.id} className="mst-tarjeta" data-revelar="escala" style={{ "--r": `${i * 70}ms` }}>
              <span className="mst-icono"><Icono nombre={b.icono} size={20} /></span>
              <strong>{b.titulo}</strong>
              <p>{b.texto}</p>
            </div>
          ))}
        </div>
        <p className="mst-nota" data-revelar>{ADEMAS[3]}</p>
      </section>

      {/* Cómo */}
      <section className="mst-seccion" id="como">
        <div data-revelar>
          <p className="mst-rotulo">{T.como.rotulo}</p>
          <h2 className="mst-h2">{T.como.titulo}</h2>
          <p className="mst-lead">{T.como.lead}</p>
        </div>
        <ol className="mst-pasos">
          {T.como.pasos.map((p, i) => (
            <li key={p.titulo} data-revelar="izquierda" style={pasoComo()}>
              <span className="mst-paso-num">{i + 1}</span>
              <div className="mst-paso-cuerpo">
                <h3>
                  <Icono nombre={p.icono} size={16} /> {p.titulo}
                </h3>
                <div className="mst-paso-dos">
                  <p><b>{T.como.tuEtiqueta}</b> {p.tu}</p>
                  <p><b>{T.como.nosotrosEtiqueta}</b> {p.nosotros}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Por qué nosotros */}
      <section className="mst-seccion mst-seccion-ancha" id="nosotros">
        <div data-revelar>
          <p className="mst-rotulo">{T.nosotros.rotulo}</p>
          <h2 className="mst-h2">{T.nosotros.titulo}</h2>
        </div>
      </section>
      <div className="mst-m27">
        <ExpedienteDigital />
        <Equipo />
      </div>

      {/* Vídeos */}
      <section className="mst-seccion" id="videos">
        <div data-revelar>
          <p className="mst-rotulo">{T.videos.rotulo}</p>
          <h2 className="mst-h2">{T.videos.titulo}</h2>
          <p className="mst-lead">{T.videos.lead}</p>
        </div>
        <div data-revelar="escala" className="mst-videos">
          <CarruselVideos lista={T.videos.lista} evento="master_todo_video" />
        </div>
      </section>

      {/* Fechas y herramientas */}
      <div className="mst-m27">
        <Fechas />
        <Herramientas />
      </div>

      {/* El precio */}
      <section className="mst-seccion mst-seccion-noche" id="precio">
        <div className="mst-precio" data-revelar="escala">
          <p className="mst-rotulo mst-rotulo-sol">{T.precio.rotulo}</p>
          <h2 className="mst-h2">{T.precio.titulo}</h2>
          <p className="mst-lead">{T.precio.texto}</p>
          <div className="mst-acciones">
            <a href={wa(T.hero.whatsappDetalle)} target="_blank" rel="noopener" className="mst-btn mst-btn-wa mov-brillo" onClick={() => registrarEvento("master_todo_whatsapp", { donde: "precio" })}>
              <Icono nombre="whatsapp" size={20} />
              {T.precio.whatsapp}
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="mst-btn mst-btn-sol" onClick={() => registrarEvento("master_todo_sesion", { donde: "precio" })}>
              <Icono nombre="calendario" size={18} />
              {T.precio.sesion}
            </a>
          </div>
          <p className="mst-nota mst-nota-clara">{T.precio.sesionTexto}</p>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mst-seccion">
        <div data-revelar>
          <h2 className="mst-h2">{T.faqTitulo}</h2>
          <Faq />
        </div>
      </section>

      {/* Cierre */}
      <section className="mst-cierre" data-revelar="escala">
        <h2 className="mst-h2">{T.cierre.titulo}</h2>
        <p className="mst-lead">{T.cierre.texto}</p>
        <div className="mst-acciones">
          <a href={wa(T.hero.whatsappDetalle)} target="_blank" rel="noopener" className="mst-btn mst-btn-wa mov-brillo" onClick={() => registrarEvento("master_todo_whatsapp", { donde: "cierre" })}>
            <Icono nombre="whatsapp" size={20} />
            {T.hero.whatsapp}
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener" className="mst-btn mst-btn-claro" onClick={() => registrarEvento("master_todo_sesion", { donde: "cierre" })}>
            <Icono nombre="calendario" size={18} />
            {T.hero.sesion}
          </a>
        </div>
        <p className="mst-descargo">{T.descargo}</p>
        <p className="mst-pie">© {new Date().getFullYear()} Inspira Legal · <a href="/">inspira-legal.cloud</a></p>
      </section>

      <BarraCta
        whatsapp={wa(T.hero.whatsappDetalle)}
        sesion={CALENDLY_URL}
        textoWhatsapp="Cotización"
        textoSesion={T.hero.sesionCorta}
        oculta={calculadoraEnPantalla}
        onWhatsapp={() => registrarEvento("master_todo_whatsapp", { donde: "barra" })}
        onSesion={() => registrarEvento("master_todo_sesion", { donde: "barra" })}
      />
    </div>
  );
}
