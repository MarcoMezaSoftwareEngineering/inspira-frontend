// Guía interna del servicio de Doctorado: lo que un asesor tiene que saber
// para vender, preparar y acompañar un doctorado (vía migratoria, acceso,
// proceso, calendario, documentos, paquetes, costes y becas). Contenido en
// guiaDoctorado.datos.js.
import { AlertTriangle, BadgeCheck, BookOpen, CalendarClock, FileText, Landmark, Scale, Wallet, GraduationCap, Ban, Flag, Link2 } from "lucide-react";
import { Seccion } from "../ui";
import {
  PAQUETES, NO_HACEMOS, VIA, NACIONALIDAD, ACCESO, PASOS, CALENDARIO_PATRON, DOCUMENTOS, ERRORES, COSTES, BECAS, MERCADO, FUENTES,
} from "./guiaDoctorado.datos";

function Filas({ filas }) {
  return (
    <dl className="ase-dc-filas">
      {filas.map(([t, d]) => (
        <div key={t}><dt>{t}</dt><dd>{d}</dd></div>
      ))}
    </dl>
  );
}

function Titulo({ icono, children }) {
  return <span className="ase-dc-tit">{icono}{children}</span>;
}

const INDICE = [
  ["dc-paquetes", "Paquetes"], ["dc-via", "Vía migratoria"], ["dc-nacionalidad", "Nacionalidad"], ["dc-acceso", "Acceso"],
  ["dc-proceso", "Proceso"], ["dc-calendario", "Calendario"], ["dc-documentos", "Documentos"], ["dc-costes", "Costes"],
  ["dc-becas", "Becas"], ["dc-errores", "Errores típicos"], ["dc-fuentes", "Fuentes"],
];

export default function GuiaDoctorado({ onIr }) {
  return (
    <div className="ase-dc-guia">
      <div className="ase-dc-hero">
        <div>
          <p className="ase-dc-eb">Servicio nuevo · 18/09/2026</p>
          <h2>Doctorado en España: residencia desde el primer día</h2>
          <p>Desde el Criterio DGGM 2/2026 el doctorado ya no es estancia por estudios: es <b>residencia para investigación</b>. Cuenta para la nacionalidad, permite traer a la familia y se resuelve en 20 días. Para quien ya tiene maestría, es el camino más corto.</p>
        </div>
        <div className="ase-dc-cifras">
          {MERCADO.map(([n, t]) => <div key={t}><b>{n}</b><span>{t}</span></div>)}
        </div>
      </div>

      <nav className="ase-dc-indice" aria-label="Índice de la guía">
        {INDICE.map(([id, t]) => <a key={id} href={`#${id}`}>{t}</a>)}
      </nav>

      <div id="dc-paquetes">
        <Seccion titulo={<Titulo icono={<Wallet size={17} />}>Paquetes y precios</Titulo>} subtitulo="Normalmente se postula a 1–3 programas. La residencia y los familiares van aparte.">
          <div className="ase-dc-paquetes">
            {PAQUETES.map((p) => (
              <div key={p.nombre} className="ase-dc-paquete" data-destacado={p.destacado ? "1" : "0"}>
                <div className="ase-dc-paquete-cab"><h4>{p.nombre}</h4><b>{p.precio}</b></div>
                <p className="ase-dc-alc">{p.alcance}</p>
                <ul>{p.incluye.map((i) => <li key={i}><BadgeCheck size={14} />{i}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="ase-dc-aviso">
            <Ban size={16} />
            <div><b>Lo que no hacemos</b><ul>{NO_HACEMOS.map((t) => <li key={t}>{t}</li>)}</ul></div>
          </div>
        </Seccion>
      </div>

      <div id="dc-via">
        <Seccion titulo={<Titulo icono={<Landmark size={17} />}>Vía migratoria: residencia para investigación (UGE)</Titulo>}>
          <Filas filas={VIA} />
        </Seccion>
      </div>

      <div id="dc-nacionalidad">
        <Seccion titulo={<Titulo icono={<Flag size={17} />}>Nacionalidad: el gancho, bien dicho</Titulo>}>
          <p className="ase-dc-frase">«{NACIONALIDAD.frase}»</p>
          <ul className="ase-dc-lista">{NACIONALIDAD.puntos.map((t) => <li key={t}>{t}</li>)}</ul>
        </Seccion>
      </div>

      <div id="dc-acceso">
        <Seccion titulo={<Titulo icono={<GraduationCap size={17} />}>Acceso académico</Titulo>}>
          <Filas filas={ACCESO} />
        </Seccion>
      </div>

      <div id="dc-proceso">
        <Seccion titulo={<Titulo icono={<Scale size={17} />}>Proceso completo</Titulo>} subtitulo="10–14 meses del primer contacto a la llegada; 3–5 años de doctorado.">
          <ol className="ase-dc-pasos">
            {PASOS.map(([t, d, tiempo], i) => (
              <li key={t}><span className="n">{i + 1}</span><div><b>{t}</b><p>{d}</p></div><span className="t">{tiempo}</span></li>
            ))}
          </ol>
        </Seccion>
      </div>

      <div id="dc-calendario">
        <Seccion titulo={<Titulo icono={<CalendarClock size={17} />}>Calendario: el patrón</Titulo>}
          derecha={<button type="button" className="ase-dc-link" onClick={() => onIr?.("universidades")}>Ver plazos por universidad →</button>}>
          <ul className="ase-dc-lista">{CALENDARIO_PATRON.map((t) => <li key={t}>{t}</li>)}</ul>
        </Seccion>
      </div>

      <div id="dc-documentos">
        <Seccion titulo={<Titulo icono={<FileText size={17} />}>Documentos del asesorado</Titulo>}>
          <ol className="ase-dc-docs">{DOCUMENTOS.map((t) => <li key={t}>{t}</li>)}</ol>
        </Seccion>
      </div>

      <div id="dc-costes">
        <Seccion titulo={<Titulo icono={<Wallet size={17} />}>Lo que paga el asesorado a la universidad</Titulo>}
          derecha={<button type="button" className="ase-dc-link" onClick={() => onIr?.("precios")}>Precios por comunidad →</button>}>
          <Filas filas={COSTES} />
        </Seccion>
      </div>

      <div id="dc-becas">
        <Seccion titulo={<Titulo icono={<BookOpen size={17} />}>Financiación y becas</Titulo>} subtitulo="Un contrato predoctoral cubre de sobra los medios de la residencia.">
          <Filas filas={BECAS} />
        </Seccion>
      </div>

      <div id="dc-errores">
        <Seccion titulo={<Titulo icono={<AlertTriangle size={17} />}>Dónde suele fallar el asesorado</Titulo>}>
          <ul className="ase-dc-lista">{ERRORES.map((t) => <li key={t}>{t}</li>)}</ul>
        </Seccion>
      </div>

      <div id="dc-fuentes">
        <Seccion titulo={<Titulo icono={<Link2 size={17} />}>Fuentes oficiales</Titulo>} subtitulo="Consultadas el 18/09/2026. Si una norma cambia, se revisa aquí primero.">
          <ul className="ase-dc-fuentes">
            {FUENTES.map(([t, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a></li>)}
          </ul>
        </Seccion>
      </div>
    </div>
  );
}
