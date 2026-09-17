// src/pages/bicentenario/ilustraciones.jsx
// Ilustraciones SVG propias, en línea y con la paleta de la marca:
// petróleo #013446, celeste #88C4FC, naranja #FA943A, amarillo #F9C846.
// Sin fotos de stock ni recursos de otros dominios.
// (usePrefiereQuieto vive en utiles.js: aquí solo hay componentes.)
import { usePrefiereQuieto } from "./utiles";

const PETROLEO = "#013446";
const PETROLEO_2 = "#02506B";
const CELESTE = "#88C4FC";
const CELESTE_CLARO = "#E3F0FE";
const NARANJA = "#FA943A";
const AMARILLO = "#F9C846";
const FUENTE = "Montserrat, system-ui, sans-serif";

const destello = (x, y, s) => `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`;

function Destellos({ puntos, color = AMARILLO, quieto }) {
  return puntos.map(([x, y, s, d], i) => (
    <path key={i} d={destello(x, y, s)} fill={color} className={quieto ? "" : "bic-brillo"} style={{ animationDelay: `${d || 0}s` }} />
  ));
}

// ── Hero: globo, ruta Lima → Europa con avión y birrete ─────────────────────
export function IlustracionHero({ className = "" }) {
  const quieto = usePrefiereQuieto();
  const ruta = "M122 238 C 92 118, 246 62, 318 128";
  return (
    <svg viewBox="0 0 420 340" className={className} role="img" aria-label="Ilustración: birrete y avión que vuela de Lima a Europa sobre un globo terráqueo">
      <defs>
        <radialGradient id="bic-globo" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#0B6E8F" />
          <stop offset="100%" stopColor="#012A38" />
        </radialGradient>
        <clipPath id="bic-globo-recorte"><circle cx="232" cy="190" r="132" /></clipPath>
      </defs>
      <circle cx="232" cy="190" r="152" fill={CELESTE} opacity=".08" />
      <circle cx="232" cy="190" r="132" fill="url(#bic-globo)" stroke={CELESTE} strokeOpacity=".5" strokeWidth="2" />
      <g clipPath="url(#bic-globo-recorte)" stroke={CELESTE} strokeOpacity=".22" fill="none" strokeWidth="1.2">
        <ellipse cx="232" cy="190" rx="132" ry="46" />
        <ellipse cx="232" cy="190" rx="132" ry="94" />
        <ellipse cx="232" cy="190" rx="46" ry="132" />
        <ellipse cx="232" cy="190" rx="94" ry="132" />
        <line x1="100" y1="190" x2="364" y2="190" />
        <line x1="232" y1="58" x2="232" y2="322" />
      </g>
      <g clipPath="url(#bic-globo-recorte)" fill={CELESTE}>
        {/* Sudamérica */}
        <path fillOpacity=".55" d="M112 198c10-8 26-6 34 2s20 10 22 22-8 20-10 32c-2 14-10 26-20 34-6 5-12 2-12-6 0-12-6-22-12-32s-12-20-10-32c1-8 4-16 8-20z" />
        {/* Europa */}
        <path fillOpacity=".6" d="M290 110c8-10 24-12 34-6 8 4 18 2 22 10s-4 14-10 18-6 12-14 14c-10 2-16-6-24-4s-14-4-14-12 2-14 6-20z" />
        {/* África */}
        <path fillOpacity=".28" d="M302 164c14-4 30 2 36 14s2 26-4 38-8 26-18 32c-8 4-14-4-16-12-3-12-10-22-10-34 0-16 2-34 12-38z" />
      </g>

      {/* Ruta */}
      <path d={ruta} fill="none" stroke={AMARILLO} strokeWidth="3" strokeLinecap="round" strokeDasharray="7 7" className={quieto ? "" : "bic-ruta"} />

      {/* Estrellas de la UE alrededor de Europa */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={318 + Math.cos(a) * 17} cy={128 + Math.sin(a) * 17} r="1.8" fill={AMARILLO} />;
      })}

      {/* Pines */}
      <circle cx="122" cy="238" r="8" fill={NARANJA} stroke="#fff" strokeWidth="3" />
      <g transform="translate(58 252)">
        <rect width="62" height="26" rx="13" fill="#fff" />
        <text x="31" y="18" textAnchor="middle" fontSize="13" fontWeight="800" fill={PETROLEO} fontFamily={FUENTE}>Lima</text>
      </g>
      <circle cx="318" cy="128" r="8" fill={AMARILLO} stroke="#fff" strokeWidth="3" />
      <g transform="translate(330 78)">
        <rect width="80" height="26" rx="13" fill="#fff" />
        <text x="40" y="18" textAnchor="middle" fontSize="13" fontWeight="800" fill={PETROLEO} fontFamily={FUENTE}>Europa</text>
      </g>

      {/* Avión */}
      <g transform={quieto ? "translate(214 92) rotate(18)" : undefined}>
        <path
          fill="#fff"
          d="M-11 -1.8 H4 L11 0 L4 1.8 H-11 Z M-1 -1.8 L-6 -11 H-2.5 L6 -1.8 Z M-1 1.8 L-6 11 H-2.5 L6 1.8 Z M-11 -1.2 L-13 -6 H-10 L-7 -1.2 Z M-11 1.2 L-13 6 H-10 L-7 1.2 Z"
        />
        {!quieto && (
          <animateMotion dur="6.5s" repeatCount="indefinite" rotate="auto" path={ruta} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1" />
        )}
      </g>

      {/* Birrete */}
      <g className={quieto ? "" : "bic-flotar"}>
        <g transform="translate(6 22)">
          <path d="M20 44 L80 18 L140 44 L80 70 Z" fill={PETROLEO} stroke={CELESTE} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M44 55 v22 c0 11 72 11 72 0 v-22 L80 70 Z" fill={PETROLEO_2} stroke={CELESTE} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M80 44 L128 58 V86" stroke={AMARILLO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx="128" cy="90" r="5.5" fill={NARANJA} />
        </g>
      </g>

      {/* Sello */}
      <g transform="translate(296 270)">
        <rect width="110" height="36" rx="18" fill={NARANJA} />
        <text x="55" y="23.5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#01222E" fontFamily={FUENTE} letterSpacing=".5">TOP 400</text>
      </g>

      <Destellos quieto={quieto} puntos={[[378, 52, 8, 0], [44, 176, 6, .8], [392, 218, 5, 1.4], [172, 26, 5, 2]]} />
    </svg>
  );
}

