// src/pages/becas2027/Becas2027.jsx
//
// /becas-espana-2027 — la página que se envía por mensaje a quien comenta
// «BECA ESPAÑA 2027» en TikTok.
//
// Quien llega quiere la lista de becas, y se la damos entera: calendario por
// meses (con las fechas de 2026 como referencia), filtro y la web oficial de
// cada una. Pero la página tiene un segundo acto, que es el que importa al
// negocio: cada beca busca un perfil, y para quien no encaja hay másteres
// oficiales económicos. El orden es ese a propósito:
//   1. lo prometido (el calendario),
//   2. la prueba (becas que ganaron asesorados),
//   3. la verdad (el perfil que busca cada una),
//   4. la salida (matrículas reales sin beca, desde 570 €),
//   5. la puerta (WhatsApp y sesión).
import { useMemo, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import VideoVertical from "../../components/common/VideoVertical";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { cascada, useRevelar } from "../../lib/revelar";
import { CifraAnimada } from "../landing/master2027/comunes";
import { BECAS, BECAS2027 as T, FILTROS, MESES } from "./textos";
import { BECADOS, MATRICULAS } from "./casos";
import { LOGOS, MEDIDAS_LOGOS } from "./logos";
import fotoCarina from "../../assets/images/carina/retrato-espana.webp";
import fotoBeca from "../../assets/images/carina/beca-alemania.webp";
import "../../styles/movimiento.css";
import "./becas2027.css";

const eur = (n) => `${n.toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

/** El logotipo de la entidad o, si no lo tenemos, su sigla. */
function Sello({ logo, sigla, grande = false }) {
  const clase = `bk-sello${grande ? " bk-sello-g" : ""}`;
  if (logo && LOGOS[logo]) return <span className={clase}><img src={LOGOS[logo]} alt="" width={MEDIDAS_LOGOS[logo]?.[0]} height={MEDIDAS_LOGOS[logo]?.[1]} loading="lazy" decoding="async" /></span>;
  return <span className={`${clase} bk-sello-sigla`} aria-hidden="true">{sigla}</span>;
}

function Beca({ b, abierta, onAbrir }) {
  return (
    <li className={`bk-beca${abierta ? " bk-beca-abierta" : ""}`}>
      <button type="button" className="bk-beca-cab" aria-expanded={abierta} onClick={() => onAbrir(b.id)}>
        <span className={`bk-fecha${b.exacta ? "" : " bk-fecha-aprox"}`}>
          <small>{b.exacta ? T.calendario.cerro : b.cuando}</small>
          <strong>{b.dia}</strong>
          {b.exacta && <em>{b.cuando}</em>}
        </span>
        <span className="bk-beca-cuerpo">
          <span className="bk-fila">
            <Sello logo={b.logo} sigla={b.sigla} />
            <span className="bk-sigla">{b.sigla}</span>
            {b.red && <span className="bk-red">{b.red}</span>}
          </span>
          <strong className="bk-beca-nombre">{b.nombre}</strong>
          <span className="bk-beca-cubre">{b.cubre}</span>
        </span>
        <Icono nombre="flecha" size={18} className="bk-beca-flecha" />
      </button>
      {abierta && (
        <div className="bk-beca-mas">
          <p className="bk-beca-perfil">
            <strong>
              <Icono nombre="diana" size={14} />
              {T.calendario.perfil}
            </strong>
            {b.perfil}
          </p>
          <p>{b.clave}</p>
          <a href={b.url} target="_blank" rel="noopener nofollow" onClick={() => registrarEvento("becas2027_web_oficial", { beca: b.id })}>
            {T.calendario.web}
            <Icono nombre="flecha" size={14} />
          </a>
        </div>
      )}
    </li>
  );
}

export default function Becas2027() {
  useSEO(T.seo);
  const [filtro, setFiltro] = useState("todas");
  const [abierta, setAbierta] = useState(null);
  const [video, setVideo] = useState(null);
  const raiz = useRef(null);
  useRevelar(raiz);
  const wa = whatsappDesde("becas-2027");
  const pasoPunto = cascada();
  const pasoBecado = cascada();
  const pasoMatricula = cascada();

  const visibles = useMemo(
    () => (filtro === "todas" ? BECAS : BECAS.filter((b) => b.etiquetas.includes(filtro))),
    [filtro]
  );

  const elegirFiltro = (id) => {
    setFiltro(id);
    setAbierta(null);
    registrarEvento("becas2027_filtro", { filtro: id });
  };
  const abrir = (id) => {
    setAbierta((a) => (a === id ? null : id));
    registrarEvento("becas2027_beca", { beca: id });
  };
  const alCalendario = (e) => {
    e.preventDefault();
    document.getElementById("bk-calendario")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [estrella, ...otras] = MATRICULAS;
  const tope = Math.max(...MATRICULAS.map((m) => m.total));

  return (
    <main className="bk" ref={raiz}>
      {/* Lo prometido en el mensaje */}
      <header className="bk-hero">
        <span className="bk-hero-sol" aria-hidden="true" />
        <span className="bk-hero-avion" aria-hidden="true"><Icono nombre="avion" size={22} /></span>
        <div className="bk-hero-texto" data-revelar>
          <p className="bk-rotulo">
            <Icono nombre="birrete" size={15} />
            {T.hero.rotulo}
          </p>
          <h1>
            {T.hero.titulo} <span>{T.hero.tituloSol}</span>
          </h1>
          <p className="bk-hero-lead">{T.hero.lead}</p>
          <ul className="bk-sellos">
            {T.hero.sellos.map((s) => (
              <li key={s}>
                <Icono nombre="check" size={14} />
                {s}
              </li>
            ))}
          </ul>
          <div className="bk-acciones">
            <a href="#bk-calendario" onClick={alCalendario} className="bk-btn bk-btn-sol mov-brillo">
              <Icono nombre="calendario" size={18} />
              {T.hero.cta}
            </a>
            <a href={wa} target="_blank" rel="noopener" className="bk-btn bk-btn-linea" onClick={() => registrarEvento("becas2027_whatsapp", { donde: "hero" })}>
              <Icono nombre="whatsapp" size={18} />
              {T.hero.ctaWa}
            </a>
          </div>
        </div>
        {/* Cinta de logotipos: de quién son las becas */}
        <div className="bk-cinta" aria-hidden="true">
          <div className="bk-cinta-pista">
            {[...Object.keys(LOGOS), ...Object.keys(LOGOS)].map((k, n) => (
              <span key={`${k}-${n}`} className="bk-sello bk-sello-g"><img src={LOGOS[k]} alt="" width={MEDIDAS_LOGOS[k]?.[0]} height={MEDIDAS_LOGOS[k]?.[1]} decoding="async" /></span>
            ))}
          </div>
        </div>
      </header>

      {/* El calendario */}
      <section id="bk-calendario" className="bk-seccion" aria-labelledby="bk-cal-t">
        <h2 id="bk-cal-t" className="bk-h2" data-revelar>{T.calendario.titulo}</h2>
        <p className="bk-referencia" data-revelar>
          <Icono nombre="calendario" size={14} />
          {T.calendario.referencia}
        </p>
        <p className="bk-lead" data-revelar>{T.calendario.lead}</p>

        <div className="bk-filtros" role="group" aria-label="Filtrar becas">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filtro === f.id} className={`bk-filtro${filtro === f.id ? " bk-filtro-on" : ""}`} onClick={() => elegirFiltro(f.id)}>
              {f.texto}
              {filtro === f.id && <span className="bk-filtro-n">{visibles.length}</span>}
            </button>
          ))}
        </div>

        {visibles.length === 0 && <p className="bk-vacio">{T.calendario.vacio}</p>}

        {/* La clave cambia con el filtro para que la lista vuelva a entrar. */}
        <div key={filtro} className="bk-meses">
          {MESES.map((m) => {
            const delMes = visibles.filter((b) => b.mes === m.id);
            if (!delMes.length) return null;
            return (
              <div key={m.id} className="bk-mes">
                <div className="bk-mes-cab">
                  <h3>{m.titulo}</h3>
                  <span>{m.lema}</span>
                </div>
                <ul className="bk-becas">
                  {delMes.map((b) => (
                    <Beca key={b.id} b={b} abierta={abierta === b.id} onAbrir={abrir} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="bk-aviso">
          <Icono nombre="campana" size={15} />
          {T.calendario.aviso}
        </p>
      </section>

      {/* La prueba: becas que ganaron asesorados */}
      <section className="bk-seccion" aria-labelledby="bk-becados-t">
        <p className="bk-rotulo bk-rotulo-oscuro" data-revelar>
          <Icono nombre="trofeo" size={15} />
          {T.becados.rotulo}
        </p>
        <h2 id="bk-becados-t" className="bk-h2" data-revelar>{T.becados.titulo}</h2>
        <p className="bk-lead" data-revelar>{T.becados.lead}</p>
        <ul className="bk-becados">
          {BECADOS.map((c) => (
            <li key={c.id} data-revelar="escala" style={pasoBecado()}>
              <div className="bk-becado-cab">
                <Sello logo={c.logo} sigla={c.nombre[0]} grande />
                <span>
                  <strong>{c.nombre}</strong>
                  <span className="bk-becado-beca">{c.beca}</span>
                </span>
              </div>
              <p className="bk-becado-cifra">
                <b>{c.cifra}</b>
                <span>{c.cifraPie}</span>
              </p>
              {c.master && <p className="bk-becado-master">{c.master}</p>}
              <p className="bk-becado-texto">{c.texto}</p>
              {c.video && (
                <div className="bk-becado-video">
                  <span>{T.becados.video}</span>
                  <VideoVertical v={c.video} activo={video === c.video.id} onActivar={setVideo} evento="becas2027_video" />
                </div>
              )}
              {c.enlace && (
                <a href={c.enlace.href} onClick={irA(c.enlace.href)} className="bk-becado-enlace">
                  {c.enlace.texto}
                  <Icono nombre="flecha" size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* La verdad: cada beca busca un perfil */}
      <section className="bk-verdad" aria-labelledby="bk-verdad-t">
        <div className="bk-verdad-caja">
          <p className="bk-rotulo" data-revelar>
            <Icono nombre="diana" size={15} />
            {T.verdad.rotulo}
          </p>
          <h2 id="bk-verdad-t" className="bk-h2 bk-h2-claro" data-revelar>{T.verdad.titulo}</h2>
          <p className="bk-lead bk-lead-claro" data-revelar>{T.verdad.lead}</p>
          <ul className="bk-puntos">
            {T.verdad.puntos.map((p) => (
              <li key={p.titulo} data-revelar="escala" style={pasoPunto()}>
                <Sello logo={p.logo} sigla={p.sigla} grande />
                <span>
                  <strong>{p.titulo}</strong>
                  {p.texto}
                </span>
              </li>
            ))}
          </ul>
          <p className="bk-verdad-extra" data-revelar>
            <Icono nombre="usuarios" size={16} />
            {T.verdad.extra}
          </p>
          <p className="bk-verdad-cierre" data-revelar>{T.verdad.cierre}</p>
        </div>
      </section>

      {/* La segunda opción: el máster económico */}
      <section className="bk-seccion bk-planb" aria-labelledby="bk-planb-t">
        <p className="bk-rotulo bk-rotulo-oscuro" data-revelar>
          <Icono nombre="destello" size={15} />
          {T.planB.rotulo}
        </p>
        <h2 id="bk-planb-t" className="bk-h2 bk-h2-grande" data-revelar>
          {T.planB.titulo} <span>{T.planB.tituloSol}</span>
        </h2>
        <p className="bk-lead" data-revelar>{T.planB.lead}</p>

        <div className="bk-caso" data-revelar="escala">
          <span className="bk-caso-rotulo">
            <Icono nombre="estrella" size={13} />
            {T.planB.casoRotulo}
          </span>
          <Sello logo={estrella.logo} sigla="USC" grande />
          <p className="bk-caso-cifra">
            <CifraAnimada valor={Math.floor(estrella.total)} />
            <small>,{String(Math.round((estrella.total % 1) * 100)).padStart(2, "0")} €</small>
          </p>
          <p className="bk-caso-texto">
            <strong>{estrella.nombre}</strong> {T.planB.casoTexto} <strong>{estrella.master}</strong> {T.planB.casoEn} <strong>{estrella.uni}</strong>.
          </p>
          <p className="bk-caso-pie">
            <Icono nombre="check" size={14} />
            {T.planB.casoPie}
          </p>
        </div>

        <h3 className="bk-h3" data-revelar>{T.planB.tablaTitulo}</h3>
        <p className="bk-lead bk-lead-chico" data-revelar>{T.planB.tablaLead}</p>
        <ul className="bk-matriculas">
          {otras.map((m) => (
            <li key={m.id} data-revelar style={pasoMatricula()}>
              <Sello logo={m.logo} sigla={m.sigla} grande />
              <span className="bk-matricula-cuerpo">
                <span className="bk-matricula-cab">
                  <strong>{m.nombre}</strong>
                  <b>{eur(m.total)}</b>
                </span>
                <span className="bk-matricula-master">{m.master}</span>
                <span className="bk-matricula-pie">{m.uni} · {m.curso}{m.nota ? ` · ${m.nota}` : ""}</span>
                <span className="bk-precio-barra" aria-hidden="true">
                  <span style={{ width: `${Math.round((m.total / tope) * 100)}%` }} />
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="bk-nota">{T.planB.notaTabla}</p>

        <div className="bk-enlaces">
          {T.planB.enlaces.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => { registrarEvento("becas2027_enlace", { a: l.href }); irA(l.href)(e); }} className="bk-enlace mov-toque">
              <span className="bk-enlace-icono"><Icono nombre={l.icono} size={20} /></span>
              {l.texto}
              <Icono nombre="flecha" size={16} className="bk-enlace-flecha" />
            </a>
          ))}
        </div>
      </section>

      {/* Lo que incluye trabajar con Inspira */}
      <section className="bk-seccion" aria-labelledby="bk-incluye-t">
        <p className="bk-rotulo bk-rotulo-oscuro" data-revelar>
          <Icono nombre="paquete" size={15} />
          {T.incluye.rotulo}
        </p>
        <h2 id="bk-incluye-t" className="bk-h2" data-revelar>{T.incluye.titulo}</h2>
        <p className="bk-lead" data-revelar>{T.incluye.lead}</p>
        <ul className="bk-incluye">
          {T.incluye.puntos.map((p) => (
            <li key={p.titulo} className={p.sello ? "bk-incluye-on" : ""} data-revelar="escala">
              <span className="bk-enlace-icono"><Icono nombre={p.icono} size={20} /></span>
              <span>
                <strong>{p.titulo}</strong>
                {p.texto}
              </span>
              {p.sello && <b>{p.sello}</b>}
            </li>
          ))}
        </ul>
        <div className="bk-incluye-enlaces">
          {T.incluye.enlaces.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => { registrarEvento("becas2027_enlace", { a: l.href }); irA(l.href)(e); }} className="bk-becado-enlace">
              {l.texto}
              <Icono nombre="flecha" size={14} />
            </a>
          ))}
        </div>
      </section>

      {/* Quién lo cuenta: Carina, becaria */}
      <section className="bk-sobre" aria-labelledby="bk-sobre-t">
        <div className="bk-sobre-caja">
          <div className="bk-sobre-fotos" data-revelar="escala">
            <img src={fotoBeca} alt="Carina con otras becarias del DAAD en Alemania" width="960" height="712" loading="lazy" decoding="async" className="bk-sobre-foto2" />
            <img src={fotoCarina} alt="Carina Meza, fundadora de Inspira" width="720" height="1241" loading="lazy" decoding="async" className="bk-sobre-foto" />
          </div>
          <p className="bk-rotulo" data-revelar>
            <Icono nombre="trofeo" size={15} />
            {T.sobreMi.rotulo}
          </p>
          <h2 id="bk-sobre-t" className="bk-h2 bk-h2-claro" data-revelar>{T.sobreMi.titulo}</h2>
          <p className="bk-lead bk-lead-claro" data-revelar>{T.sobreMi.texto}</p>
          <ol className="bk-hitos">
            {T.sobreMi.hitos.map((h) => (
              <li key={h.anio} data-revelar>
                <b>{h.anio}</b>
                <span>
                  <strong>{h.titulo}</strong>
                  {h.texto}
                </span>
              </li>
            ))}
          </ol>
          <p className="bk-verdad-cierre" data-revelar>{T.sobreMi.cierre}</p>
          <a href="/carina" onClick={irA("/carina")} className="bk-sobre-enlace">
            {T.sobreMi.enlace}
            <Icono nombre="flecha" size={14} />
          </a>
        </div>
      </section>

      {/* La puerta */}
      <section className="bk-ayuda" data-revelar="escala">
        <h2 className="bk-h2">{T.ayuda.titulo}</h2>
        <p className="bk-lead">{T.ayuda.texto}</p>
        <div className="bk-acciones">
          <a href={wa} target="_blank" rel="noopener" className="bk-btn bk-btn-wa mov-brillo" onClick={() => registrarEvento("becas2027_whatsapp", { donde: "cierre" })}>
            <Icono nombre="whatsapp" size={20} />
            {T.ayuda.whatsapp}
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener" className="bk-btn bk-btn-noche" onClick={() => registrarEvento("becas2027_sesion", {})}>
            <Icono nombre="calendario" size={18} />
            {T.ayuda.sesion}
          </a>
        </div>
        <p className="bk-nota">{T.ayuda.nota}</p>
      </section>
    </main>
  );
}
