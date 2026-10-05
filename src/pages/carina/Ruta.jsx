// src/pages/carina/Ruta.jsx
//
// La ruta de Carina: cinco paradas sobre una línea y un avión que vuela a la
// que se toca. Debajo, la ficha de esa parada: qué hizo allí y por qué eso le
// sirve a quien está leyendo. Sustituye a la lista de formación y becas, que
// decía lo mismo pero no invitaba a tocar nada.
import { useState } from "react";
import Icono from "../../components/common/Icono";
import { registrarEvento } from "../../lib/analytics";
import { CARINA } from "./textos";
import { FOTOS } from "./fotos";

const R = CARINA.trayectoria.ruta;

export default function Ruta() {
  const [i, setI] = useState(0);
  const p = R.paradas[i];
  const f = p.foto ? FOTOS[p.foto] : null;
  const ultimo = R.paradas.length - 1;

  const elegir = (n) => {
    const m = Math.min(ultimo, Math.max(0, n));
    if (m === i) return;
    setI(m);
    registrarEvento("carina_ruta", { parada: R.paradas[m].id });
  };

  const alTeclear = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const m = Math.min(ultimo, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1)));
    elegir(m);
    e.currentTarget.querySelectorAll("[role=tab]")[m]?.focus();
  };

  return (
    <div className="car-ruta" data-revelar>
      <h3 className="car-tray-h3">
        <Icono nombre="globo" size={16} />
        {R.titulo}
        <span className="car-ruta-ayuda">{R.ayuda}</span>
      </h3>

      <div className="car-ruta-linea" role="tablist" aria-label={R.titulo} onKeyDown={alTeclear} style={{ "--car-ruta-i": i, "--car-ruta-n": ultimo }}>
        <span className="car-ruta-via" aria-hidden="true"><span /></span>
        <span className="car-ruta-avion" aria-hidden="true"><Icono nombre="avion" size={16} /></span>
        {R.paradas.map((q, n) => (
          <button
            key={q.id}
            type="button"
            role="tab"
            id={`car-ruta-tab-${q.id}`}
            aria-selected={n === i}
            aria-controls="car-ruta-ficha"
            tabIndex={n === i ? 0 : -1}
            className={`car-ruta-parada${n === i ? " car-ruta-activa" : ""}${n < i ? " car-ruta-pasada" : ""}`}
            onClick={() => elegir(n)}
          >
            <span className="car-ruta-punto" aria-hidden="true" />
            <span className="car-ruta-lugar">{q.lugar}</span>
          </button>
        ))}
      </div>

      <div id="car-ruta-ficha" role="tabpanel" aria-labelledby={`car-ruta-tab-${p.id}`} className="car-ruta-ficha" key={p.id}>
        {f && (
          <img src={f.src} alt={f.alt} width={f.ancho} height={f.alto} loading="lazy" decoding="async" className={`car-ruta-foto car-ruta-foto-${p.foto}`} />
        )}
        <div className="car-ruta-cuerpo">
          <span className="car-tray-periodo">{p.periodo} · {p.pais}</span>
          <strong className="car-tray-puesto">{p.titulo}</strong>
          <p className="car-tray-texto">{p.texto}</p>
          <p className="car-ruta-sirve">
            <Icono nombre="destello" size={14} />
            {p.sirve}
          </p>
        </div>
        <div className="car-ruta-pasos">
          <button type="button" onClick={() => elegir(i - 1)} disabled={i === 0} aria-label="Parada anterior">
            <Icono nombre="flecha" size={16} className="car-ruta-atras" />
          </button>
          <span>{i + 1} / {R.paradas.length}</span>
          <button type="button" onClick={() => elegir(i + 1)} disabled={i === ultimo} aria-label="Parada siguiente">
            <Icono nombre="flecha" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
