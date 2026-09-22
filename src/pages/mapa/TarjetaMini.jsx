// src/pages/mapa/TarjetaMini.jsx
//
// El cuadrito del mapa. Encargo de la clienta (22/09/2026), señalando cómo se
// comporta Google Maps en sus vídeos: «las personas podían interactuar encima
// y ver un cuadro chiquito, y de ahí saltar a cuadros más grandes, tal vez
// poder marcar interés».
//
// En el teléfono, tocar una burbuja abría de golpe la hoja de detalle, que
// tapa media pantalla y saca al visitante del mapa. Ahora aparece esto: una
// tarjeta baja, dentro del marco del mapa, con lo justo para decidir —cuánto
// cuesta, cuándo se postula, cuántas universidades hay— y dos salidas: abrir
// la ficha entera o marcarlo como interesante y seguir mirando.
//
// «Me interesa» se guarda en el propio teléfono (localStorage). No es una
// cuenta ni un envío: es la lista que luego se ofrece mandar por WhatsApp,
// así que nunca sale de aquí si la persona no lo pide.
import Icono from "../../components/common/Icono";
import IconoMapa from "./IconosMapa";
import { MAX_INTERES } from "./useInteres";
import { masteresDe, mejorRanking } from "./indice";
import { cursoCorto, plazoMasTemprano, rangoFechas } from "./plazos";
import { eur, etiquetaLista, importeMatricula, numero, plural, textoRanking } from "./mapaTextos";

/* ── Lo que se enseña de cada cosa ───────────────────────────────────── */

function plazoTexto(unis) {
  const mejor = plazoMasTemprano(unis.filter(Boolean));
  if (!mejor) return null;
  const rango = rangoFechas(mejor.fase.inicio, mejor.fase.fin);
  if (!rango) return null;
  return { rango, curso: cursoCorto(mejor.curso), quien: mejor.u.sigla };
}

function datosDe(indice, foco) {
  const uni = (id) => indice.universidades.get(id);
  const com = foco.comunidad ? indice.comunidades.get(foco.comunidad) : null;
  const matriculaCom = com ? (com.precioAnual ? `≈ ${eur(Math.round(com.precioAnual.tipico))}/año` : importeMatricula(com.matricula)) : null;

  if (foco.tipo === "universidad") {
    const u = uni(foco.universidad);
    if (!u) return null;
    return {
      tipo: "universidad",
      id: u.id,
      titulo: u.nombre,
      sub: `${u.sigla} · ${indice.ciudades.get(u.ciudad)?.nombre || com?.nombre || ""}`,
      sigla: u.sigla,
      lista: indice.listas.get(u.lista),
      matricula: u.precioAnual ? `≈ ${eur(Math.round(u.precioAnual.tipico))}/año` : matriculaCom,
      cifras: plural(masteresDe(u, null), "máster oficial", "másteres oficiales"),
      ranking: textoRanking(u.ranking),
      plazo: plazoTexto([u]),
    };
  }

  if (foco.tipo === "ciudad") {
    const c = indice.ciudades.get(foco.ciudad);
    if (!c) return null;
    const mejor = mejorRanking(indice, [...c.universidades, ...c.campus]);
    return {
      tipo: "ciudad",
      id: c.id,
      titulo: c.nombre,
      sub: com?.nombre || "",
      lista: indice.listas.get(com?.lista),
      matricula: matriculaCom,
      cifras: `${plural(c.universidades.length, "universidad", "universidades")} · ${plural(c.masteres, "máster", "másteres")}`,
      ranking: mejor ? `${mejor.u.sigla}: ${textoRanking(mejor.u.ranking)}` : null,
      plazo: plazoTexto(c.universidades.map(uni)),
    };
  }

  if (com) {
    return {
      tipo: "comunidad",
      id: com.id,
      titulo: com.nombre,
      sub: `${numero(com.ciudades.length)} ciudades universitarias`,
      lista: indice.listas.get(com.lista),
      matricula: matriculaCom,
      cifras: `${plural(com.universidades, "universidad", "universidades")} · ${plural(com.masteres, "máster", "másteres")}`,
      ranking: null,
      plazo: plazoTexto(com.universidadesIds.map(uni)),
    };
  }
  return null;
}

