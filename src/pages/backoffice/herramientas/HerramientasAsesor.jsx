// Herramientas del asesor.
//
// Las piezas estaban repartidas —el presupuesto en un módulo, las guías en el
// portal del asesorado, el catálogo en otro sitio— y quien atiende tenía que
// saberse dónde vive cada cosa.
//
// La página no es una rejilla de accesos directos: arriba va lo que hay que
// atender hoy, porque una herramienta que nadie sabe que tiene trabajo pendiente
// no se abre. Debajo, las herramientas agrupadas por lo que se hace con ellas:
// atender a una persona, o mantener el catálogo del que salen sus informes.
import { useCallback, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";

const ESTADO = {
  lista:     { texto: "disponible",    clase: "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35" },
  media:     { texto: "a medias",      clase: "bg-[#FEF3E7] text-[#B9770E] border-amber-300/60" },
  pendiente: { texto: "por construir", clase: "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/25" },
};

function Herramienta({ icono, tono, titulo, descripcion, estado, dato, href }) {
  const e = ESTADO[estado] || ESTADO.pendiente;
  const activa = Boolean(href);

  return (
    <button
      type="button"
      onClick={() => activa && navigate(href)}
      disabled={!activa}
      className={`group text-left rounded-xl px-4 py-3.5 flex gap-3 transition-all border ${
        activa
          ? "bg-white border-neutral-200 hover:border-[#1A3557] hover:shadow-sm cursor-pointer"
          : "bg-neutral-50/60 border-dashed border-neutral-300 cursor-default"}`}
    >
      <span className={`w-9 h-9 rounded-lg grid place-items-center text-[15px] shrink-0 ${tono}`}>
        {icono}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span className={`text-[13.5px] font-semibold ${
            activa ? "text-neutral-900" : "text-neutral-500"}`}>{titulo}</span>
          <span className={`text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5
            rounded border ${e.clase}`}>{e.texto}</span>
        </span>
        <span className="block text-[12px] text-neutral-600 leading-relaxed mt-0.5">
          {descripcion}
        </span>
        {dato && (
          <span className="block text-[10.5px] text-neutral-400 tabular-nums mt-1">{dato}</span>
        )}
      </span>
      {activa && (
        <span className="self-center text-[15px] text-neutral-300 group-hover:text-[#1A3557]
          transition-colors shrink-0">→</span>
      )}
    </button>
  );
}

function Grupo({ titulo, subtitulo, children }) {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[.12em] font-mono text-neutral-400">
          {titulo}
        </h2>
        {subtitulo && <p className="text-[11.5px] text-neutral-400 mt-0.5">{subtitulo}</p>}
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(19rem, 100%), 1fr))" }}>
        {children}
      </div>
    </section>
  );
}

