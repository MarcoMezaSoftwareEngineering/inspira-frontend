// src/pages/servicios/ExploradorServicios.jsx
// Buscador + filtros por tema sobre el catálogo. Da una lectura inmediata de
// cómo se reparten los servicios y permite llegar a uno concreto sin scroll.
import { useMemo, useState } from "react";
import { CATEGORIAS, TODOS_SERVICIOS, hrefServicio } from "../../config/servicios";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";

const ICONO_CAT = {
  extranjeria: "pasaporte",
  "tramites-espana": "huella",
  educativa: "birrete",
};

// Temas transversales: cruzan categorías, que es justo lo que no se ve en
// un listado plano.
const TEMAS = [
  { id: "estudiar", label: "Estudiar", icono: "birrete", ids: ["master-espana","grado-espana","formacion-profesional","master-paises-bajos","master-italia","master-francia","becas-espana","visa-estudios","estancia-estudios","prorroga-estancia"] },
  { id: "trabajar", label: "Trabajar", icono: "maletin", ids: ["visado-pac","nomada-digital","modificatoria-residente","seguridad-social","residencia-doctorado"] },
  { id: "quedarse", label: "Quedarse", icono: "bandera", ids: ["nacionalidad","arraigos","modificatorias","prueba-cervantes","no-lucrativa","permiso-retorno"] },
  { id: "documentos", label: "Documentos", icono: "documento", ids: ["homologacion-bachillerato","homologacion-titulo","apostillas","diligencias-peru","poderes","certificado-digital","seguro-medico"] },
  { id: "citas", label: "Citas y gestiones", icono: "calendario", ids: ["tie","empadronamiento","certificado-ue","canje-dgt","carta-invitacion","pasajes"] },
  { id: "problemas", label: "Tengo un problema", icono: "balanza", ids: ["recurso-reposicion","modificatorias","arraigos"] },
];

const normalizar = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function ExploradorServicios() {
  const [q, setQ] = useState("");
  const [tema, setTema] = useState(null);
  const [cat, setCat] = useState(null);

  const resultados = useMemo(() => {
    let lista = TODOS_SERVICIOS;
    if (cat) lista = lista.filter((s) => s.categoriaId === cat);
    if (tema) {
      const ids = TEMAS.find((t) => t.id === tema)?.ids || [];
      lista = lista.filter((s) => ids.includes(s.id));
    }
    if (q.trim().length > 1) {
      const n = normalizar(q);
      lista = lista.filter(
        (s) => normalizar(s.nombre).includes(n) || normalizar(s.resumen).includes(n)
      );
    }
    return lista;
  }, [q, tema, cat]);

  const filtrando = !!(q.trim().length > 1 || tema || cat);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const limpiar = () => {
    setQ("");
    setTema(null);
    setCat(null);
  };

  return (
    <section className="explorador">
      <div className="explorador-inner">
        {/* Reparto por categoría */}
        <div className="exp-cats">
          {CATEGORIAS.map((c) => {
            const total = c.grupos.reduce((n, g) => n + g.servicios.length, 0);
            const activa = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(activa ? null : c.id)}
                className={`exp-cat${activa ? " activa" : ""}`}
              >
                <span className="exp-cat-icon">
                  <Icono nombre={ICONO_CAT[c.id]} size={20} />
                </span>
                <span className="exp-cat-txt">
                  <b>{c.titulo}</b>
                  <small>
                    {total} servicios · {c.grupos.length} bloques
                  </small>
                </span>
                <span className="exp-cat-n">{total}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="exp-buscador">
          <Icono nombre="brujula" size={18} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca tu trámite: homologación, TIE, nómada digital…"
            aria-label="Buscar servicio"
          />
          {filtrando && (
            <button type="button" onClick={limpiar} className="exp-limpiar">
              Limpiar
            </button>
          )}
        </div>

        {/* Temas transversales */}
        <div className="exp-temas">
          <span className="exp-temas-label">¿Qué quieres hacer?</span>
          {TEMAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTema(tema === t.id ? null : t.id)}
              className={`exp-tema${tema === t.id ? " activo" : ""}`}
            >
              <Icono nombre={t.icono} size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Resultados */}
        {filtrando && (
          <div className="exp-resultados">
            <p className="exp-contador">
              {resultados.length === 0
                ? "No encontramos servicios con ese criterio."
                : `${resultados.length} servicio${resultados.length === 1 ? "" : "s"} encontrado${resultados.length === 1 ? "" : "s"}`}
            </p>
            <div className="exp-grid">
              {resultados.map((s) => (
                <a
                  key={s.id}
                  href={hrefServicio(s)}
                  onClick={(e) => go(e, hrefServicio(s))}
                  className="exp-item"
                >
                  <b>{s.nombre}</b>
                  <small>{s.categoria}</small>
                  <span className="arr" aria-hidden>→</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
