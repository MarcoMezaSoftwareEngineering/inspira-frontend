// src/pages/enlaces/MuestraMapa.jsx
//
// Muestra del «Mapa de costos de máster» arriba de /enlaces (17/09/2026): la
// clienta hará vídeos del mapa y quien llega desde ellos tiene que verlo
// funcionando nada más entrar, no un enlace más.
//
// Es el mapa de verdad (MapaInteractivo, mismos datos de /api/mapa y misma
// geografía), recorriéndose solo: España entera → una comunidad con su
// matrícula → su ciudad con más másteres → la siguiente. Las cifras salen de
// la API, no se escriben a mano. Tocar el mapa o el botón abre el mapa
// completo en esa comunidad. Este archivo va en su propio trozo (lazy desde
// Enlaces.jsx): el mapa no pesa en la página hasta que se pinta.
//
// Con «reducir movimiento» no avanza solo: se queda en la primera comunidad y
// se cambia con los puntos.
import { useEffect, useMemo, useState } from "react";
import MapaInteractivo from "../mapa/MapaInteractivo";
import { aplicarFiltros, casosEnMapa, crearIndice, prefiereMenosMovimiento } from "../mapa/indice";
import { importeMatricula } from "../mapa/mapaTextos";
import { CASOS } from "../../config/casos";
import { navigate } from "../../services/navigate";
import "../mapa/mapa.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const RUTA_MAPA = "/mapa-estudiar-en-espana";
const PASO_MS = 3400;
const CAPAS = { ciudades: true, casos: false };
const NADA = { tipo: null, comunidad: null, ciudad: null, universidad: null, caso: null };

const num = (n) => Number(n || 0).toLocaleString("es-ES");

/** Las paradas del recorrido: las 4 comunidades con más másteres y su ciudad principal. */
function recorrido(indice, datos) {
  const comunidades = [...(datos.comunidades || [])]
    .filter((c) => c.masteres > 0)
    .sort((a, b) => b.masteres - a.masteres)
    .slice(0, 4);
  const pasos = [{ foco: NADA, eyebrow: "Así funciona", titulo: "Toca una comunidad de España", texto: `${num(datos.totales?.masteres)} másteres oficiales con su matrícula aproximada` }];
  for (const c of comunidades) {
    pasos.push({
      foco: { ...NADA, tipo: "comunidad", comunidad: c.id },
      eyebrow: "1 · Eliges comunidad",
      titulo: c.nombre,
      texto: c.matricula?.cadaUniversidad
        ? `La matrícula la fija cada universidad · ${num(c.masteres)} másteres`
        : `Matrícula ${importeMatricula(c.matricula)} al año · ${num(c.masteres)} másteres`,
      comunidad: c.id,
    });
    // Las cifras de la ciudad, de la API tal cual.
    const ciudad = [...(datos.ciudades || [])]
      .filter((x) => x.comunidad === c.id && indice.ciudades.has(x.id))
      .sort((a, b) => (b.masteres || 0) - (a.masteres || 0))[0];
    if (ciudad) {
      // `universidades` llega como lista de ids o como número, según la ciudad.
      const nUnis = Array.isArray(ciudad.universidades) ? ciudad.universidades.length : Number(ciudad.universidades) || 0;
      pasos.push({
        foco: { ...NADA, tipo: "ciudad", comunidad: c.id, ciudad: ciudad.id },
        eyebrow: "2 · Ves cada ciudad",
        titulo: ciudad.nombre,
        texto: `${num(ciudad.masteres)} másteres en ${num(nUnis)} ${nUnis === 1 ? "universidad" : "universidades"}`,
        comunidad: c.id,
      });
    }
  }
  return pasos;
}

export default function MuestraMapa({ onAbrir }) {
  const [fuente, setFuente] = useState({ geo: null, datos: null, error: false });
  const [i, setI] = useState(0);
  const quieto = useMemo(() => prefiereMenosMovimiento(), []);

  useEffect(() => {
    let vivo = true;
    const control = new AbortController();
    Promise.all([
      import("../landing/master2027/mapaEspana.data").then((m) => m.default || m),
      fetch(`${API_URL}/api/mapa`, { signal: control.signal, headers: { Accept: "application/json" } }).then((r) => r.json()),
    ])
      .then(([geo, datos]) => {
        if (!vivo) return;
        if (!datos?.ok || !Array.isArray(datos.comunidades)) throw new Error("sin datos");
        setFuente({ geo: geo.MAPA_ESPANA || geo.default || geo, datos, error: false });
      })
      .catch(() => { if (vivo) setFuente((f) => ({ ...f, error: true })); });
    return () => { vivo = false; control.abort(); };
  }, []);

  const indice = useMemo(() => (fuente.datos ? crearIndice(fuente.datos) : null), [fuente.datos]);
  const filtros = useMemo(() => (indice ? aplicarFiltros(indice, {}) : null), [indice]);
  const casos = useMemo(() => (indice ? casosEnMapa(indice, CASOS) : []), [indice]);
  const pasos = useMemo(() => (indice ? recorrido(indice, fuente.datos) : []), [indice, fuente.datos]);

  useEffect(() => {
    if (quieto || pasos.length < 2) return undefined;
    const t = setTimeout(() => setI((x) => (x + 1) % pasos.length), PASO_MS);
    return () => clearTimeout(t);
  }, [i, pasos.length, quieto]);

  // Si falla la API, no se enseña un mapa roto: la página sigue igual.
  if (fuente.error) return null;

  const paso = pasos[quieto && pasos.length > 1 ? Math.max(1, i) : i] || null;
  const abrir = (comunidad) => {
    const href = `${RUTA_MAPA}?${comunidad ? `comunidad=${encodeURIComponent(comunidad)}&` : ""}utm_source=enlaces&utm_medium=bio`;
    onAbrir?.(comunidad);
    navigate(href);
  };

  return (
    <section aria-label="Muestra del mapa de costos de máster" className="enl-mapa">
      <div className="enl-mapa-cab">
        <span className="enl-mapa-vivo" aria-hidden="true" />
        <span>Mapa de costos de máster · en vivo</span>
      </div>

      <div className="enl-mapa-lienzo mapa-mar">
        {!indice || !fuente.geo ? (
          <div className="enl-mapa-cargando" aria-busy="true">Cargando el mapa…</div>
        ) : (
          <MapaInteractivo
            geo={fuente.geo}
            indice={indice}
            foco={paso?.foco || NADA}
            filtros={filtros}
            capas={CAPAS}
            casos={casos}
            onElegir={(tipo, id) => abrir(tipo === "comunidad" ? id : paso?.comunidad || null)}
            onToda={() => abrir(null)}
          />
        )}

        {paso && (
          <div key={i} className="enl-mapa-rotulo" aria-live="polite">
            <small>{paso.eyebrow}</small>
            <b>{paso.titulo}</b>
            <span>{paso.texto}</span>
          </div>
        )}
      </div>

      {pasos.length > 1 && (
        <div className="enl-mapa-puntos" role="tablist" aria-label="Paradas del recorrido">
          {pasos.map((p, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={p.titulo}
              className={k === i ? "on" : ""} onClick={() => setI(k)} />
          ))}
        </div>
      )}

      <button type="button" className="enl-mapa-cta" onClick={() => abrir(paso?.comunidad || null)}>
        Pruébalo tú: abre el mapa completo
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" /></svg>
      </button>
    </section>
  );
}
