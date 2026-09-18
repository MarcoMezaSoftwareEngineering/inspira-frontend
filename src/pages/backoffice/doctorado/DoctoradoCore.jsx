// Doctorado en Inspira Core (18/09/2026): la guía del servicio para asesores
// y el catálogo INTERNO de doctorados (buscador, mapa, universidades con
// plazos y precios). La pestaña va en la URL (?vista=) para poder enlazarla.
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Map as MapaIcono, Search, CalendarClock, Wallet } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { Pagina, Cabecera, Cuerpo, Esqueleto } from "../ui";
import GuiaDoctorado from "./GuiaDoctorado";
import MapaDoctorados from "./MapaDoctorados";
import CatalogoDoctorados from "./CatalogoDoctorados";
import { UniversidadesDoctorado, PreciosDoctorado } from "./TablasDoctorado";
import "../../../styles/doctorado-core.css";

const VISTAS = [
  { k: "guia", t: "Guía del servicio", icono: <BookOpen size={15} /> },
  { k: "catalogo", t: "Catálogo", icono: <Search size={15} /> },
  { k: "mapa", t: "Mapa", icono: <MapaIcono size={15} /> },
  { k: "universidades", t: "Universidades y plazos", icono: <CalendarClock size={15} /> },
  { k: "precios", t: "Precios", icono: <Wallet size={15} /> },
];

function leerVista() {
  try { return new URLSearchParams(window.location.search).get("vista") || "guia"; } catch { return "guia"; }
}

export default function DoctoradoCore() {
  const [vista, setVista] = useState(leerVista);
  const [filtro, setFiltro] = useState({});
  const [version, setVersion] = useState(0);
  const [resumen, setResumen] = useState(null);
  const [opciones, setOpciones] = useState(null);
  const [unis, setUnis] = useState(null);
  const [precios, setPrecios] = useState(null);

  useEffect(() => {
    boGET("/backoffice/doctorados/resumen").then((r) => r?.ok && setResumen(r));
    boGET("/backoffice/doctorados/opciones").then((r) => r?.ok && setOpciones(r));
  }, []);
  useEffect(() => {
    if (vista === "universidades" && !unis) boGET("/backoffice/doctorados/universidades").then((r) => r?.ok && setUnis(r.universidades));
    if (vista === "precios" && !precios) boGET("/backoffice/doctorados/precios").then((r) => r?.ok && setPrecios(r));
  }, [vista, unis, precios]);

  const ir = useCallback((k) => {
    setVista(k);
    const url = new URL(window.location.href);
    url.searchParams.set("vista", k);
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const verCatalogo = useCallback((f) => {
    setFiltro(f || {});
    setVersion((v) => v + 1);
    ir("catalogo");
  }, [ir]);

  return (
    <Pagina>
      <Cabecera
        eyebrow="Servicio · Doctorado"
        titulo="Doctorado en España"
        subtitulo="La guía para vender y acompañar el doctorado, y el catálogo interno de programas oficiales. El asesorado recibe su selección, no el catálogo."
        stats={resumen ? [
          { n: resumen.total, l: "programas oficiales", tono: "cielo", onClick: () => verCatalogo({}) },
          { n: resumen.universidades, l: "universidades", onClick: () => ir("universidades") },
          { n: resumen.interuniversitarios, l: "interuniversitarios", onClick: () => verCatalogo({ inter: "1" }) },
        ] : undefined}
      />
      <Cuerpo>
        <div className="ase-dc-tabs" role="tablist">
          {VISTAS.map(({ k, t, icono }) => (
            <button key={k} type="button" role="tab" aria-selected={vista === k} data-on={vista === k ? "1" : "0"} onClick={() => ir(k)}>
              {icono}{t}
            </button>
          ))}
        </div>

        {vista === "guia" && <GuiaDoctorado onIr={ir} />}
        {vista === "catalogo" && <CatalogoDoctorados key={version} opciones={opciones} filtroInicial={filtro} />}
        {vista === "mapa" && (resumen ? <MapaDoctorados resumen={resumen} onVerCatalogo={verCatalogo} /> : <Esqueleto filas={4} alto={90} />)}
        {vista === "universidades" && (unis ? <UniversidadesDoctorado universidades={unis} onVerCatalogo={verCatalogo} /> : <Esqueleto filas={6} alto={48} />)}
        {vista === "precios" && (precios ? <PreciosDoctorado precios={precios} comunidades={opciones?.comunidades} /> : <Esqueleto filas={6} alto={48} />)}
      </Cuerpo>
    </Pagina>
  );
}
