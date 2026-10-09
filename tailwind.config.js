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