export default function HerramientasAsesor() {
  const [r, setR] = useState(null);

  const cargar = useCallback(() => {
    boGET("/backoffice/universidades")
      .then((res) => {
        if (!res?.ok) return;
        const u = res.universidades || [];
        setR({
          universidades: u.length,
          comunidades: (res.facetas?.comunidades || []).length,
          cargados: u.reduce((n, x) => n + (x.masteres_cargados || 0), 0),
          ofertan: u.reduce((n, x) => n + (x.num_masteres_total || 0), 0),
          abiertas: u.filter((x) => x.ventana?.estado === "abierta").length,
          rotas: u.filter((x) => x.vigilancia === "error").length,
          sinFechas: u.filter((x) => x.ventana?.estado === "sin fecha").length,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const faltan = r ? Math.max(0, r.ofertan - r.cargados) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Herramientas del asesor</h1>
        <p className="text-[12.5px] text-neutral-500">
          Lo que necesitas para atender un expediente, en un solo sitio.
        </p>
      </div>

      {/* Lo que reclama atención va arriba y con cifra grande: si esto queda
          escondido, nadie se entera de que el catálogo está a medias. */}
      {r && (r.rotas > 0 || faltan > 0 || r.sinFechas > 0) && (
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(13rem, 100%), 1fr))" }}>
          {faltan > 0 && (
            <button type="button" onClick={() => navigate("/backoffice/sistematizador")}
              className="text-left bg-white border border-amber-300 rounded-xl px-4 py-3
                hover:border-amber-500 transition-colors">
              <p className="text-[22px] font-bold text-amber-700 tabular-nums leading-none">
                ~{faltan.toLocaleString("es-ES")}
              </p>
              <p className="text-[11.5px] text-neutral-600 mt-1 leading-snug">
                másteres sin cargar. El informe no puede recomendar lo que no conoce.
              </p>
            </button>
          )}
          {r.rotas > 0 && (
            <button type="button" onClick={() => navigate("/backoffice/universidades")}
              className="text-left bg-white border border-red-300 rounded-xl px-4 py-3
                hover:border-red-500 transition-colors">
              <p className="text-[22px] font-bold text-red-600 tabular-nums leading-none">{r.rotas}</p>
              <p className="text-[11.5px] text-neutral-600 mt-1 leading-snug">
                universidades con la web caída. Nadie se enteraría si abren plazo.
              </p>
            </button>
          )}
          {r.sinFechas > 0 && (
            <button type="button" onClick={() => navigate("/backoffice/tracker-universidades")}
              className="text-left bg-white border border-neutral-200 rounded-xl px-4 py-3
                hover:border-[#1A3557] transition-colors">
              <p className="text-[22px] font-bold text-neutral-700 tabular-nums leading-none">
                {r.sinFechas}
              </p>
              <p className="text-[11.5px] text-neutral-600 mt-1 leading-snug">
                sin fechas de postulación cargadas para este curso.
              </p>
            </button>
          )}
        </div>
      )}

      <Grupo titulo="Atender a un asesorado" subtitulo="Lo que se usa con una persona delante">
        <Herramienta
          icono="€" tono="bg-[#E8F5EE] text-[#1D6A4A]"
          titulo="Presupuesto"
          descripcion="Se rellena, se ve al lado, y sale en PDF de dos páginas con las condiciones. Se descarga o se manda a su correo."
          estado="lista" href="/backoffice/presupuesto"
        />
        <Herramienta
          icono="◫" tono="bg-[#EEF2F8] text-[#1A3557]"
          titulo="Guías"
          descripcion="Las mismas que ve él en su portal, interactivas: máster, estancia, modificatoria y apostilla."
          estado="lista" href="/backoffice/guias"
        />
      </Grupo>

      <Grupo titulo="El catálogo"
        subtitulo="Un solo catálogo visto desde cuatro sitios. De aquí sale el informe de másteres">
        <Herramienta
          icono="≡" tono="bg-[#E8F5EE] text-[#1D6A4A]"
          titulo="Buscador de másteres"
          descripcion="El catálogo final: cada máster con su universidad, su precio real y su plazo ya resueltos."
          estado="lista" href="/backoffice/masteres"
          dato={r ? `${r.cargados.toLocaleString("es-ES")} másteres buscables` : null}
        />
        <Herramienta
          icono="⌕" tono="bg-[#F5EEF8] text-[#7D3C98]"
          titulo="Universidades"
          descripcion="La ficha de la que cuelgan los másteres: dónde está, qué cuesta el crédito, sus enlaces."
          estado="lista" href="/backoffice/universidades"
          dato={r ? `${r.universidades} universidades · ${r.comunidades} comunidades · ${r.abiertas} con plazo abierto` : null}
        />
        <Herramienta
          icono="⇪" tono="bg-[#FEF3E7] text-[#B9770E]"
          titulo="Sistematizador de másteres"
          descripcion="La puerta de carga: pegas la oferta de una universidad, se revisa y entra al catálogo."
          estado="lista" href="/backoffice/sistematizador"
        />
        <Herramienta
          icono="◷" tono="bg-[#FDEDEC] text-[#C0392B]"
          titulo="Tracker de postulaciones"
          descripcion="Cuándo abre cada universidad. Se cargan por comunidad y se duplica el curso entero."
          estado="lista" href="/backoffice/tracker-universidades"
        />
        <Herramienta
          icono="⚙" tono="bg-[#EEF2F8] text-[#1A3557]"
          titulo="Mantenimiento del catálogo"
          descripcion="Ramas, subramas, comunidades y criterios de admisión, uno a uno."
          estado="lista" href="/backoffice/catalogo-masters"
        />
      </Grupo>
    </div>
  );
}
