// src/pages/alcanza/TeAlcanza.jsx
//
// «¿Te alcanza?»: el gancho de TikTok. Salen comunidades españolas con lo que
// cuesta de verdad su primer año y la persona desliza —me alcanza / no me
// alcanza— hasta que sabemos por dónde anda su presupuesto. Al final se lleva
// una lista de sitios a los que sí puede ir.
//
// Por qué así y no un test de los de siempre:
//  - No se pide un número. Nadie escribe cuánto dinero tiene en un formulario
//    de una web que acaba de conocer, pero todo el mundo dice «esto sí, esto
//    no» mirando una cifra.
//  - Las cartas se eligen partiendo en dos el rango que queda (búsqueda
//    binaria): con cinco o seis gestos ya sabemos su techo.
//  - Cada carta enseña un dato real de GET /api/mapa, no un adorno. Un juego
//    que dice la verdad puede ser llamativo sin dejar de ser serio, que es la
//    línea que no podemos cruzar: vendemos trámites, no entretenimiento.
//
// Quien no llega ni a la comunidad más barata no se queda sin salida: se le
// dice cuánto falta y se le ofrece la vía de las becas.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CercoErrores from "../../components/common/CercoErrores";
import Icono from "../../components/common/Icono";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { crearIndice, prefiereMenosMovimiento } from "../mapa/indice";
import { rutaComunidad } from "../mapa/rutasLugar";
import IlustracionCiudad from "../mapa/IlustracionesMapa";
import { eur, plural } from "../mapa/mapaTextos";
import { ALCANZA } from "./textos";
import "../../styles/movimiento.css";
import "../mapa/mapa.css";
import "./alcanza.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const MAX_CARTAS = 6;
// Cuánto hay que arrastrar para que la carta se vaya.
const UMBRAL = 90;

async function pedirMapa() {
  const r = await fetch(`${API_URL}/api/mapa`, { headers: { Accept: "application/json" } });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.ok || !Array.isArray(j.comunidades)) throw new Error(j?.msg || `HTTP ${r.status}`);
  return j;
}

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

/* ── El juego ────────────────────────────────────────────────────────── */

/**
 * La siguiente carta es la que parte en dos el rango que aún no conocemos:
 * así cada gesto sirve para algo y en cinco o seis se acaba.
 */
function siguienteCarta(lista, vistas, min, max) {
  const libres = lista.filter((c) => !vistas.includes(c.id) && c.total > min && c.total < max);
  if (!libres.length) return null;
  return libres[Math.floor(libres.length / 2)];
}

