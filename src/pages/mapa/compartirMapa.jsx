// src/pages/mapa/compartirMapa.jsx
//
// «Compártelo»: el mapa, en una imagen vertical de 1080×1920 para historias y
// TikTok, más el enlace a lo que la persona está viendo (comunidad, ciudad y
// filtros van en la URL, así que el enlace abre exactamente su mapa).
//
// La imagen se dibuja aquí, en el navegador, con canvas: no se manda nada a
// ningún sitio y no hace falta servidor. España se pinta con la misma
// geometría del mapa (Path2D sobre los `d` de mapaEspana.data), coloreada por
// listas, con la comunidad elegida en Sol.
//
// Lo que nunca puede faltar en la imagen, por encargo de la clienta
// (22/09/2026): que se vean como dos cosas distintas la matrícula que cobra la
// universidad y el paquete de postulación que cobra Inspira.
//
// Mismo patrón que pages/bicentenario/compartirResultado.jsx: en el móvil se
// abre el menú de compartir del sistema con la imagen; donde no se puede, se
// descarga para subirla a mano.
import { useState } from "react";
import Icono from "../../components/common/Icono";
import { registrarEvento } from "../../lib/analytics";
import { masteresDe } from "./indice";
import { cursoCorto, plazoMasTemprano, rangoFechas } from "./plazos";
import { NOCHE, SOL, tonoDe } from "./tonosMapa";
import { eur, etiquetaLista, importeMatricula, numero, plural } from "./mapaTextos";

const W = 1080;
const H = 1920;
const FUENTE = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const ENLACE = "inspira-legal.cloud/mapa-estudiar-en-espana";
const CIELO_CLARO = "#CFE6FD";

