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
import { ADEMAS, BENEFICIOS, FAQ, INCLUYE, LISTAS, MATRICULA } from "../../../config/paqueteMaster2027";
import { IPREM_REFERENCIA } from "../../../config/costeVida";
import { eur } from "../../../config/paqueteMaster2027Resumen";
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
import { Cinta, Numeral, Stickers } from "../../../components/common/EfectosLanding";
import { useParallax } from "../../../lib/parallax";
import { MASTER as T } from "./textos";
import logo from "../../../assets/images/logo.png";
import fotoBandera from "../../../assets/images/landing/master-2027/foto-bandera-espana.webp";
import ilusAsesora from "../../../assets/images/landing/master-2027/ilus-asesora-auriculares.webp";
import ilusLupa from "../../../assets/images/landing/master-2027/ilus-documentos-lupa.webp";
import "../../../styles/movimiento.css";
import "./master.css";

// Los tres niveles de matrícula, calculados sobre la tabla oficial de la
// landing del paquete: el mínimo de cada lista y cuántas comunidades tiene.
const NIVELES = LISTAS.map((l) => {
  const filas = MATRICULA.filas.filter((f) => f.lista === l.id);
  const minimos = filas.filter((f) => f.min).map((f) => f.min);
  return { id: l.id, nombre: l.nombre, n: filas.length, desde: minimos.length ? Math.min(...minimos) : null, cadaUni: filas.some((f) => f.cadaUniversidad) };
});

/** Dos tarjetas del portal reconstruidas con datos de muestra: nítidas, no
 *  capturas desenfocadas. Lo que enseñan existe tal cual en el portal. */
