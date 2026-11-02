export default {
  // Sin `content` (09/10/2026): en Tailwind 4 los globos de `content` de un
  // @config se suman a las fuentes de CADA hoja que lo cargue, y deshacían
  // el reparto por aplicación. Qué escanea cada hoja lo dicen sus @source:
  // src/styles/globals.css, utilidades-core.css y utilidades-panel.css.
  theme: {
    extend: {
      // Paleta EXACTA del logo: azul petróleo #013446, celeste #88C4FC y
      // naranja #FA943A, más un amarillo de apoyo del material gráfico.
      colors: {
        primary:        "#013446",
        "primary-light": "#02506B",
        "primary-dark":  "#01222E",

        secondary:        "#E3F0FE",
        "secondary-light": "#F2F8FF",

        sky:          "#88C4FC",
        "sky-dark":   "#4E9EE8",
        "sky-light":  "#E3F0FE",

        accent:      "#FA943A",
        "accent-dark": "#E07A1C",

        sun:         "#F9C846",

        neutral: {
          900: "#1A1A1A",
          700: "#4A4A4A",
          500: "#9B9B9B",
          200: "#E5E5E5",
        },

        white: "#FFFFFF",

        // Panel del asesorado (25/10/2026): espejo de los tokens del bloque
        // .pnl de src/styles/panel.css, para las piezas que también pinta
        // Inspira Core y solo admiten clases de marca. Ningún nombre coincide
        // con uno de tamaño (en TW4 text-* resuelve los dos) ni pisa las
        // escalas de TW4 (por eso no hay green ni red).
        noche:         "#012938",
        tinta:         "#0D2C3A",
        "tinta-2":     "#4D6775",
        muted:         "#587583",
        trazo:         "#7A93A2",
        linea:         "#D8E7F5",
        fondo:         "#F4F9FE",
        verde:         "#1D6A4A",
        "verde-soft":  "#E7F5ED",
        "verde-ink":   "#15603F",
        "aviso-soft":  "#FDF3E3",
        "aviso-ink":   "#8A4F12",
        alto:          "#BE3C42",
        "alto-soft":   "#FDECEC",
        "alto-ink":    "#A5262F",
        "info-soft":   "#E3F0FE",
        "info-ink":    "#17608F",
        "neutro-soft": "#EEF4F7",
        "neutro-ink":  "#2C4A58",
      },
      // Escala de texto del panel (25/10/2026), la misma de --fs-* en .pnl.
      fontSize: {
        eyebrow:     ["11px", { lineHeight: "1.2", letterSpacing: ".12em" }],
        meta:        ["12px", "1.4"],
        "cuerpo-sm": ["13px", "1.5"],
        cuerpo:      ["14px", "1.55"],
        lectura:     ["15px", "1.5"],
        titulo:      ["17px", "1.3"],
        "display-2": ["20px", "1.2"],
        "display-1": ["26px", "1.15"],
      },
      // Tras cada fuente va su reserva ajustada (styles/fuentes-ajuste.css,
      // 09/10/2026): lo prerenderizado se pinta antes de que lleguen las de
      // Google y así no salta al cambiar de letra.
      fontFamily: {
        sans: ["Montserrat", "Montserrat ajuste", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        // `fraunces` se mantiene como alias del display para no tocar las
        // decenas de clases font-fraunces ya existentes.
        fraunces: ["Merriweather", "Merriweather ajuste", "Merriweather ajuste Noto", "Georgia", "serif"],
        display:  ["Merriweather", "Merriweather ajuste", "Merriweather ajuste Noto", "Georgia", "serif"],
        serif:    ["Merriweather", "Merriweather ajuste", "Merriweather ajuste Noto", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
