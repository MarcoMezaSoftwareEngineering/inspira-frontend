// Un texto plano con sus direcciones convertidas en enlaces. Las descripciones
// del checklist llevan el enlace del trámite (Europass, la sede del
// Ministerio) y nadie debería copiarlo a mano.
const RX_URL = /(https?:\/\/[^\s)]+)/g;

// Nombre legible para las direcciones que conocemos; el resto enseña su dominio.
const ETIQUETAS = [
  [/europa\.eu\/europass/i, "Editor de CV Europass"],
  [/universidades\.sede\.gob\.es/i, "Equivalencia de notas medias · sede del Ministerio"],
];

function etiquetaDe(url) {
  const par = ETIQUETAS.find(([rx]) => rx.test(url));
  if (par) return par[1];
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export default function TextoConEnlaces({ texto, className = "" }) {
  const partes = String(texto || "").split(RX_URL);
  if (partes.length === 1) return <p className={className}>{texto}</p>;
  return (
    <p className={className}>
      {partes.map((p, i) =>
        RX_URL.test(p) && /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-semibold text-primary-light underline underline-offset-2 break-all">
            {etiquetaDe(p)} ↗
          </a>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
}