function PortalMock({ tipo }) {
  const P = T.portal;
  if (tipo === "informe") {
    const d = P.informe;
    return (
      <div className="mst-portal" aria-label={`${P.ejemplo}: ${d.cab}`}>
        <div className="mst-portal-cab"><span>{d.cab}</span><b>{d.pagina}</b></div>
        <p className="mst-portal-titulo">{d.master}</p>
        <p className="mst-portal-sub">{d.uni}</p>
        <div className="mst-portal-datos">
          {d.datos.map(([k, v]) => (
            <span key={k}>{k} <b>{v}</b></span>
          ))}
        </div>
        <span className="mst-portal-chip">{d.chip}</span>
        <small>{P.ejemplo}</small>
      </div>
    );
  }
  const d = P.postulaciones;
  return (
    <div className="mst-portal" aria-label={`${P.ejemplo}: ${d.cab}`}>
      <div className="mst-portal-cab"><span>{d.cab}</span><b>{d.portal}</b></div>
      <ol className="mst-portal-linea">
        {d.hitos.map(([k, v, estado]) => (
          <li key={k} className={estado ? `mst-portal-${estado}` : ""}>
            <span>{k}</span>
            {v && <b>{v}</b>}
          </li>
        ))}
      </ol>
      <span className="mst-portal-chip mst-portal-chip-aviso">{d.chip}</span>
      <small>{P.ejemplo}</small>
    </div>
  );
}

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
      }, 220);
    }, 2400);
    return () => clearInterval(t);
  }, [palabras.length]);
  return (
    <span key={i} className={`mst-palabra lfx-palabra-entra${saliendo ? " mst-palabra-sale" : ""}`} aria-live="off">
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
  const foto = useRef(null);
  useParallax(foto);
  const wa = (detalle) => whatsappDesde("master-todo", detalle);
  const [calculadoraEnPantalla, setCalculadoraEnPantalla] = useState(false);
  const [verMatricula, setVerMatricula] = useState(false);
  const [verCalculadora, setVerCalculadora] = useState(false);

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
  const pasoError = cascada(60, 300);

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
            <a href={wa(T.hero.whatsappDetalle)} target="_blank" rel="noopener" className="mst-btn mst-btn-wa mov-brillo lfx-latido" onClick={() => registrarEvento("master_todo_whatsapp", { donde: "hero" })}>
              <Icono nombre="whatsapp" size={20} />
              {T.hero.whatsapp}
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="mst-btn mst-btn-borde" onClick={() => registrarEvento("master_todo_sesion", { donde: "hero" })}>
              <Icono nombre="calendario" size={18} />
              {T.hero.sesion}
            </a>
          </div>
          <nav className="mst-atajos" aria-label="Secciones">
            {[["porque-espana", "Por qué España"], ["oficial", "Máster oficial"], ["cuesta", "Cuánto cuesta"], ["errores", "Errores comunes"], ["hacemos", "Qué hacemos"], ["como", "Cómo"], ["videos", "Vídeos"]].map(([id, t]) => (
              <button type="button" key={id} onClick={() => irA(id)}>{t}</button>
            ))}
          </nav>
        </div>
        <figure className="mst-hero-foto" data-revelar="escala">
          <div className="lfx-parallax" ref={foto}>
            <img src={T.retrato} alt="Carina Meza, CEO y consultora legal de Inspira Legal" width="640" height="619" loading="eager" />
            <Stickers
              lista={[
                { texto: `${CATEGORIAS_CASOS[0].cifra} ${CATEGORIAS_CASOS[0].titulo.toLowerCase()}`, top: "7%", left: "-5%", rot: -7, tono: "sol" },
                { texto: "30 h de trabajo", top: "46%", right: "-7%", rot: 5 },
                { texto: "Título oficial · UE", bottom: "12%", left: "-3%", rot: -4, tono: "noche" },
              ]}
            />
          </div>
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

      <div className="mst-cinta"><Cinta items={T.cinta} tono="noche" /></div>

      {/* Por qué España */}
      <section className="mst-seccion lfx-banda lfx-banda-cielo" id="porque-espana">
        <Numeral n="01" />
        <div data-revelar>
          <p className="mst-rotulo">{T.porqueEspana.rotulo}</p>
          <h2 className="mst-h2">{T.porqueEspana.titulo}</h2>
          <p className="mst-lead">{T.porqueEspana.lead}</p>
        </div>
        <figure className="lfx-foto" data-revelar="escala">
          <img src={fotoBandera} alt="Bandera de España" loading="lazy" width="1200" height="675" />
        </figure>
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
        <Numeral n="02" claro />
        <div data-revelar>
          <p className="mst-rotulo mst-rotulo-sol">{T.oficial.rotulo}</p>
          <h2 className="mst-h2">{T.oficial.titulo}</h2>
          <p className="mst-lead">{T.oficial.lead}</p>
        </div>
        <ul className="mst-sellos" data-revelar>
          {T.oficial.sellos.map((s) => (
            <li key={s.texto}>
              <Icono nombre={s.icono} size={14} />
              {s.texto}
            </li>
          ))}
        </ul>
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
      <section className="mst-seccion" id="cuesta">
        <Numeral n="03" />
        <div data-revelar>
          <p className="mst-rotulo">{T.cuesta.rotulo}</p>
          <h2 className="mst-h2">{T.cuesta.titulo}</h2>
          <p className="mst-lead">{T.cuesta.lead}</p>
        </div>
        <div className="mst-niveles">
          {NIVELES.map((n, i) => (
            <div key={n.id} className={`mst-nivel mst-nivel-${n.id}`} data-revelar="escala" style={{ "--r": `${i * 90}ms` }}>
              <span className="mst-nivel-nombre">{n.nombre}</span>
              <span className="mst-nivel-n">{T.cuesta.comunidades(n.n)}</span>
              {n.desde && (
                <strong>
                  <small>{T.cuesta.desde}</small> {eur(n.desde)}
                </strong>
              )}
              <span className="mst-nivel-pie">{T.cuesta.alAnio}{n.cadaUni ? ` · ${T.cuesta.cadaUni}` : ""}</span>
            </div>
          ))}
        </div>
        <p className="mst-nota" data-revelar>{T.cuesta.vivir(eur(IPREM_REFERENCIA.mensual))} {T.cuesta.nota}</p>
        <div className="mst-acciones mst-acciones-izq" data-revelar>
          <button type="button" className={`mst-btn ${verMatricula ? "mst-btn-claro" : "mst-btn-noche"}`} aria-expanded={verMatricula} onClick={() => { setVerMatricula((v) => !v); registrarEvento("master_todo_matricula", { abrir: !verMatricula }); }}>
            <Icono nombre="mapa" size={16} />
            {verMatricula ? T.cuesta.ocultarMatricula : T.cuesta.verMatricula}
          </button>
          <button type="button" className={`mst-btn ${verCalculadora ? "mst-btn-claro" : "mst-btn-sol"}`} aria-expanded={verCalculadora} onClick={() => { setVerCalculadora((v) => !v); registrarEvento("master_todo_calculadora", { abrir: !verCalculadora }); }}>
            <Icono nombre="euro" size={16} />
            {verCalculadora ? T.cuesta.ocultarCalculadora : T.cuesta.calcular}
          </button>
        </div>
      </section>
      {verMatricula && (
        <div className="mst-m27 mst-entra">
          <MatriculaComunidades />
        </div>
      )}
      {verCalculadora && (
        <div className="mst-m27 mst-entra">
          <Calculadora onEnPantalla={setCalculadoraEnPantalla} abiertaInicial />
        </div>
      )}

      {/* Errores comunes */}
      <section className="mst-seccion mst-seccion-noche" id="errores">
        <Numeral n="04" claro />
        <div data-revelar>
          <p className="mst-rotulo mst-rotulo-sol">{T.errores.rotulo}</p>
          <h2 className="mst-h2">{T.errores.titulo}</h2>
          <p className="mst-lead">{T.errores.lead}</p>
        </div>
        <div className="mst-errores">
          {T.errores.lista.map((e) => (
            <article key={e.titulo} className="mst-error" data-revelar="escala" style={pasoError()}>
              <span className="mst-icono mst-icono-sol"><Icono nombre={e.icono} size={20} /></span>
              <h3>{e.titulo}</h3>
              <p className="mst-error-mal"><b>{T.errores.error}</b> {e.error}</p>
              <p className="mst-error-bien"><b>{T.errores.nosotros}</b> {e.solucion}</p>
            </article>
          ))}
        </div>
        <p className="mst-error-pista" aria-hidden="true">{T.errores.pista} →</p>
      </section>

      {/* Qué hacemos */}
      <section className="mst-seccion lfx-puntos" id="hacemos">
        <Numeral n="05" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="mst-rotulo">{T.hacemos.rotulo}</p>
            <h2 className="mst-h2">{T.hacemos.titulo}</h2>
            <p className="mst-lead">{T.hacemos.lead}</p>
          </div>
          <img src={ilusLupa} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
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
      <section className="mst-seccion lfx-banda lfx-banda-sol" id="como">
        <Numeral n="06" />
        <div className="lfx-cab-ilus" data-revelar>
          <div>
            <p className="mst-rotulo">{T.como.rotulo}</p>
            <h2 className="mst-h2">{T.como.titulo}</h2>
            <p className="mst-lead">{T.como.lead}</p>
          </div>
          <img src={ilusAsesora} alt="" className="lfx-ilus" loading="lazy" width="150" height="150" />
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
                {p.captura && <PortalMock tipo={p.captura} />}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Por qué nosotros */}
      <section className="mst-seccion mst-seccion-ancha" id="nosotros">
        <Numeral n="07" />
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
        <Numeral n="08" />
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
          <a href={T.precio.paquetesHref} className="mst-btn mst-btn-borde mst-btn-paquetes" onClick={() => registrarEvento("master_todo_paquetes", {})}>
            {T.precio.paquetes} →
          </a>
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
        <img src={T.graduacion} alt="" className="lfx-foto-redonda" loading="lazy" width="480" height="308" />
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
