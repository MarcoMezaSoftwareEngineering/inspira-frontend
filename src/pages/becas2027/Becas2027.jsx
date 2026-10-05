// src/pages/becas2027/Becas2027.jsx
//
// /becas-espana-2027 — la página que se envía por mensaje a quien comenta
// «BECA ESPAÑA 2027» en TikTok.
//
// Quien llega quiere la lista de becas, y se la damos entera: calendario por
// meses, filtro por perfil y la web oficial de cada una. Pero la página tiene
// un segundo acto, que es el que importa al negocio: una beca depende del
// perfil, y para quien no encaja hay másteres oficiales económicos. El orden
// es ese a propósito: primero cumplir lo prometido, luego la verdad, luego la
// salida.
import { useMemo, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { cascada, useRevelar } from "../../lib/revelar";
import { BECAS, BECAS2027 as T, ECONOMICOS, FILTROS, MESES, PLAN_B } from "./textos";
import "../../styles/movimiento.css";
import "./becas2027.css";

const eur = (n) => `${n.toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

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
  const raiz = useRef(null);
  useRevelar(raiz);
  const wa = whatsappDesde("becas-2027");
  const pasoPunto = cascada();
  const pasoPrecio = cascada();

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
  const maximo = Math.max(...ECONOMICOS.map((x) => x.precio));

  return (
    <main className="bk" ref={raiz}>
      {/* Lo prometido en el mensaje */}
      <header className="bk-hero">
        <span className="bk-hero-sol" aria-hidden="true" />
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
      </header>

      {/* El calendario */}
      <section id="bk-calendario" className="bk-seccion" aria-labelledby="bk-cal-t">
        <h2 id="bk-cal-t" className="bk-h2" data-revelar>{T.calendario.titulo}</h2>
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

        <p className="bk-aviso">
          <Icono nombre="campana" size={15} />
          {T.calendario.aviso}
        </p>
      </section>

      {/* La verdad: depende del perfil */}
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
                <span className="bk-punto-icono"><Icono nombre={p.icono} size={22} /></span>
                <span>
                  <strong>{p.titulo}</strong>
                  {p.texto}
                </span>
              </li>
            ))}
          </ul>
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
          <p className="bk-caso-cifra">{eur(PLAN_B.caso.matricula)}</p>
          <p className="bk-caso-texto">
            <strong>{PLAN_B.caso.nombre}</strong> {T.planB.casoTexto} <strong>{PLAN_B.caso.universidad}</strong>.
          </p>
          <p className="bk-caso-pie">
            <Icono nombre="ubicacion" size={14} />
            {PLAN_B.caso.ciudad} · {T.planB.casoPie}
          </p>
        </div>

        <h3 className="bk-h3" data-revelar>{T.planB.tablaTitulo}</h3>
        <p className="bk-lead bk-lead-chico" data-revelar>{T.planB.tablaLead}</p>
        <ul className="bk-precios">
          {ECONOMICOS.map((x) => (
            <li key={x.lugar} data-revelar style={pasoPrecio()}>
              <div className="bk-precio-cab">
                <strong>{x.lugar}</strong>
                <b>{eur(x.precio)}</b>
              </div>
              <span className="bk-precio-barra" aria-hidden="true">
                <span style={{ width: `${Math.round((x.precio / maximo) * 100)}%` }} />
              </span>
              <span className="bk-precio-pie">{x.unis} · {x.cuantos} {T.planB.masteres}</span>
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

      {/* La puerta */}
      <section className="bk-ayuda" data-revelar="escala">
        <img src={T.retrato} alt="Carina Meza, CEO y consultora legal de Inspira Legal" width="640" height="619" loading="lazy" className="bk-ayuda-foto" />
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
