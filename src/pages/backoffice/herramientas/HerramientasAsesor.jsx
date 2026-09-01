// Herramientas del asesor.
//
// Lo que hace falta para atender un expediente, en un sitio. Nace de que las
// piezas estaban repartidas —el presupuesto en un módulo, las guías en el
// portal del asesorado, el catálogo en otro— y quien atiende tenía que saberse
// dónde vive cada cosa.
//
// Las tarjetas dicen en qué estado está cada herramienta, incluidas las que
// todavía no existen. Enseñar sólo lo terminado esconde el plan, y quien abre
// esta página necesita saber con qué puede contar hoy y con qué no.
import { useCallback, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";

/** Estado de cada herramienta, dicho sin rodeos. */
const ESTADO = {
  lista:    { texto: "disponible",   clase: "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35" },
  media:    { texto: "a medias",     clase: "bg-[#FEF3E7] text-[#B9770E] border-amber-300/60" },
  pendiente:{ texto: "por construir", clase: "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/25" },
};

function Tarjeta({ icono, tono, titulo, descripcion, estado, dato, href, onIr }) {
  const e = ESTADO[estado] || ESTADO.pendiente;
  const activa = Boolean(href);

  return (
    <button
      type="button"
      onClick={() => activa && onIr(href)}
      disabled={!activa}
      className={`text-left bg-white border rounded-xl px-4 py-3.5 flex flex-col gap-1.5
        transition-colors ${activa
          ? "border-neutral-200 hover:border-[#1A3557] cursor-pointer"
          : "border-dashed border-neutral-300 cursor-default"}`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-7 h-7 rounded-lg grid place-items-center text-[13px] shrink-0 ${tono}`}>
          {icono}
        </span>
        <h3 className="text-[13.5px] font-semibold text-neutral-900 flex-1">{titulo}</h3>
      </div>
      <p className="text-[12px] text-neutral-600 leading-relaxed">{descripcion}</p>
      <div className="flex items-center gap-2 flex-wrap mt-0.5">
        <span className={`text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5
          rounded border ${e.clase}`}>{e.texto}</span>
        {dato && <span className="text-[10.5px] text-neutral-400 tabular-nums">{dato}</span>}
      </div>
    </button>
  );
}

export default function HerramientasAsesor() {
  const [resumen, setResumen] = useState(null);

  // Los números salen del catálogo real, no escritos a mano: una tarjeta que
  // dice «47 universidades» cuando ya son cincuenta envejece mal.
  const cargar = useCallback(() => {
    boGET("/backoffice/universidades")
      .then((r) => {
        if (!r?.ok) return;
        const u = r.universidades || [];
        setResumen({
          universidades: u.length,
          comunidades: (r.facetas?.comunidades || []).length,
          masteres: u.reduce((n, x) => n + (x.masteres_cargados || 0), 0),
          sinUrl: u.filter((x) => !x.url_preinscripcion && !x.url_masteres).length,
          rotas: u.filter((x) => x.vigilancia === "error").length,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const ir = (href) => navigate(href);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Herramientas del asesor</h1>
        <p className="text-[12.5px] text-neutral-500">
          Lo que necesitas para atender un expediente, en un solo sitio.
        </p>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(15.5rem, 1fr))" }}>
        <Tarjeta
          icono="€" tono="bg-[#E8F5EE] text-[#1D6A4A]"
          titulo="Presupuesto personalizado"
          descripcion="Rellenas los datos del asesorado y sale el PDF con membrete, listo para mandar. Editable antes de generarlo."
          estado="pendiente"
        />

        <Tarjeta
          icono="◫" tono="bg-[#EEF2F8] text-[#1A3557]"
          titulo="Guías del asesorado"
          descripcion="Las mismas que ve él en su portal, para consultarlas mientras le atiendes."
          estado="lista"
          href="/backoffice/instructivos"
          onIr={ir}
        />

        <Tarjeta
          icono="⌕" tono="bg-[#F5EEF8] text-[#7D3C98]"
          titulo="Buscador de universidades"
          descripcion="Filtra por comunidad, ciudad, precio y área. Los datos ya están; falta la pantalla."
          estado="media"
          dato={resumen
            ? `${resumen.universidades} universidades · ${resumen.comunidades} comunidades`
            : null}
        />

        <Tarjeta
          icono="⇪" tono="bg-[#FEF3E7] text-[#B9770E]"
          titulo="Sistematizador de másteres"
          descripcion="Pegas el enlace de una universidad, se extrae su oferta y la revisas antes de cargarla. Sale también en CSV para Excel."
          estado="pendiente"
          dato={resumen ? `${resumen.masteres} másteres cargados` : null}
        />

        <Tarjeta
          icono="◷" tono="bg-[#FDEDEC] text-[#C0392B]"
          titulo="Tracker de universidades"
          descripcion="Las ventanas de preinscripción, curso a curso. Falta que avise de los plazos que se acercan."
          estado="media"
          href="/backoffice/tracker-universidades"
          onIr={ir}
        />

        <Tarjeta
          icono="≡" tono="bg-[#EEF2F8] text-[#1A3557]"
          titulo="Catálogo de másteres"
          descripcion="Ramas, subramas, comunidades y criterios de admisión. Es la fuente del informe del cliente."
          estado="lista"
          href="/backoffice/catalogo-masters"
          onIr={ir}
        />
      </div>

      {/* Lo que hay que atender antes de fiarse de lo de arriba. Va debajo y no
          en una tarjeta: no es una herramienta, es una deuda. */}
      {resumen && (resumen.rotas > 0 || resumen.sinUrl > 0) && (
        <div className="bg-white border border-amber-300 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-amber-700">
            Antes de fiarte del catálogo
          </p>
          <ul className="mt-1.5 space-y-1">
            {resumen.rotas > 0 && (
              <li className="text-[12px] text-neutral-700 leading-relaxed">
                <b>{resumen.rotas} universidades con la web caída o movida.</b> Su enlace ya
                no responde, así que nadie se enteraría si abren plazo.
              </li>
            )}
            {resumen.sinUrl > 0 && (
              <li className="text-[12px] text-neutral-700 leading-relaxed">
                <b>{resumen.sinUrl} sin enlace de preinscripción.</b> Sin URL no hay nada que
                vigilar.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