function rectRedondo(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Corta un texto largo a lo ancho disponible y devuelve sus líneas. */
function lineas(g, texto, ancho, max = 2) {
  const palabras = String(texto).split(" ");
  const salida = [];
  let linea = "";
  for (const p of palabras) {
    const prueba = linea ? `${linea} ${p}` : p;
    if (g.measureText(prueba).width > ancho && linea) {
      salida.push(linea);
      linea = p;
      if (salida.length === max) return salida;
    } else {
      linea = prueba;
    }
  }
  if (linea) salida.push(linea);
  return salida.slice(0, max);
}

// Los colores del mapa están pensados para fondo claro; sobre el Noche de la
// historia, la Lista 1 se perdía del todo. Estos son los mismos códigos de
// lista, subidos de brillo para que España se lea en el teléfono de alguien.
const TONO_HISTORIA = {
  economicas: "#5FA8C9",
  intermedias: "#A9D6FD",
  premium: "#E9B27B",
  fuera: "#8AA0AF",
};

/** España coloreada por listas, con la comunidad elegida en Sol. */
function dibujarEspana(g, geo, listaDe, elegida, caja) {
  if (typeof Path2D !== "function" || !geo?.comunidades?.length) return;
  const vb = String(geo.viewBox || "").split(/\s+/).map(Number);
  if (vb.length !== 4 || vb.some((n) => !Number.isFinite(n))) return;
  const escala = Math.min(caja.w / vb[2], caja.h / vb[3]);
  g.save();
  g.translate(caja.x + (caja.w - vb[2] * escala) / 2, caja.y + (caja.h - vb[3] * escala) / 2);
  g.scale(escala, escala);
  g.translate(-vb[0], -vb[1]);
  g.lineJoin = "round";
  g.lineWidth = 2.2 / escala;
  for (const c of geo.comunidades) {
    if (!c.d) continue;
    let forma;
    try {
      forma = new Path2D(c.d);
    } catch {
      continue;
    }
    const esElegida = elegida && c.id === elegida;
    g.fillStyle = esElegida ? SOL : TONO_HISTORIA[listaDe(c.id)] || TONO_HISTORIA.fuera;
    g.globalAlpha = esElegida || !elegida ? 1 : 0.7;
    g.fill(forma);
    g.strokeStyle = esElegida ? "#FFFFFF" : "rgba(255,255,255,0.75)";
    g.lineWidth = (esElegida ? 4 : 2.2) / escala;
    g.stroke(forma);
  }
  g.globalAlpha = 1;
  g.restore();
}

function crearImagen({ geo, indice, titulo, sitio, lista, matricula, paquete, plazo, izquierda, derecha, elegida }) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");

  const fondo = g.createLinearGradient(0, 0, W, H);
  fondo.addColorStop(0, NOCHE);
  fondo.addColorStop(1, "#0A5873");
  g.fillStyle = fondo;
  g.fillRect(0, 0, W, H);
  // Trama de puntos, como el mar del mapa.
  g.fillStyle = "rgba(150,204,252,0.16)";
  for (let y = 40; y < H; y += 46) for (let x = 40; x < W; x += 46) g.fillRect(x, y, 3, 3);

  g.textAlign = "center";
  g.fillStyle = SOL;
  g.font = `800 36px ${FUENTE}`;
  g.fillText("MAPA DE COSTOS DE MÁSTER · ESPAÑA", W / 2, 130);
  // «¿Son de título oficial?» es lo primero que preguntan en los comentarios.
  g.font = `800 28px ${FUENTE}`;
  const sello = "SOLO MÁSTERES OFICIALES · REGISTRO DEL MINISTERIO (RUCT)";
  const anchoSello = g.measureText(sello).width + 48;
  g.fillStyle = "rgba(240,156,72,0.18)";
  rectRedondo(g, (W - anchoSello) / 2, 160, anchoSello, 54, 27);
  g.fill();
  g.strokeStyle = "rgba(240,156,72,0.55)";
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = SOL;
  g.fillText(sello, W / 2, 195);

  g.fillStyle = "#FFFFFF";
  g.font = `800 76px ${FUENTE}`;
  const tituloLineas = lineas(g, titulo, W - 180, 2);
  tituloLineas.forEach((l, i) => g.fillText(l, W / 2, 310 + i * 88));
  let y = 310 + tituloLineas.length * 88;

  if (sitio) {
    g.fillStyle = CIELO_CLARO;
    g.font = `600 42px ${FUENTE}`;
    g.fillText(sitio, W / 2, y + 12);
    y += 60;
  }
  if (izquierda || derecha) {
    g.fillStyle = "#FFFFFF";
    g.font = `700 38px ${FUENTE}`;
    g.fillText([izquierda, derecha].filter(Boolean).join("  ·  "), W / 2, y + 12);
    y += 58;
  }
  if (lista) {
    g.font = `800 34px ${FUENTE}`;
    const ancho = g.measureText(lista).width + 56;
    g.fillStyle = "rgba(150,204,252,0.22)";
    rectRedondo(g, (W - ancho) / 2, y - 8, ancho, 62, 31);
    g.fill();
    g.fillStyle = CIELO_CLARO;
    g.fillText(lista, W / 2, y + 33);
    y += 80;
  }

  // El alto del mapa es lo que sobre entre el título y los bloques de abajo:
  // con un nombre de dos líneas o sin plazo, la composición sigue cuadrando.
  const tope = H - 400;
  const altoBloques = 250 + (plazo ? 150 : 0);
  const altoMapa = Math.max(280, tope - y - altoBloques);
  dibujarEspana(g, geo, (id) => indice.comunidades.get(id)?.lista, elegida, { x: 130, y: y + 10, w: W - 260, h: altoMapa });
  y += altoMapa + 40;

  // Las dos cifras que no se pueden confundir.
  const tarjeta = (x, w, rotulo, valor, color) => {
    g.fillStyle = "rgba(255,255,255,0.08)";
    rectRedondo(g, x, y, w, 190, 34);
    g.fill();
    g.strokeStyle = "rgba(150,204,252,0.35)";
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = CIELO_CLARO;
    g.font = `700 30px ${FUENTE}`;
    lineas(g, rotulo, w - 50, 2).forEach((l, i) => g.fillText(l, x + w / 2, y + 60 + i * 36));
    g.fillStyle = color;
    g.font = `900 46px ${FUENTE}`;
    g.fillText(valor, x + w / 2, y + 152);
  };
  tarjeta(110, 400, "Matrícula de la universidad", matricula, "#FFFFFF");
  tarjeta(570, 400, "Paquete de Inspira", paquete, SOL);
  y += 250;

  if (plazo) {
    g.fillStyle = "rgba(150,204,252,0.14)";
    rectRedondo(g, 110, y, W - 220, 120, 34);
    g.fill();
    g.fillStyle = CIELO_CLARO;
    g.font = `700 30px ${FUENTE}`;
    g.fillText("POSTULACIÓN ESTIMADA", W / 2, y + 48);
    g.fillStyle = "#FFFFFF";
    g.font = `800 40px ${FUENTE}`;
    g.fillText(plazo, W / 2, y + 95);
    y += 150;
  }

  g.fillStyle = "#FFFFFF";
  rectRedondo(g, 110, H - 360, W - 220, 190, 40);
  g.fill();
  g.fillStyle = NOCHE;
  g.font = `800 44px ${FUENTE}`;
  g.fillText("Mira cuánto cuesta el tuyo", W / 2, H - 285);
  g.fillStyle = "#0A5873";
  g.font = `800 38px ${FUENTE}`;
  g.fillText(ENLACE, W / 2, H - 222);

  g.fillStyle = "rgba(207,230,253,0.8)";
  g.font = `500 26px ${FUENTE}`;
  g.fillText("Inspira Legal · la matrícula la cobra la universidad, el paquete lo cobra Inspira", W / 2, H - 90);

  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error("sin imagen"))), "image/png"));
}

