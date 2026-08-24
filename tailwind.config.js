export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Paleta tomada del material gráfico de la marca: azul marino
      // corporativo + naranja de acento.
      colors: {
        primary:        "#0F2C52",
        "primary-light": "#17406F",
        "primary-dark":  "#0A1F3C",

        secondary:        "#E6EEF8",
        "secondary-light": "#F3F7FC",

        accent:      "#F5871F",
        "accent-dark": "#DB6F0C",

        neutral: {
          900: "#1A1A1A",
          700: "#4A4A4A",
          500: "#9B9B9B",
          200: "#E5E5E5",
        },

        white: "#FFFFFF",
      },
      fontFamily: {
        sans:     ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        fraunces: ["Fraunces", "serif"],
      },
    },
  },
  plugins: [],
};
