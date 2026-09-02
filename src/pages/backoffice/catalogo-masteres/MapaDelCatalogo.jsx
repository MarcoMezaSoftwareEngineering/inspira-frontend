// Cómo encajan las cuatro pantallas del catálogo.
//
// La confusión era razonable y era culpa del diseño: había un sitio llamado
// «Universidades», otro llamado «Catálogo de másteres» y un «Sistematizador»,
// y ninguno decía qué relación tenía con los otros. Parecían tres catálogos
// compitiendo cuando en realidad son un catálogo, dos capas de contexto y una
// puerta de entrada.
//
// Esta tira se pinta arriba de las cuatro, con el paso actual marcado. Explicar
// el flujo en una nota suelta no sirve: nadie la lee dos meses después. Tiene
// que estar donde se trabaja.
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navigate } from "../../../services/navigate";

const PASOS = [
  {
    id: "universidades",
    href: "/backoffice/universidades",
    orden: "Dónde",
    titulo: "Universidades",
    texto: "Las 47 fichas: ciudad, comunidad, precio del crédito, ranking, enlaces.",
    papel: "contexto",
  },
  {
    id: "tracker",
    href: "/backoffice/tracker-universidades",
    orden: "Cuándo",
    titulo: "Plazos",
    texto: "Las fases de preinscripción de cada universidad, curso a curso.",
    papel: "contexto",
  },
  {
    id: "sistematizador",
    href: "/backoffice/sistematizador",
    orden: "Cómo entra",
    titulo: "Sistematizador",
    texto: "La puerta de carga: pegas la oferta de una universidad y entra al catálogo.",
    papel: "puerta",
  },
  {
    id: "masteres",
    href: "/backoffice/masteres",
    orden: "Qué se recomienda",
    titulo: "Buscador de másteres",
    texto: "El catálogo final. Cada máster con su universidad, su precio y su plazo ya resueltos.",
    papel: "salida",
  },
];

export default function MapaDelCatalogo({ activo }) {
  // Quien ya sabe cómo va el catálogo no necesita ver la tira cada vez. Se
  // recuerda plegada por navegador; si no hay dónde guardarlo, va abierta.
  const [plegado, setPlegado] = useState(() => {
    try { return localStorage.getItem("ase.mapa.plegado") === "1"; } catch { return false; }
  });
  const alternar = () => {
    const v = !plegado;
    setPlegado(v);
    try { localStorage.setItem("ase.mapa.plegado", v ? "1" : "0"); } catch { /* sin memoria, sin más */ }
  };

  return (
    <div className="ase-tarjeta" style={{ padding: "10px 14px 12px", background: "rgba(255,255,255,.7)" }}>
      <button type="button" onClick={alternar}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "transparent", border: 0, padding: "2px 0", cursor: "pointer", font: "inherit", textAlign: "left" }}>
        <span className="ase-rotulo" style={{ margin: 0, flex: 1 }}>Un solo catálogo, cuatro pantallas</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{plegado ? "ver el mapa" : "ocultar"}</span>
        <ChevronDown size={15} color="#62808f" style={{ transition: "transform .3s var(--ease)", transform: plegado ? "rotate(-90deg)" : "none" }} />
      </button>

      {!plegado && (
        <div className="ase-entra" style={{ marginTop: 10 }}>
          <div className="ase-pasos ase-anim">
            {PASOS.map((p, i) => {
              const on = p.id === activo;
              return (
                <button key={p.id} type="button" className="ase-paso" data-on={on ? "1" : "0"} data-papel={p.papel}
                  onClick={() => !on && navigate(p.href)} aria-current={on ? "page" : undefined}>
                  <span className="ase-paso-orden">{p.orden}</span>
                  <span className="ase-paso-t">
                    <span className="ase-paso-num">{i + 1}</span>
                    {p.titulo}
                    {on && <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>· estás aquí</span>}
                  </span>
                  <span className="ase-paso-x">{p.texto}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.55 }}>
            Los másteres cuelgan de su universidad y heredan de ella la ciudad, el precio del
            crédito y las fechas. Por eso no hay dos catálogos: sólo uno, mirado desde la
            universidad o desde el máster según lo que se necesite en ese momento.
          </p>
        </div>
      )}
    </div>
  );
}