/** La dirección de lo que se está viendo, con su procedencia para medirlo. */
function enlaceActual() {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("utm_source", "compartir");
    return u.toString();
  } catch {
    return `https://www.${ENLACE}`;
  }
}

/** «6 feb – 16 may 2026 · 2027/28», si alguna universidad publica fechas. */
function textoPlazo(unis) {
  const mejor = plazoMasTemprano(unis.filter(Boolean));
  if (!mejor) return null;
  const rango = rangoFechas(mejor.fase.inicio, mejor.fase.fin);
  if (!rango) return null;
  const curso = cursoCorto(mejor.curso);
  return curso ? `${rango} · curso ${curso}` : rango;
}

/** Qué se escribe en la imagen según lo que haya abierto en el mapa. */
function datosDe({ indice, foco, casos }) {
  const totales = indice.datos.totales;
  const uni = (id) => indice.universidades.get(id);
  const desdeLista = (id) => indice.listas.get(id)?.desde;
  const minPaquete = Math.min(...indice.datos.listas.map((l) => l.desde).filter(Number.isFinite));
  const base = {
    titulo: "¿Cuánto cuesta un máster en España?",
    sitio: null,
    lista: null,
    matricula: "según la comunidad",
    paquete: Number.isFinite(minPaquete) ? `desde ${eur(minPaquete)}` : "a medida",
    izquierda: plural(totales.universidades, "universidad", "universidades"),
    derecha: plural(totales.masteres, "máster oficial", "másteres oficiales"),
    plazo: textoPlazo(indice.datos.universidades),
    elegida: null,
  };

  const com = foco.comunidad ? indice.comunidades.get(foco.comunidad) : null;
  if (!com) return base;

  const paquete = desdeLista(com.lista);
  const matricula = com.precioAnual ? `≈ ${eur(Math.round(com.precioAnual.tipico))}/año` : importeMatricula(com.matricula);
  const comun = {
    lista: etiquetaLista(indice.listas.get(com.lista)),
    matricula,
    paquete: Number.isFinite(paquete) ? `desde ${eur(paquete)}` : "a medida",
    elegida: com.id,
  };
  const plazoDe = (ids) => textoPlazo(ids.map(uni));

  const u = foco.universidad ? indice.universidades.get(foco.universidad) : null;
  if (u) {
    return {
      ...comun,
      titulo: u.nombre,
      sitio: `${u.sigla} · ${com.nombre}`,
      izquierda: plural(masteresDe(u, null), "máster oficial", "másteres oficiales"),
      derecha: null,
      plazo: textoPlazo([u]),
    };
  }
  const ciudad = foco.ciudad ? indice.ciudades.get(foco.ciudad) : null;
  if (ciudad) {
    return {
      ...comun,
      titulo: ciudad.nombre,
      sitio: com.nombre,
      izquierda: plural(ciudad.universidades.length, "universidad", "universidades"),
      derecha: plural(ciudad.masteres, "máster oficial", "másteres oficiales"),
      plazo: plazoDe(ciudad.universidades),
    };
  }
  return {
    ...comun,
    titulo: com.nombre,
    sitio: `${numero(com.ciudades.length)} ciudades universitarias`,
    izquierda: plural(com.universidades, "universidad", "universidades"),
    derecha: plural(com.masteres, "máster oficial", "másteres oficiales"),
    plazo: plazoDe(com.universidadesIds),
  };
}