// ── Separador ondulado entre secciones ──────────────────────────────────────
export function Separador({ arriba = "#FFFFFF", abajo = "#F2F8FF", invertir = false, className = "" }) {
  return (
    <div aria-hidden="true" style={{ background: arriba }} className={`-mb-px leading-none ${className}`}>
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className={`block h-7 w-full sm:h-12 ${invertir ? "-scale-x-100" : ""}`}>
        <path d="M0 34 C 220 64 440 6 720 26 S 1180 60 1440 20 V64 H0 Z" fill={abajo} />
        <path d="M0 34 C 220 64 440 6 720 26 S 1180 60 1440 20" fill="none" stroke={CELESTE} strokeOpacity=".45" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Simulador: portapapeles con checklist y medidor ─────────────────────────
export function IlustracionSimulador({ className = "" }) {
  const quieto = usePrefiereQuieto();
  return (
    <svg viewBox="0 0 210 170" className={className} role="img" aria-label="Ilustración: checklist de requisitos y medidor de puntaje">
      <circle cx="100" cy="92" r="72" fill={CELESTE} opacity=".22" />
      <g className={quieto ? "" : "bic-flotar"}>
        <rect x="34" y="22" width="112" height="138" rx="14" fill="#fff" stroke={PETROLEO} strokeWidth="3" />
        <rect x="66" y="12" width="48" height="20" rx="7" fill={NARANJA} stroke={PETROLEO} strokeWidth="2.5" />
        {[0, 1, 2, 3].map((i) => {
          const y = 54 + i * 26;
          const hecho = i < 3;
          return (
            <g key={i}>
              <rect x="48" y={y - 9} width="18" height="18" rx="5" fill={hecho ? CELESTE : CELESTE_CLARO} stroke={PETROLEO} strokeWidth="2" />
              {hecho && <path d={`M52 ${y} l4 4 l7 -8`} stroke={PETROLEO} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="74" y={y - 4} width={56 - i * 8} height="8" rx="4" fill={CELESTE_CLARO} />
            </g>
          );
        })}
      </g>
      <g transform="translate(160 122)">
        <circle r="40" fill={PETROLEO} stroke="#fff" strokeWidth="3" />
        <path d="M-25 8 A25 25 0 0 1 25 8" stroke="rgba(255,255,255,.22)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M-25 8 A25 25 0 0 1 17.7 -9.7" stroke={AMARILLO} strokeWidth="8" fill="none" strokeLinecap="round" />
        <text y="27" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff" fontFamily={FUENTE}>A+B+C</text>
      </g>
      <Destellos quieto={quieto} puntos={[[180, 34, 7, 0], [18, 60, 5, 1], [196, 76, 4, 1.8]]} color={NARANJA} />
    </svg>
  );
}

// ── Otras becas: medalla con cintas y diploma ───────────────────────────────
export function IlustracionBecas({ className = "" }) {
  const quieto = usePrefiereQuieto();
  return (
    <svg viewBox="0 0 240 170" className={className} role="img" aria-label="Ilustración: medalla y diploma de beca">
      <circle cx="122" cy="92" r="74" fill={CELESTE} opacity=".3" />
      <g transform="rotate(-10 70 118)">
        <rect x="22" y="98" width="100" height="58" rx="8" fill="#fff" stroke={PETROLEO} strokeWidth="3" />
        <rect x="36" y="112" width="60" height="7" rx="3.5" fill={CELESTE} />
        <rect x="36" y="126" width="44" height="7" rx="3.5" fill={CELESTE_CLARO} />
        <circle cx="104" cy="140" r="9" fill={NARANJA} />
      </g>
      <g className={quieto ? "" : "bic-flotar"}>
        <path d="M104 14 L134 14 L150 74 L128 80 Z" fill={NARANJA} stroke={PETROLEO} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M174 14 L144 14 L128 74 L150 80 Z" fill={CELESTE} stroke={PETROLEO} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="139" cy="104" r="38" fill={AMARILLO} stroke={PETROLEO} strokeWidth="3.5" />
        <circle cx="139" cy="104" r="27" fill="none" stroke={PETROLEO} strokeWidth="2" strokeDasharray="3 5" />
        <path d="M139 86 l5.3 11 12 1.4 -9 8.2 2.5 11.9 -10.8-6 -10.8 6 2.5-11.9 -9-8.2 12-1.4z" fill={PETROLEO} />
      </g>
      <Destellos quieto={quieto} puntos={[[206, 40, 8, 0], [36, 44, 6, .9], [214, 134, 5, 1.6]]} />
    </svg>
  );
}

// ── Máster económico: mapa de España, pin y monedas ─────────────────────────
export function IlustracionMaster({ className = "" }) {
  const quieto = usePrefiereQuieto();
  return (
    <svg viewBox="0 0 240 170" className={className} role="img" aria-label="Ilustración: mapa de España con un pin y monedas de euro">
      <circle cx="116" cy="90" r="74" fill="#fff" opacity=".07" />
      <path
        d="M34 58 L66 44 L112 46 L156 40 L182 54 L176 72 L158 90 L150 116 L120 130 L88 134 L60 126 L48 104 L34 94 L38 72 Z"
        fill={CELESTE}
        stroke="#fff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M60 70 L150 66 M52 96 L160 92" stroke={PETROLEO} strokeOpacity=".18" strokeWidth="2" strokeDasharray="4 6" />
      <g className={quieto ? "" : "bic-flotar"}>
        <path d="M104 52 c-13 0-22 10-22 22 0 16 22 36 22 36 s22-20 22-36c0-12-9-22-22-22z" fill={NARANJA} stroke="#fff" strokeWidth="3" />
        <circle cx="104" cy="74" r="8" fill="#fff" />
      </g>
      <g transform="translate(176 96)">
        {[2, 1, 0].map((i) => (
          <g key={i} transform={`translate(0 ${i * -12})`}>
            <ellipse cx="0" cy="40" rx="30" ry="10" fill="#E0B030" stroke={PETROLEO} strokeWidth="2.5" />
            <rect x="-30" y="30" width="60" height="10" fill="#E0B030" />
            <ellipse cx="0" cy="30" rx="30" ry="10" fill={AMARILLO} stroke={PETROLEO} strokeWidth="2.5" />
          </g>
        ))}
        <text x="0" y="11" textAnchor="middle" fontSize="15" fontWeight="900" fill={PETROLEO} fontFamily={FUENTE}>€</text>
      </g>
      <Destellos quieto={quieto} puntos={[[40, 26, 7, 0], [214, 30, 6, 1.1], [24, 140, 5, 1.8]]} />
    </svg>
  );
}

// ── Asesoría: burbujas de conversación ──────────────────────────────────────
export function IlustracionAsesoria({ className = "" }) {
  const quieto = usePrefiereQuieto();
  return (
    <svg viewBox="0 0 220 130" className={className} role="img" aria-label="Ilustración: conversación con tu asesor">
      <g className={quieto ? "" : "bic-flotar"}>
        <path d="M18 18 h110 a14 14 0 0 1 14 14 v40 a14 14 0 0 1 -14 14 H56 l-22 18 v-18 h-16 a14 14 0 0 1 -14 -14 v-40 a14 14 0 0 1 14 -14z" fill="#fff" />
        <rect x="30" y="38" width="84" height="8" rx="4" fill={CELESTE} />
        <rect x="30" y="56" width="60" height="8" rx="4" fill={CELESTE_CLARO} />
      </g>
      <path d="M104 58 h92 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-10 v16 l-20 -16 h-62 a12 12 0 0 1 -12 -12 v-30 a12 12 0 0 1 12 -12z" fill={NARANJA} />
      <path d="M136 86 l10 10 l20 -20" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Destellos quieto={quieto} puntos={[[200, 24, 7, 0], [160, 30, 4, 1]]} />
    </svg>
  );
}

// ── Banderas mini (SVG: los emojis de bandera no se ven en Windows) ─────────
const FRANJAS = {
  es: { dir: "h", colores: ["#AA151B", "#F1BF00", "#F1BF00", "#AA151B"] },
  de: { dir: "h", colores: ["#000000", "#DD0000", "#FFCE00"] },
  nl: { dir: "h", colores: ["#AE1C28", "#FFFFFF", "#21468B"] },
  fr: { dir: "v", colores: ["#0055A4", "#FFFFFF", "#EF4135"] },
  it: { dir: "v", colores: ["#009246", "#FFFFFF", "#CE2B37"] },
};

export function Bandera({ pais, className = "", titulo }) {
  const w = 24;
  const h = 16;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={`shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 ${className}`} role="img" aria-label={titulo || pais}>
      {pais === "ue" ? (
        <>
          <rect width={w} height={h} fill="#003399" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={12 + Math.cos(a) * 5} cy={8 + Math.sin(a) * 5} r=".85" fill="#FFCC00" />;
          })}
        </>
      ) : (
        (FRANJAS[pais]?.colores || ["#ccc"]).map((c, i, arr) =>
          FRANJAS[pais]?.dir === "v" ? (
            <rect key={i} x={(w / arr.length) * i} y="0" width={w / arr.length + 0.2} height={h} fill={c} />
          ) : (
            <rect key={i} x="0" y={(h / arr.length) * i} width={w} height={h / arr.length + 0.2} fill={c} />
          )
        )
      )}
    </svg>
  );
}
