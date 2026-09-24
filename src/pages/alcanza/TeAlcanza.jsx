// src/pages/alcanza/TeAlcanza.jsx
//
// El juego de cartas (/te-alcanza): el gancho de TikTok.
//
// Seis ciudades españolas, una por carta: lo que la hace distinta, sus
// universidades, UN máster de ejemplo con lo que cuesta la matrícula, y
// cuántos más hay. Se desliza «me interesa / siguiente» y al final la persona
// se lleva sus ciudades, un enlace al mapa con cada una, y una puerta para
// hablar con el mensaje ya escrito.
//
// Es un gancho, no una calculadora (rediseño del 24/09/2026). Antes cada carta
// enseñaba el gasto de un año entero y se deslizaba «me alcanza / no me
// alcanza»; el total asustaba antes de tiempo y no dejaba con ganas de nada.
// La matrícula sí se enseña, porque es la cifra que sorprende.
//
// Por qué así y no un formulario: nadie escribe lo que busca en una web que
// acaba de conocer, pero todo el mundo dice «esta sí, esta no» mirando una
// ciudad. Cada carta enseña datos reales de GET /api/mapa y del censo, no un
// adorno: un juego que dice la verdad puede ser llamativo sin dejar de ser
// serio, que es la línea que no se cruza.
//
// Las cartas las construye ciudades.js (funciones puras, con prueba). Aquí
// solo hay gesto, estado y pantalla.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CercoErrores from "../../components/common/CercoErrores";
import Icono from "../../components/common/Icono";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { crearIndice, prefiereMenosMovimiento } from "../mapa/indice";
import IlustracionCiudad from "../mapa/IlustracionesMapa";
import { eur } from "../mapa/mapaTextos";
import { cartasCiudad, partida } from "./ciudades";
import { ALCANZA } from "./textos";
import "../../styles/movimiento.css";
import "../mapa/mapa.css";
import "./alcanza.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const MAX_CARTAS = 6;
// Cuánto hay que arrastrar para que la carta se vaya.
const UMBRAL = 90;

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

/* ── La carta ────────────────────────────────────────────────────────── */

function Carta({ item, arrastre, alSoltar, fondo = false }) {
  const grados = arrastre ? arrastre.dx / 18 : 0;
  const estilo = fondo
    ? { transform: "scale(0.94) translateY(16px)", opacity: 0.55 }
    : arrastre
      ? { transform: `translate(${arrastre.dx}px, ${arrastre.dy * 0.25}px) rotate(${grados}deg)`, transition: "none" }
      : undefined;
  const otros = Math.max(0, item.masteres - 1);

  return (
    <article className={`alc-carta ${fondo ? "alc-carta-fondo" : ""}`} style={estilo} {...(fondo ? {} : alSoltar)}>
      <div className="alc-carta-lienzo">
        <IlustracionCiudad ciudad={item.dibujo} />
        <span className="alc-carta-lugar">
          <Icono nombre="ubicacion" size={13} />
          {item.nombre}
          <em className="alc-carta-com">· {item.comunidad}</em>
        </span>
      </div>
      <div className="alc-carta-cuerpo">
        {item.rasgo && (
          <p className="alc-carta-rasgo">
            <Icono nombre="destello" size={13} />
            {item.rasgo}
          </p>
        )}

        <p className="alc-carta-unis">
          <strong>{ALCANZA.carta.masteres(item.masteres)}</strong>
          {" · "}
          {item.universidades.length} {ALCANZA.carta.universidades(item.universidades.length)}:{" "}
          {item.universidades.map((u) => u.sigla).join(", ")}
          {item.principal.ranking && (
            <span className="alc-carta-ranking">
              {item.principal.sigla} · {ALCANZA.carta.ranking(item.principal.ranking)}
            </span>
          )}
        </p>

        {item.ejemplo && (
          <div className="alc-carta-ejemplo">
            <p className="alc-carta-rotulo">{ALCANZA.carta.ejemplo}</p>
            <p className="alc-carta-master">
              <span className="alc-carta-campo">{item.ejemplo.campo}</span>
              {item.ejemplo.nombre}
              <em> · {item.ejemplo.universidad.sigla}</em>
            </p>
            {item.matricula && (
              <p className="alc-carta-cifra">
                {eur(item.matricula)} <span className="alc-carta-anio">{ALCANZA.carta.matricula}</span>
              </p>
            )}
            {otros > 0 && <p className="alc-carta-ymas">{ALCANZA.carta.yMas(otros)}</p>}
          </div>
        )}

        {item.vidaMes && <p className="alc-carta-vivir">{ALCANZA.carta.vivir(eur(item.vidaMes))}</p>}
        <p className="alc-carta-nota">{ALCANZA.carta.nota}</p>
      </div>
      {!fondo && arrastre && Math.abs(arrastre.dx) > 30 && (
        <span className={`alc-sello ${arrastre.dx > 0 ? "alc-sello-si" : "alc-sello-no"}`}>
          {arrastre.dx > 0 ? ALCANZA.si : ALCANZA.no}
        </span>
      )}
    </article>
  );
}