/**
 * El icono de la tarjeta: la sigla de la universidad (UDC, UPV) o las dos
 * primeras letras del sitio, en un cuadrado de la marca. Los escudos de las
 * universidades son marcas registradas y no se usan sin licencia; esto
 * cumple la misma función, identificar de un vistazo, y es nuestro.
 */
function Monograma({ texto, tipo }) {
  const corto = String(texto || "")
    .replace(/^(Universi\w+|Máster)\s+/i, "")
    .slice(0, 4)
    .toUpperCase();
  const fondo = tipo === "universidad" ? "bg-[#003648] text-white" : tipo === "ciudad" ? "bg-[#0A5873] text-white" : "bg-[#E6F2FE] text-[#003648]";
  return (
    <span
      aria-hidden="true"
      className={`mapa-titular flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold tracking-tight ${fondo}`}
    >
      {corto}
    </span>
  );
}

/* ── La tarjeta ──────────────────────────────────────────────────────── */

function Linea({ icono, children }) {
  if (!children) return null;
  return (
    <p className="flex items-start gap-2 text-[13px] leading-snug text-neutral-700">
      <span className="mt-0.5 shrink-0 text-[#0A5873]">
        <Icono nombre={icono} size={14} />
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export default function TarjetaMini({ indice, foco, marcado, onVerTodo, onInteres, onCerrar }) {
  const d = datosDe(indice, foco);
  if (!d) return null;

  return (
    <div className="mapa-mini absolute inset-x-3 bottom-3 z-[3] rounded-2xl bg-white p-3.5 text-left shadow-[0_24px_50px_-20px_rgba(0,54,72,0.55)] ring-1 ring-[#CFE6FD]">
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-[#0A5873] hover:bg-[#F2F7FC]"
      >
        <IconoMapa nombre="cerrar" size={14} strokeWidth={2.2} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <Monograma texto={d.sigla || d.titulo} tipo={d.tipo} />
        <span className="min-w-0">
          <span className="mapa-titular block text-[15px] font-bold leading-tight text-[#003648]">{d.titulo}</span>
          <span className="mt-0.5 block text-[12px] font-semibold text-[#0A5873]">{d.sub}</span>
          {d.lista && (
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#F2F7FC] px-2 py-0.5 text-[11px] font-bold text-[#003648] ring-1 ring-[#E1EFFD]">
              {etiquetaLista(d.lista)}
            </span>
          )}
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        <Linea icono="euro">
          <strong className="text-[#003648]">{d.matricula}</strong> de matrícula. La cobra la universidad.
        </Linea>
        {d.plazo && (
          <Linea icono="calendario">
            Postulación {d.plazo.rango}
            {d.plazo.curso ? ` · curso ${d.plazo.curso}` : ""}
          </Linea>
        )}
        <Linea icono="birrete">{d.cifras}</Linea>
        {d.ranking && <Linea icono="trofeo">{d.ranking}</Linea>}
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={onVerTodo}
          className="mapa-boton mov-toque inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#003648] px-4 text-[13px] font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
        >
          Ver todo
          <Icono nombre="flecha" size={14} className="text-[#F09C48]" />
        </button>
        <button
          type="button"
          aria-pressed={marcado}
          onClick={() => onInteres(d.tipo, d.id)}
          className={`mapa-boton mov-toque inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3.5 text-[13px] font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
            marcado ? "bg-[#F09C48] text-[#003648]" : "bg-[#F2F7FC] text-[#003648] ring-1 ring-[#CFE6FD]"
          }`}
        >
          <Icono nombre={marcado ? "check" : "estrella"} size={15} />
          {marcado ? "Guardado" : "Me interesa"}
        </button>
      </div>
    </div>
  );
}
