// src/pages/mapa/PrimerAnio.jsx
//
// «Lo que cuesta tu primer año»: la respuesta a la única pregunta con la que
// llega la gente al mapa. Hasta ahora la página daba cuatro cifras sueltas
// (matrícula, vida, paquete de Inspira y el tramo de la comunidad) y ninguna
// contestaba «¿cuánto necesito para irme?».
//
// Reglas de honestidad, que son también las que hacen que funcione:
// - El total suma matrícula del máster y gasto de vida de un año. El paquete
//   de Inspira **no** se suma: se enseña aparte y dicho con todas las letras
//   que es lo único que se nos paga a nosotros.
// - El dinero de la vida no es un pago: es el saldo que Extranjería exige
//   demostrar. Se dice así, porque creerlo un pago espanta a quien sí podría.
// - Sin presupuesto calculable (comunidad sin coste de vida o con matrícula
//   que fija cada universidad) no se pinta nada: no se inventa un total.
//
// El botón de WhatsApp va dentro, y no solo al final de la ficha, porque el
// momento en que alguien decide escribir es justo cuando acaba de ver la
// cifra.
import Icono from "../../components/common/Icono";
import { whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { useContador } from "./useContador";
import { PRIMER_ANIO, eur } from "./mapaTextos";

const FOCO = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]";

function Fila({ icono, etiqueta, nota, importe, acento = false, ultima = false }) {
  return (
    <li className={`flex items-start gap-3 py-2.5 ${ultima ? "" : "border-b border-white/10"}`}>
      <span className={`mt-0.5 shrink-0 ${acento ? "text-[#F09C48]" : "text-[#96CCFC]"}`}>
        <Icono nombre={icono} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-tight text-white">{etiqueta}</span>
        <span className="block text-[12px] leading-snug text-white/70">{nota}</span>
      </span>
      <span className={`shrink-0 text-sm font-extrabold ${acento ? "text-[#F09C48]" : "text-white"}`}>{importe}</span>
    </li>
  );
}

/**
 * @param {object} comunidad  comunidad del índice (trae `lista` y `nombre`)
 * @param {object} presupuesto  { matricula, vida, total, ciudad } de indice.presupuestos
 * @param {number|null} paquete  precio «desde» del paquete de su lista
 * @param {string} lugar  el sitio del que se habla: la ciudad abierta o la comunidad
 */
export default function PrimerAnio({ comunidad, presupuesto, paquete, lugar }) {
  // La cifra sube hasta su valor al abrirse la ficha: el número es el
  // protagonista y conviene que se vea llegar.
  const total = useContador(presupuesto?.total || 0, 850);
  if (!presupuesto) return null;
  const donde = lugar || comunidad.nombre;

  return (
    <section
      aria-label={`Lo que cuesta el primer año en ${donde}`}
      className="mapa-primer-anio relative mt-4 overflow-hidden rounded-3xl bg-[#003648] p-4 text-white"
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 text-white/[0.07]">
        <Icono nombre="euro" size={110} />
      </span>

      <p className="mapa-rotulo mapa-rotulo-claro relative">
        <Icono nombre="euro" size={14} />
        {PRIMER_ANIO.rotulo}
      </p>
      <p className="mapa-titular relative mt-1 text-[40px] font-bold leading-none text-[#F09C48]">≈ {eur(total)}</p>
      <p className="relative mt-1.5 text-[13px] leading-snug text-white/80">{PRIMER_ANIO.subtitulo(donde)}</p>
      {presupuesto.matricula > 0 && (
        <p className="mapa-por-mes relative mt-2.5">
          <Icono nombre="destello" size={14} />
          {PRIMER_ANIO.porMes(eur(Math.round(presupuesto.matricula / 12)))}
        </p>
      )}

      <ul className="relative mt-3">
        <Fila
          icono="birrete"
          etiqueta={PRIMER_ANIO.matricula}
          nota={PRIMER_ANIO.matriculaNota}
          importe={eur(presupuesto.matricula)}
        />
        <Fila
          icono="casa"
          etiqueta={PRIMER_ANIO.vida(presupuesto.ciudad)}
          nota={
            Number.isFinite(presupuesto.habitacion)
              ? `${PRIMER_ANIO.vidaNota} ${PRIMER_ANIO.habitacion(eur(presupuesto.habitacion))}.`
              : PRIMER_ANIO.vidaNota
          }
          importe={eur(presupuesto.vida)}
        />
        {Number.isFinite(paquete) && (
          <Fila icono="avion" etiqueta={PRIMER_ANIO.inspira} nota={PRIMER_ANIO.inspiraNota} importe={`desde ${eur(paquete)}`} acento />
        )}
        {/* El saldo de la visa no es un gasto y no suma en el total: se
            demuestra, y es el mismo en toda España. Por eso va aparte. */}
        <Fila ultima icono="pasaporte" etiqueta={PRIMER_ANIO.visa} nota={PRIMER_ANIO.visaNota} importe="7.200 €" />
      </ul>

      <a
        href={whatsappDesde("mapa", PRIMER_ANIO.whatsapp(donde))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarEvento("mapa_whatsapp", { tipo: "primer_anio", id: comunidad.id })}
        className={`mapa-boton mov-toque relative mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-3 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] ${FOCO}`}
      >
        <Icono nombre="chat" size={18} />
        {PRIMER_ANIO.boton(donde)}
      </a>
      <p className="relative mt-2 text-[11px] leading-snug text-white/60">{PRIMER_ANIO.nota}</p>
    </section>
  );
}