/* ── La partida ──────────────────────────────────────────────────────── */

function Juego({ cartas, onFin, onJugando }) {
  const [i, setI] = useState(0);
  const [elegidas, setElegidas] = useState([]);
  const [arrastre, setArrastre] = useState(null);
  const [saliendo, setSaliendo] = useState(null);
  const inicio = useRef(null);

  const carta = cartas[i] || null;
  const siguiente = cartas[i + 1] || null;

  // Una sola vez por partida: sin esto se sabe quién llega al final pero no
  // cuántos empezaron, que es la mitad que falta para medir el abandono.
  const arrancada = useRef(false);
  useEffect(() => {
    if (arrancada.current || !carta) return;
    arrancada.current = true;
    registrarEvento("alcanza_inicio", { cartas: cartas.length });
  }, [carta, cartas.length]);

  const responder = useCallback(
    (interesa) => {
      if (!carta) return;
      setSaliendo(interesa ? "si" : "no");
      // A partir del primer gesto la cabecera se encoge: el título y el lead
      // ya se han leído y estaban robándole 250 px a la carta en cada ronda.
      onJugando?.(true);
      registrarEvento("alcanza_respuesta", { ciudad: carta.id, interesa });
      const espera = prefiereMenosMovimiento() ? 0 : 260;
      setTimeout(() => {
        setSaliendo(null);
        setArrastre(null);
        const nuevas = interesa ? [...elegidas, carta] : elegidas;
        setElegidas(nuevas);
        if (i + 1 >= cartas.length) onFin({ elegidas: nuevas, vistas: cartas.length });
        else setI(i + 1);
      }, espera);
    },
    [carta, cartas.length, elegidas, i, onFin, onJugando]
  );

  function empezar(e) {
    if (saliendo) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    inicio.current = { x: e.clientX, y: e.clientY };
    setArrastre({ dx: 0, dy: 0 });
  }
  function mover(e) {
    if (!inicio.current) return;
    setArrastre({ dx: e.clientX - inicio.current.x, dy: e.clientY - inicio.current.y });
  }
  function soltar() {
    if (!inicio.current) return;
    const dx = arrastre?.dx || 0;
    inicio.current = null;
    if (Math.abs(dx) > UMBRAL) responder(dx > 0);
    else setArrastre(null);
  }

  if (!carta) return null;
  const gestos = { onPointerDown: empezar, onPointerMove: mover, onPointerUp: soltar, onPointerCancel: soltar };

  return (
    <div className="alc-juego">
      <p className="alc-progreso">
        {ALCANZA.progreso(i + 1, cartas.length)}
        <span className="alc-barra">
          <span style={{ width: `${((i + 1) / cartas.length) * 100}%` }} />
        </span>
      </p>

      <div className={`alc-mazo ${saliendo ? `alc-sale-${saliendo}` : ""}`}>
        {siguiente && <Carta key={`f-${siguiente.id}`} item={siguiente} fondo />}
        <Carta key={carta.id} item={carta} arrastre={arrastre} alSoltar={gestos} />
      </div>

      <div className="alc-botones">
        <button type="button" className="alc-boton alc-boton-no" onClick={() => responder(false)}>
          <Icono nombre="flecha" size={20} className="alc-flecha-izq" />
          {ALCANZA.no}
        </button>
        <button type="button" className="alc-boton alc-boton-si" onClick={() => responder(true)}>
          <Icono nombre="estrella" size={18} />
          {ALCANZA.si}
        </button>
      </div>
      <p className="alc-pista">{ALCANZA.pista}</p>
    </div>
  );
}

/* ── El resultado ────────────────────────────────────────────────────── */