export default function CompartirMapa({ geo, indice, foco, casos = [] }) {
  const [estado, setEstado] = useState("");

  async function compartir() {
    setEstado("preparando");
    const datos = datosDe({ indice, foco, casos });
    const url = enlaceActual();
    const texto = `${datos.titulo} — ${datos.matricula} de matrícula al año. Mira el mapa: ${url}`;
    registrarEvento("mapa_compartir", { tipo: foco.tipo || "espana", id: foco.comunidad || "" });
    try {
      const blob = await crearImagen({ geo, indice, ...datos });
      const archivo = new File([blob], "mapa-master-espana.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], text: texto });
          setEstado("");
          return;
        } catch (e) {
          if (e?.name === "AbortError") {
            setEstado("");
            return;
          }
        }
      }
      const objeto = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objeto;
      a.download = archivo.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objeto), 4000);
      setEstado("descargado");
    } catch {
      setEstado("error");
    }
  }

  async function copiar() {
    const url = enlaceActual();
    registrarEvento("mapa_copiar_enlace", { tipo: foco.tipo || "espana" });
    try {
      await navigator.clipboard.writeText(url);
      setEstado("copiado");
    } catch {
      window.prompt("Copia el enlace de tu mapa:", url);
      setEstado("");
    }
  }

  return (
    <div className="mapa-compartir mt-3 flex flex-wrap items-center gap-2" data-revelar="suave">
      <span className="mapa-rotulo mr-1">
        <Icono nombre="destello" size={14} />
        Compártelo
      </span>
      <button
        type="button"
        onClick={compartir}
        disabled={estado === "preparando"}
        className="mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#003648] px-4 py-2 text-xs font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] disabled:opacity-70"
      >
        <Icono nombre="movil" size={15} className="text-[#F09C48]" />
        {estado === "preparando" ? "Preparando la imagen…" : "Imagen para historias"}
      </button>
      <button
        type="button"
        onClick={copiar}
        className="mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CFE6FD] bg-white px-4 py-2 text-xs font-extrabold text-[#003648] hover:bg-[#F6FBFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
      >
        <Icono nombre="copiar" size={15} className="text-[#0A5873]" />
        Copiar el enlace de mi mapa
      </button>
      {estado === "copiado" && (
        <span role="status" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A5873]">
          <Icono nombre="check" size={14} />
          Enlace copiado: abre justo lo que estás viendo.
        </span>
      )}
      {estado === "descargado" && (
        <span role="status" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A5873]">
          <Icono nombre="descarga" size={14} />
          Imagen descargada: súbela a tus historias.
        </span>
      )}
      {estado === "error" && (
        <span role="status" className="text-xs font-bold text-red-700">
          No se pudo crear la imagen.
        </span>
      )}
    </div>
  );
}