function Carta({ item, arrastre, alSoltar, fondo = false }) {
  const grados = arrastre ? arrastre.dx / 18 : 0;
  const estilo = fondo
    ? { transform: "scale(0.94) translateY(16px)", opacity: 0.55 }
    : arrastre
      ? { transform: `translate(${arrastre.dx}px, ${arrastre.dy * 0.25}px) rotate(${grados}deg)`, transition: "none" }
      : undefined;

  return (
    <article className={`alc-carta ${fondo ? "alc-carta-fondo" : ""}`} style={estilo} {...(fondo ? {} : alSoltar)}>
      <div className="alc-carta-lienzo">
        <IlustracionCiudad ciudad={item.ciudad} />
        <span className="alc-carta-lugar">
          <Icono nombre="ubicacion" size={13} />
          {item.nombre}
        </span>
      </div>
      <div className="alc-carta-cuerpo">
        <p className="alc-carta-rotulo">{ALCANZA.carta.rotulo}</p>
        <p className="alc-carta-cifra">{eur(item.total)}</p>
        <ul className="alc-carta-desglose">
          <li>
            <span>{ALCANZA.carta.matricula}</span>
            <strong>{eur(item.matricula)}</strong>
          </li>
          <li>
            <span>{ALCANZA.carta.vida}</span>
            <strong>{eur(item.vida)}</strong>
          </li>
        </ul>
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

function Juego({ lista, onFin }) {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(Infinity);
  const [vistas, setVistas] = useState([]);
  const [arrastre, setArrastre] = useState(null);
  const [saliendo, setSaliendo] = useState(null);
  const inicio = useRef(null);

  const carta = useMemo(() => siguienteCarta(lista, vistas, min, max), [lista, vistas, min, max]);
  const siguiente = useMemo(
    () => siguienteCarta(lista, carta ? [...vistas, carta.id] : vistas, min, max),
    [lista, vistas, carta, min, max]
  );

  const responder = useCallback(
    (alcanza) => {
      if (!carta) return;
      setSaliendo(alcanza ? "si" : "no");
      registrarEvento("alcanza_respuesta", { comunidad: carta.id, alcanza });
      const espera = prefiereMenosMovimiento() ? 0 : 260;
      setTimeout(() => {
        setSaliendo(null);
        setArrastre(null);
        const nuevasVistas = [...vistas, carta.id];
        const nMin = alcanza ? Math.max(min, carta.total) : min;
        const nMax = alcanza ? max : Math.min(max, carta.total);
        setMin(nMin);
        setMax(nMax);
        setVistas(nuevasVistas);
        if (nuevasVistas.length >= MAX_CARTAS || !siguienteCarta(lista, nuevasVistas, nMin, nMax)) {
          onFin({ min: nMin, max: nMax, respondidas: nuevasVistas.length });
        }
      }, espera);
    },
    [carta, lista, max, min, onFin, vistas]
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
  const gestos = {
    onPointerDown: empezar,
    onPointerMove: mover,
    onPointerUp: soltar,
    onPointerCancel: soltar,
  };

  return (
    <div className="alc-juego">
      <p className="alc-progreso">
        {ALCANZA.progreso(vistas.length + 1, MAX_CARTAS)}
        <span className="alc-barra">
          <span style={{ width: `${((vistas.length + 1) / MAX_CARTAS) * 100}%` }} />
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
          {ALCANZA.si}
          <Icono nombre="flecha" size={20} />
        </button>
      </div>
      <p className="alc-pista">{ALCANZA.pista}</p>
    </div>
  );
}

/* ── El resultado ────────────────────────────────────────────────────── */

function Resultado({ lista, rango, onOtraVez }) {
  const alcanzan = lista.filter((c) => c.total <= rango.min);
  const cerca = lista.filter((c) => c.total > rango.min && c.total < rango.max);
  const masBarata = lista[0];
  const nada = alcanzan.length === 0;

  useEffect(() => {
    registrarEvento("alcanza_resultado", { alcanzan: alcanzan.length, techo: rango.min });
  }, [alcanzan.length, rango.min]);

  return (
    <section className="alc-resultado" aria-live="polite">
      <p className="alc-res-rotulo">{ALCANZA.resultado.rotulo}</p>
      {nada ? (
        <>
          <h2 className="alc-res-titulo">{ALCANZA.resultado.ningunaTitulo}</h2>
          <p className="alc-res-texto">{ALCANZA.resultado.ningunaTexto(eur(masBarata.total), masBarata.nombre)}</p>
        </>
      ) : (
        <>
          <h2 className="alc-res-titulo">
            {ALCANZA.resultado.titulo(alcanzan.length, lista.length)}
          </h2>
          <p className="alc-res-texto">{ALCANZA.resultado.texto}</p>
        </>
      )}

      {alcanzan.length > 0 && (
        <ul className="alc-lista">
          {alcanzan.slice(0, 8).map((c) => (
            <li key={c.id}>
              <a href={rutaComunidad(c.id)} onClick={irA(rutaComunidad(c.id))} className="alc-fila">
                <span className="alc-fila-ilu">
                  <IlustracionCiudad ciudad={c.ciudad} quieta />
                </span>
                <span className="alc-fila-txt">
                  <strong>{c.nombre}</strong>
                  <span>{plural(c.universidades, "universidad", "universidades")}</span>
                </span>
                <span className="alc-fila-cifra">{eur(c.total)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {cerca.length > 0 && (
        <p className="alc-cerca">
          <Icono nombre="destello" size={15} />
          {ALCANZA.resultado.cerca(cerca.length, cerca.map((c) => c.nombre).slice(0, 3).join(", "))}
        </p>
      )}

      <div className="alc-acciones">
        <a
          href={whatsappDesde("alcanza", ALCANZA.resultado.whatsapp(alcanzan.length))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarEvento("alcanza_whatsapp", {})}
          className="alc-cta alc-cta-sol"
        >
          <Icono nombre="whatsapp" size={19} />
          {ALCANZA.resultado.botonWhatsapp}
        </a>
        <a href="/mapa-estudiar-en-espana" onClick={irA("/mapa-estudiar-en-espana")} className="alc-cta alc-cta-linea">
          <Icono nombre="mapa" size={18} />
          {ALCANZA.resultado.botonMapa}
        </a>
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="alc-cta alc-cta-linea">
          <Icono nombre="calendario" size={18} />
          {ALCANZA.resultado.botonSesion}
        </a>
        <button type="button" onClick={onOtraVez} className="alc-repetir">
          <Icono nombre="rayo" size={15} />
          {ALCANZA.resultado.otraVez}
        </button>
      </div>
      <p className="alc-descargo">{ALCANZA.descargo}</p>
    </section>
  );
}

/* ── La página ───────────────────────────────────────────────────────── */

function Contenido({ datos }) {
  const [rango, setRango] = useState(null);
  const [ronda, setRonda] = useState(0);

  const lista = useMemo(() => {
    const indice = crearIndice(datos);
    return [...indice.presupuestos.entries()]
      .map(([id, p]) => {
        const c = indice.comunidades.get(id);
        if (!c) return null;
        const ciudad = c.ciudades?.[0] || "CAMPUS";
        return { id, nombre: c.nombre, ciudad, universidades: c.universidades, ...p };
      })
      .filter(Boolean)
      .sort((a, b) => a.total - b.total);
  }, [datos]);

  if (lista.length < 3) return null;

  return rango ? (
    <Resultado
      lista={lista}
      rango={rango}
      onOtraVez={() => {
        setRango(null);
        setRonda((n) => n + 1);
      }}
    />
  ) : (
    <Juego key={ronda} lista={lista} onFin={setRango} />
  );
}

export default function TeAlcanza() {
  const [carga, setCarga] = useState({ estado: "cargando" });
  useSEO(ALCANZA.seo);

  useEffect(() => {
    let vivo = true;
    pedirMapa()
      .then((datos) => vivo && setCarga({ estado: "listo", datos }))
      .catch((e) => {
        console.error("[te-alcanza] no se pudo cargar:", e);
        if (vivo) setCarga({ estado: "error" });
      });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <main className="alc">
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
        {carga.estado === "listo" && (
          <CercoErrores donde="te-alcanza" titulo="No se pudo mostrar el juego">
            <Contenido datos={carga.datos} />
          </CercoErrores>
        )}
      </div>
    </main>
  );
}