function Resultado({ elegidas, totalCiudades, onOtraVez }) {
  const nada = elegidas.length === 0;
  const nombres = elegidas.map((c) => c.nombre);
  const wa = whatsappDesde("te-alcanza", ALCANZA.resultado.whatsappDetalle(nombres));

  useEffect(() => {
    registrarEvento("alcanza_resultado", { elegidas: elegidas.length, ciudades: elegidas.map((c) => c.id).join(",") });
  }, [elegidas]);

  return (
    <section className="alc-resultado" aria-live="polite">
      <p className="alc-res-rotulo">{ALCANZA.resultado.rotulo}</p>
      {nada ? (
        <>
          <h2 className="alc-res-titulo">{ALCANZA.resultado.ningunaTitulo}</h2>
          <p className="alc-res-texto">{ALCANZA.resultado.ningunaTexto(totalCiudades)}</p>
        </>
      ) : (
        <>
          <h2 className="alc-res-titulo">{ALCANZA.resultado.titulo(elegidas.length)}</h2>
          <p className="alc-res-texto">{ALCANZA.resultado.texto}</p>
          <ul className="alc-lista">
            {elegidas.map((c) => (
              <li key={c.id}>
                <a
                  href={`/mapa-estudiar-en-espana?ciudad=${c.id}`}
                  onClick={irA(`/mapa-estudiar-en-espana?ciudad=${c.id}`)}
                  className="alc-fila"
                >
                  <span className="alc-fila-ilu"><IlustracionCiudad ciudad={c.dibujo} quieta /></span>
                  <span className="alc-fila-txt">
                    <strong>{c.nombre}</strong>
                    <span>
                      {c.universidades.map((u) => u.sigla).join(", ")}
                      {c.ejemplo ? ` · ${c.ejemplo.campo}` : ""}
                    </span>
                  </span>
                  {c.matricula && <span className="alc-fila-cifra">{eur(c.matricula)}</span>}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="alc-cta">
        <a href={wa} target="_blank" rel="noopener" className="alc-cta-sol" onClick={() => registrarEvento("alcanza_whatsapp", { elegidas: elegidas.length })}>
          <Icono nombre="whatsapp" size={19} />
          {ALCANZA.resultado.whatsapp}
        </a>
        <a href="/mapa-estudiar-en-espana" onClick={irA("/mapa-estudiar-en-espana")} className="alc-cta-linea">
          <Icono nombre="mapa" size={18} />
          {ALCANZA.resultado.verMapa}
        </a>
        <a href={CALENDLY_URL} target="_blank" rel="noopener" className="alc-cta-linea">
          <Icono nombre="calendario" size={18} />
          {ALCANZA.resultado.sesion}
        </a>
      </div>
      <button type="button" className="alc-repetir" onClick={onOtraVez}>
        {ALCANZA.resultado.otraVez}
      </button>
      <p className="alc-descargo">{ALCANZA.descargo}</p>
    </section>
  );
}

/* ── Contenido: datos → partida → resultado ──────────────────────────── */

function Contenido({ datos, onJugando }) {
  const [fin, setFin] = useState(null);
  const [ronda, setRonda] = useState(0);

  const { cartas, total } = useMemo(() => {
    const todas = cartasCiudad(crearIndice(datos));
    return { cartas: partida(todas, MAX_CARTAS), total: todas.length };
  }, [datos]);

  if (cartas.length < 3) return null;

  return fin ? (
    <Resultado
      elegidas={fin.elegidas}
      totalCiudades={total}
      onOtraVez={() => {
        setFin(null);
        setRonda((n) => n + 1);
        onJugando?.(false);
      }}
    />
  ) : (
    <Juego
      key={ronda}
      cartas={cartas}
      onJugando={onJugando}
      onFin={(r) => {
        onJugando?.(false);
        setFin(r);
      }}
    />
  );
}

/* ── La página ───────────────────────────────────────────────────────── */

export default function TeAlcanza() {
  const [carga, setCarga] = useState({ estado: "cargando" });
  const [jugando, setJugando] = useState(false);
  useSEO(ALCANZA.seo);

  useEffect(() => {
    let vivo = true;
    fetch(`${API_URL}/api/mapa`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((datos) => vivo && setCarga({ estado: "ok", datos }))
      .catch((e) => {
        console.error("[te-alcanza] no se pudo cargar:", e);
        if (vivo) setCarga({ estado: "error" });
      });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <main className={`alc${jugando ? " alc-jugando" : ""}`}>
      <div className="alc-fondo" aria-hidden="true" />
      <div className="alc-dentro">
        <header className="alc-cabecera">
          <p className="alc-etiqueta">
            <Icono nombre="destello" size={14} />
            {ALCANZA.etiqueta}
          </p>
          <h1 className="alc-titulo">{ALCANZA.titulo}</h1>
          <p className="alc-lead">{ALCANZA.lead}</p>
        </header>

        {carga.estado === "cargando" && <p className="alc-cargando">{ALCANZA.cargando}</p>}
        {carga.estado === "error" && (
          <p className="alc-cargando">
            {ALCANZA.error}{" "}
            <a href="/mapa-estudiar-en-espana" onClick={irA("/mapa-estudiar-en-espana")} className="alc-enlace">
              {ALCANZA.errorEnlace}
            </a>
          </p>
        )}
        {carga.estado === "ok" && (
          <CercoErrores donde="te-alcanza">
            <Contenido datos={carga.datos} onJugando={setJugando} />
          </CercoErrores>
        )}
      </div>
    </main>
  );
}
