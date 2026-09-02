// La mesa del asesor.
//
// Las piezas estaban repartidas —el presupuesto en un módulo, las guías en el
// portal del asesorado, el catálogo en otro sitio— y quien atiende tenía que
// saberse dónde vive cada cosa.
//
// La página no es una rejilla de accesos directos: arriba va lo que se mueve
// hoy —plazos que abren o cierran, presupuestos a medias, catálogo por
// completar— porque una herramienta que nadie sabe que tiene trabajo pendiente
// no se abre. Debajo, las herramientas agrupadas por lo que se hace con ellas:
// atender a una persona, o mantener el catálogo del que salen sus informes.
import { useEffect, useState } from "react";
import {
  BookOpen, Building2, CalendarClock, Receipt, Search, Settings2, Upload, ArrowRight,
} from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { useAuth } from "../context/AuthContext";
import {
  Pagina, Cabecera, Cuerpo, Seccion, TarjetaEnlace, Aviso, Chip, Boton, Esqueleto,
} from "../ui";

const saludo = () => {
  const h = new Date().getHours();
  return h < 13 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches";
};

const eur = (n) => `${Number(n || 0).toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;

const fechaCorta = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
};

const TIPO = {
  abre: { texto: "abre", tono: "verde" },
  cierra: { texto: "cierra", tono: "rojo" },
  resultados: { texto: "resultados", tono: "cielo" },
};

/** Un plazo de los próximos días: universidad, qué pasa y cuándo. */
function Plazo({ e }) {
  const t = TIPO[e.tipo] || TIPO.abre;
  const cuando = e.dias === 0 ? "hoy" : e.dias === 1 ? "mañana" : `en ${e.dias} días`;
  return (
    <button type="button" className="ase-fila" onClick={() => navigate("/backoffice/tracker-universidades")}>
      <span style={{
        width: 46, flexShrink: 0, textAlign: "center", lineHeight: 1.1,
        fontSize: 11, fontWeight: 700, color: "var(--muted)",
      }}>
        <span className="ase-num" style={{ display: "block", fontSize: 18, color: "var(--primary)", fontWeight: 800 }}>
          {fechaCorta(e.fecha).split(" ")[0]}
        </span>
        {fechaCorta(e.fecha).split(" ")[1]}
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{e.sigla}</span>
          <Chip tono={t.tono} punto>{t.texto}</Chip>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{cuando}</span>
        </span>
        <span style={{
          display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {e.fase} · {e.universidad}
        </span>
      </span>
    </button>
  );
}

const ESTADO = {
  borrador: { texto: "borrador", tono: "gris" },
  descargado: { texto: "descargado", tono: "petrol" },
  enviado: { texto: "enviado", tono: "verde" },
};

function PresupuestoReciente({ p }) {
  const e = ESTADO[p.estado] || ESTADO.borrador;
  return (
    <button type="button" className="ase-fila" onClick={() => navigate(`/backoffice/presupuesto?abrir=${p.id_presupuesto}`)}>
      <span className="ase-icono" data-tono="verde" style={{ width: 36, height: 36, borderRadius: 10 }}>
        <Receipt size={17} strokeWidth={2} />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.cliente || "Sin nombre"}
          </span>
          <Chip tono={e.tono}>{e.texto}</Chip>
        </span>
        <span className="ase-num" style={{ display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
          {p.numero ? `Nº ${p.numero} · ` : ""}{eur(p.total)}
        </span>
      </span>
      <ArrowRight size={16} className="ase-flecha" />
    </button>
  );
}

export default function HerramientasAsesor() {
  const { user } = useAuth();
  const [r, setR] = useState(null);
  const [plazos, setPlazos] = useState(null);
  const [presu, setPresu] = useState(null);

  useEffect(() => {
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
          // Trabajo pendiente de verdad: enlaces muertos y enlaces que apuntan
          // a la portada. Un 403 no es trabajo: es una web que no nos deja mirar.
          rotas: u.filter((x) => x.fallo?.hay_que_hacer_algo || x.vigila_portada).length,
          sinFechas: u.filter((x) => x.ventana?.estado === "sin fecha").length,
        });
      })
      .catch(() => {});
    boGET("/backoffice/tracker/proximos?dias=14")
      .then((res) => setPlazos(res?.ok ? (res.eventos || []).slice(0, 6) : []))
      .catch(() => setPlazos([]));
    boGET("/backoffice/presupuesto")
      .then((res) => setPresu(res?.ok ? res : { presupuestos: [], mes: {} }))
      .catch(() => setPresu({ presupuestos: [], mes: {} }));
  }, []);

  const faltan = r ? Math.max(0, r.ofertan - r.cargados) : 0;
  const nombre = (user?.nombre || "").split(" ")[0];

  const stats = [
    { n: plazos ? plazos.length : 0, l: "plazos en 14 días", tono: "cielo", onClick: () => navigate("/backoffice/tracker-universidades") },
    { n: r ? r.abiertas : 0, l: "con plazo abierto", tono: "ok", onClick: () => navigate("/backoffice/universidades") },
    { n: presu?.mes?.cuantos || 0, l: "presupuestos este mes", onClick: () => navigate("/backoffice/presupuesto") },
    { n: r ? r.cargados : 0, l: "másteres en catálogo", onClick: () => navigate("/backoffice/masteres") },
  ];

  return (
    <Pagina>
      <Cabecera
        eyebrow="Mesa del asesor"
        titulo={nombre ? `${saludo()}, ${nombre}.` : `${saludo()}.`}
        subtitulo="Lo que hace falta para atender un expediente, en un solo sitio: lo que se mueve hoy arriba, las herramientas debajo."
        acciones={
          <>
            <Boton tono="cta" icono={Receipt} onClick={() => navigate("/backoffice/presupuesto")}>
              Nuevo presupuesto
            </Boton>
            <Boton tono="cristal" icono={Search} onClick={() => navigate("/backoffice/masteres")}>
              Buscar máster
            </Boton>
          </>
        }
        stats={stats}
      />

      <Cuerpo>
        {/* Lo que reclama atención va arriba y con cifra grande: si esto queda
            escondido, nadie se entera de que el catálogo está a medias. */}
        {r && (r.rotas > 0 || faltan > 0 || r.sinFechas > 0) && (
          <div className="ase-rejilla-3 ase-anim">
            {faltan > 0 && (
              <Aviso tono="ambar" href="/backoffice/sistematizador"
                n={`~${faltan.toLocaleString("es-ES")}`}
                texto="másteres sin cargar. El informe no puede recomendar lo que no conoce." />
            )}
            {r.rotas > 0 && (
              <Aviso tono="rojo" href="/backoffice/universidades" n={r.rotas}
                texto="vigilan el enlace equivocado. Nadie se enteraría si abren plazo." />
            )}
            {r.sinFechas > 0 && (
              <Aviso tono="petrol" href="/backoffice/tracker-universidades" n={r.sinFechas}
                texto="sin fechas de postulación cargadas para este curso." />
            )}
          </div>
        )}

        <div className="ase-rejilla" style={{ alignItems: "start" }}>
          <Seccion
            titulo="Próximos plazos"
            subtitulo="Lo que abre, cierra o publica en los próximos catorce días"
            derecha={
              <Boton tono="fantasma" tam="sm" onClick={() => navigate("/backoffice/tracker-universidades")}>
                Ver el tracker <ArrowRight size={14} />
              </Boton>
            }
          >
            {plazos === null ? <Esqueleto filas={3} /> : plazos.length === 0 ? (
              <div className="ase-tarjeta ase-tarjeta-p" style={{ fontSize: 12.5, color: "var(--muted)" }}>
                Nada se mueve en dos semanas. Si falta alguna universidad por cargar, se verá en el tracker.
              </div>
            ) : (
              <div className="ase-lista ase-anim">
                {plazos.map((e) => <Plazo key={`${e.id_fase}-${e.tipo}`} e={e} />)}
              </div>
            )}
          </Seccion>

          <Seccion
            titulo="Últimos presupuestos"
            subtitulo={presu?.mes?.honorarios ? `${eur(presu.mes.honorarios)} presupuestados este mes` : "Quedan guardados mientras se escriben"}
            derecha={
              <Boton tono="fantasma" tam="sm" onClick={() => navigate("/backoffice/presupuesto?historial=1")}>
                Todos <ArrowRight size={14} />
              </Boton>
            }
          >
            {presu === null ? <Esqueleto filas={3} /> : presu.presupuestos.length === 0 ? (
              <div className="ase-tarjeta ase-tarjeta-p" style={{ fontSize: 12.5, color: "var(--muted)" }}>
                Todavía no hay ninguno. El primero que se escriba aparecerá aquí, aunque no se llegue a mandar.
              </div>
            ) : (
              <div className="ase-lista ase-anim">
                {presu.presupuestos.slice(0, 5).map((p) => <PresupuestoReciente key={p.id_presupuesto} p={p} />)}
              </div>
            )}
          </Seccion>
        </div>

        <Seccion titulo="Atender a un asesorado" subtitulo="Lo que se usa con una persona delante">
          <div className="ase-rejilla ase-anim">
            <TarjetaEnlace
              icono={<Receipt />} tono="verde" titulo="Presupuesto" href="/backoffice/presupuesto"
              chip={<Chip tono="verde">listo</Chip>}
              descripcion="Se rellena, se ve al lado y sale en PDF de dos páginas con las condiciones. Queda guardado y se manda al correo."
            />
            <TarjetaEnlace
              icono={<BookOpen />} tono="petrol" titulo="Guías" href="/backoffice/guias"
              chip={<Chip tono="verde">listo</Chip>}
              descripcion="Las mismas que ve él en su portal, interactivas: máster, estancia, modificatoria y apostilla."
            />
          </div>
        </Seccion>

        <Seccion titulo="El catálogo" subtitulo="Un solo catálogo visto desde cuatro sitios. De aquí sale el informe de másteres">
          <div className="ase-rejilla ase-anim">
            <TarjetaEnlace
              icono={<Search />} tono="verde" titulo="Buscador de másteres" href="/backoffice/masteres"
              descripcion="El catálogo final: cada máster con su universidad, su precio real y su plazo ya resueltos."
              dato={r ? `${r.cargados.toLocaleString("es-ES")} másteres buscables` : null}
            />
            <TarjetaEnlace
              icono={<Building2 />} tono="morado" titulo="Universidades" href="/backoffice/universidades"
              descripcion="La ficha de la que cuelgan los másteres: dónde está, qué cuesta el crédito, sus enlaces."
              dato={r ? `${r.universidades} universidades · ${r.comunidades} comunidades · ${r.abiertas} con plazo abierto` : null}
            />
            <TarjetaEnlace
              icono={<Upload />} tono="ambar" titulo="Sistematizador de másteres" href="/backoffice/sistematizador"
              descripcion="La puerta de carga: pegas la oferta de una universidad, se revisa y entra al catálogo."
            />
            <TarjetaEnlace
              icono={<CalendarClock />} tono="rojo" titulo="Tracker de postulaciones" href="/backoffice/tracker-universidades"
              descripcion="Cuándo abre cada universidad. Se cargan por comunidad y se duplica el curso entero."
            />
            <TarjetaEnlace
              icono={<Settings2 />} tono="petrol" titulo="Mantenimiento del catálogo" href="/backoffice/catalogo-masters"
              descripcion="Ramas, subramas, comunidades y criterios de admisión, uno a uno."
            />
          </div>
        </Seccion>
      </Cuerpo>
    </Pagina>
  );
}
