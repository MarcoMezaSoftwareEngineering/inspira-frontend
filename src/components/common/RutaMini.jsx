// Una ruta corta dentro de un paso (19/10/2026): la homologación escolar del
// grado y la FP, con sus siete estados en línea y su propio color. La ficha
// del servicio (paso.ruta) trae los estados, los iconos y los textos; el
// estado actual es el valor del campo que mueve el asesor.
import IconoPaso from "./IconoPaso";

const hex = (c, a) => `${c}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

/**
 * @param ruta   { campo, titulo, color, estados: [{ valor, icono, titulo, texto }] }
 * @param valor  el estado actual (un `valor` de la ruta)
 * @param compacta  sin el texto de «ahora» (Core)
 */
export default function RutaMini({ ruta, valor, compacta = false }) {
  if (!ruta?.estados?.length) return null;
  const idx = Math.max(0, ruta.estados.findIndex((e) => e.valor === valor));
  const color = ruta.color || "#8A5A0B";
  const hecho = ruta.estados.length > 1 ? idx / (ruta.estados.length - 1) : 1;
  const actual = ruta.estados[idx];
  return (
    <section
      className="rm-caja"
      aria-label={ruta.titulo}
      style={{ "--rm-color": color, "--rm-borde": hex(color, 0.35), "--rm-suave": hex(color, 0.1), "--rm-halo": hex(color, 0.14) }}
    >
      <div className="rm-cab">
        <h3>{ruta.titulo}</h3>
        <small>Tramo {idx + 1} de {ruta.estados.length}</small>
      </div>
      <ol className="rm-ruta" style={{ "--n": ruta.estados.length, "--hecho": hecho.toFixed(3) }}>
        {ruta.estados.map((e, i) => (
          <li key={e.valor} data-e={i < idx ? "ok" : i === idx ? "on" : ""} title={e.titulo}>
            <span className="rm-ico"><IconoPaso nombre={e.icono || "info"} /></span>
            <span className="rm-txt">{e.titulo}</span>
          </li>
        ))}
      </ol>
      {!compacta && actual && (
        <p className="rm-ahora" key={actual.valor}>
          <b>{actual.titulo}.</b> {actual.texto}
        </p>
      )}
    </section>
  );
}
