// src/pages/panel/GuiaEstancia.jsx
//
// Guía de la estancia por estudios.
//
// Se organiza en las dos fases reales del proceso, y en ese orden, porque es
// el orden en que se viven: primero se viaja —como TURISTA, con todo lo que
// eso exige en frontera— y sólo después se tramita la estancia desde España.
// Mezclarlas es lo que hace que alguien llegue sin billete de vuelta
// confirmado y se quede en el mostrador.
//
// Lo marcado se guarda en el navegador de cada uno: es una lista de la compra
// personal, no un dato del expediente. Si cambia de dispositivo lo pierde, y
// no pasa nada — lo que vale de verdad es lo que sube al portal.
import { useCallback, useEffect, useMemo, useState } from "react";
import Icono from "../../components/common/Icono";
import IconoPaso from "../../components/common/IconoPaso";

const CLAVE = "inspira:guia-estancia";

/* ── Persistencia local del marcado ──────────────────────────────────────── */

function useMarcado() {
  // Se lee al inicializar, no en un efecto: leerlo despues obligaria a pintar
  // dos veces y la lista parpadearia al entrar.
  const [marcado, setMarcado] = useState(() => {
    try {
      const g = window.localStorage.getItem(CLAVE);
      return g ? JSON.parse(g) : {};
    } catch {
      return {}; // navegador sin almacenamiento: se usa sin memoria
    }
  });

  const alternar = useCallback((id) => {
    setMarcado((p) => {
      const n = { ...p, [id]: !p[id] };
      try { window.localStorage.setItem(CLAVE, JSON.stringify(n)); } catch { /* da igual */ }
      return n;
    });
  }, []);

  return [marcado, alternar];
}

/* ── Piezas ──────────────────────────────────────────────────────────────── */

function Marcable({ id, marcado, alternar, titulo, children }) {
  const hecho = Boolean(marcado[id]);
  return (
    <button type="button" onClick={() => alternar(id)} aria-pressed={hecho}
      className={`w-full text-left flex gap-3 rounded-xl border px-3.5 py-3 min-h-11 transition-colors ${
        hecho ? "border-verde/30 bg-verde-soft/60" : "border-linea bg-white hover:border-trazo"
      }`}>
      <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-md grid place-items-center
        border-2 transition-colors ${
        hecho ? "bg-verde border-verde text-white" : "border-trazo text-transparent"
      }`}><IconoPaso nombre="check" className="w-3.5 h-3.5" strokeWidth={3} /></span>
      <span className="min-w-0 flex-1">
        <span className={`block text-cuerpo font-semibold leading-snug ${
          hecho ? "text-verde-ink line-through decoration-verde/40" : "text-tinta"
        }`}>{titulo}</span>
        {children && (
          <span className="block text-cuerpo-sm text-tinta-2 leading-relaxed mt-0.5">{children}</span>
        )}
      </span>
    </button>
  );
}

function Seccion({ numero, icono, titulo, subtitulo, children, avance }) {
  const [abierto, setAbierto] = useState(true);
  return (
    <div className="bg-white border border-linea rounded-[20px] mb-3 overflow-hidden shadow-sm">
      <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}
        className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[60px] text-left hover:bg-fondo transition-colors">
        <span className="shrink-0 w-9 h-9 rounded-xl grid place-items-center text-white text-cuerpo font-bold bg-primary">{icono || numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-lectura font-bold text-primary leading-tight">{titulo}</span>
          {subtitulo && <span className="block text-meta text-tinta-2 mt-0.5">{subtitulo}</span>}
        </span>
        {avance && (
          <span className={`shrink-0 text-meta font-bold px-2 py-1 rounded-lg tabular-nums ${
            avance.hechos === avance.total ? "bg-verde-soft text-verde-ink" : "bg-neutro-soft text-neutro-ink"
          }`}>{avance.hechos}/{avance.total}</span>
        )}
        <svg className={`shrink-0 w-[18px] h-[18px] text-trazo transition-transform ${abierto ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {abierto && <div className="px-4 pb-4 pt-3 border-t border-linea space-y-2">{children}</div>}
    </div>
  );
}

function Aviso({ titulo, tono = "naranja", children }) {
  const tonos = {
    naranja: "bg-aviso-soft border-accent/30 text-aviso-ink",
    rojo: "bg-alto-soft border-alto/30 text-alto-ink",
    verde: "bg-verde-soft border-verde/30 text-verde-ink",
    azul: "bg-info-soft border-info-ink/20 text-info-ink",
  };
  return (
    <div className={`border rounded-2xl px-4 py-3 ${tonos[tono]}`}>
      {titulo && <p className="text-eyebrow font-bold uppercase mb-1">{titulo}</p>}
      <div className="text-cuerpo leading-relaxed">{children}</div>
    </div>
  );
}

/* ── Calculadora ─────────────────────────────────────────────────────────── */

/* Fuera del render: declarada dentro se recrearia en cada pasada. */
function CajaFecha({ titulo, dato, pie }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${
      !dato ? "border-linea bg-fondo"
        : dato.a_tiempo ? "border-verde/30 bg-verde-soft" : "border-alto/30 bg-alto-soft"
    }`}>
      <p className="text-eyebrow font-bold uppercase text-tinta-2">{titulo}</p>
      <p className={`font-serif text-display-2 font-bold leading-tight mt-1 tabular-nums ${
        !dato ? "text-trazo" : dato.a_tiempo ? "text-verde-ink" : "text-alto-ink"
      }`}>{dato ? dato.limite : "—"}</p>
      <p className="text-meta text-tinta-2 mt-0.5">
        {dato
          ? (dato.a_tiempo ? `quedan ${dato.dias_restantes} días` : `pasado hace ${Math.abs(dato.dias_restantes)} días`)
          : pie}
      </p>
    </div>
  );
}

function Calculadora() {
  const [llegada, setLlegada] = useState("");
  const [clases, setClases] = useState("");
  const [schengen, setSchengen] = useState(false);
  const [r, setR] = useState(null);

  useEffect(() => {
    // Sin fechas no se pregunta nada y tampoco se toca el estado: vaciar aqui
    // obligaria a repintar de mas. Lo que se ve se decide abajo, al pintar.
    if (!llegada && !clases) return;
    const q = new URLSearchParams();
    if (llegada) q.set("llegada", llegada);
    if (clases) q.set("clases", clases);
    if (schengen) q.set("schengen", "true");
    // El cálculo lo hace el servidor: es la misma regla que se aplica a tu
    // expediente, no una copia que pueda desviarse.
    fetch(`/api/estancia/plazos?${q}`)
      .then((x) => x.json())
      .then((j) => setR(j.ok ? j.plazos : null))
      .catch(() => setR(null));
  }, [llegada, clases, schengen]);

  const campo = "text-base sm:text-cuerpo text-tinta border border-trazo rounded-xl px-3.5 min-h-12 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-sky-dark/35 focus:border-sky-dark";

  // Si borra las fechas, deja de verse el resultado anterior.
  const res = (llegada || clases) ? r : null;

  return (
    <div className="rounded-2xl border border-linea overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-br from-noche via-primary to-primary-light">
        <p className="flex items-center gap-2 text-cuerpo font-bold text-white"><Icono nombre="calendario" size={16} />Calcula tus fechas</p>
        <p className="text-meta text-white/85 mt-0.5">
          Pon tus dos fechas y te digo cuándo hay que presentarlo.
        </p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-cuerpo-sm font-semibold text-tinta-2">
              Llegada a España
            </span>
            <input type="date" className={campo} value={llegada}
              onChange={(e) => setLlegada(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-cuerpo-sm font-semibold text-tinta-2">
              Inicio de clases
            </span>
            <input type="date" className={campo} value={clases}
              onChange={(e) => setClases(e.target.value)} />
          </label>
        </div>

        <label className="flex items-center gap-3 min-h-11 text-cuerpo text-tinta cursor-pointer">
          <input type="checkbox" className="w-5 h-5 shrink-0 accent-primary"
            checked={schengen} onChange={(e) => setSchengen(e.target.checked)} />
          <span>He estado en Europa en los últimos 180 días</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CajaFecha titulo="Presentar antes de" dato={res?.antelacion} pie="pon el inicio de clases" />
          <CajaFecha titulo="Tope desde tu llegada" dato={res?.tope} pie="pon tu fecha de llegada" />
        </div>

        {res?.avisos?.map((a, i) => (
          <div key={i} className={`rounded-2xl border px-4 py-3 text-cuerpo-sm leading-relaxed ${
            a.nivel === "alto" ? "bg-alto-soft border-alto/30 text-alto-ink"
              : a.nivel === "medio" ? "bg-aviso-soft border-accent/30 text-aviso-ink"
              : "bg-fondo border-linea text-tinta-2"
          }`}>{a.texto}</div>
        ))}

        <p className="text-meta text-tinta-2 leading-relaxed">
          Esta calculadora es orientativa y usa la misma regla que tu expediente. Lo que
          manda son las fechas que guardes en tus datos.
        </p>
      </div>
    </div>
  );
}

/* ── Contenido ───────────────────────────────────────────────────────────── */

const TURISTA = [
  ["t-pasaje", "Pasaje de ida y vuelta", "Con 15 a 20 días de diferencia. La vuelta tiene que estar confirmada, no vale solo la reserva: pueden pedírtela en el mostrador. Cómprala flexible para poder cancelarla."],
  ["t-hotel", "Reserva de alojamiento", "Mínimo un día, obligatoria en destino."],
  ["t-seguro", "Seguro de viaje", "Distinto del seguro de estudios. Se recomienda Seguro de Viaje Mundial."],
  ["t-itinerario", "Itinerario pautado", "Llevar el plan del viaje por escrito facilita mucho el paso por frontera."],
  ["t-solvencia", "Dinero para el viaje", "Acredita que puedes mantenerte los días que dices que vienes."],
];

const DOCS = [
  ["d-pasaporte", "Pasaporte completo", "Todas las páginas, de la primera a la última, tengan sellos o no, escaneadas en un solo PDF."],
  ["d-antecedentes", "Antecedentes penales", "De todos los países donde hayas residido los últimos 5 años. Apostillados y con menos de 3 meses."],
  ["d-admision", "Carta de admisión y matrícula", "Con el comprobante de pago de los estudios, o el seguro escolar si corresponde."],
  ["d-solvencia", "Solvencia económica", "Extracto de cuenta española con sello y firma del banco, fecha actualizada y saldo mínimo de 7.200 €."],
  ["d-seguro", "Seguro médico", "Póliza y condiciones particulares y generales, todo en un único PDF."],
  ["d-medico", "Certificado médico", "Preferiblemente español; vale del país de origen si cumple los requisitos."],
  ["d-entrada", "Entrada a España", "Tu tarjeta de embarque con la fecha de llegada."],
  ["d-firma", "Tu firma escaneada", "Sobre una hoja en blanco, para formularios y autorizaciones."],
];

const DATOS = [
  ["i-domicilio", "Dirección donde residirás en España", "Tiene que estar en la misma provincia donde estudias."],
  ["i-padres", "Nombre completo de tu padre y de tu madre", null],
];

export default function GuiaEstancia() {
  const [marcado, alternar] = useMarcado();
  const [fase, setFase] = useState("turista");

  const cuenta = useCallback(
    (lista) => ({ hechos: lista.filter(([id]) => marcado[id]).length, total: lista.length }),
    [marcado]
  );

  const total = useMemo(() => {
    const todos = [...TURISTA, ...DOCS, ...DATOS];
    return { hechos: todos.filter(([id]) => marcado[id]).length, total: todos.length };
  }, [marcado]);

  const pestana = (id, texto, sub) => (
    <button type="button" onClick={() => setFase(id)}
      className={`flex-1 rounded-2xl px-3.5 py-2.5 min-h-11 text-left transition-colors ${
        fase === id ? "bg-primary text-white" : "bg-transparent text-tinta-2 hover:bg-white"
      }`}>
      <span className="block text-cuerpo font-bold">
        {texto}
      </span>
      <span className={`block text-meta mt-0.5 ${fase === id ? "text-white/85" : "text-tinta-2"}`}>{sub}</span>
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Portada */}
      <div className="rounded-3xl px-6 py-6 mb-4 text-white bg-gradient-to-br from-noche via-primary to-primary-light">
        <p className="flex items-center gap-1.5 text-eyebrow font-bold uppercase text-accent mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />Guía del proceso
        </p>
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold leading-tight mb-3">
          Estancia por estudios
        </h1>
        <p className="text-lectura text-white/90 leading-relaxed max-w-[68ch] mb-4">
          Tiene los <b className="text-white">mismos efectos que un visado de estudios</b>. La
          diferencia está en cómo se hace: <b className="text-white">viajas como turista</b> y
          tramitas ya desde España.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full w-full rounded-full bg-accent origin-left transition-transform duration-500 motion-reduce:transition-none"
              style={{ transform: `scaleX(${total.total ? total.hechos / total.total : 0})` }} />
          </div>
          <span className="text-meta font-bold text-white/90 shrink-0 tabular-nums">
            {total.hechos}/{total.total}
          </span>
        </div>
        <p className="text-meta text-white/85 mt-1.5">
          Ve marcando lo que tengas listo. Se guarda en este navegador.
        </p>
      </div>

      {/* Las dos fases */}
      <div className="flex gap-1 mb-4 p-1 rounded-[20px] bg-neutro-soft">
        {pestana("turista", "1 · Viajas como turista", "Lo que necesitas en frontera")}
        {pestana("estancia", "2 · Tramitas la estancia", "Ya en España")}
      </div>

      {fase === "turista" && (
        <>
          <Aviso tono="rojo" titulo="Esto es lo que más falla">
            Entras a España <b>como turista</b>, y en frontera te van a pedir lo que se le pide
            a un turista. No basta con tener la carta de admisión: si no llevas la vuelta
            confirmada y el alojamiento, pueden no dejarte entrar. Y sin entrar, no hay
            estancia que tramitar.
          </Aviso>

          <div className="h-3" />

          <Seccion numero="1" icono={<Icono nombre="avion" size={18} />} titulo="Para pasar la frontera"
            subtitulo="Llévalo impreso y a mano, no solo en el móvil"
            avance={cuenta(TURISTA)}>
            {TURISTA.map(([id, t, d]) => (
              <Marcable key={id} id={id} marcado={marcado} alternar={alternar} titulo={t}>{d}</Marcable>
            ))}
          </Seccion>

          <Seccion numero="2" icono={<Icono nombre="reloj" size={18} />} titulo="Tus 90 días empiezan al entrar"
            subtitulo="Y de ahí sale tu fecha tope">
            <Aviso tono="rojo" titulo="No es el último día de los 90">
              La entrada como turista te da <b>90 días</b>, pero tu solicitud tiene que estar
              presentada <b>como máximo dos meses antes de que se cumplan</b>. No dentro de
              los 90: dos meses antes de que terminen.
              <br /><br />
              Si entras el <b>1 de marzo</b>, tus 90 días acaban el <b>30 de mayo</b>, así que
              tu fecha tope para presentar es el <b>30 de marzo</b>. Por eso tu fecha de
              llegada no es un dato cualquiera: es la que fija tu plazo.
            </Aviso>
            <Aviso tono="rojo" titulo="Si ya estuviste en Europa">
              Schengen cuenta 90 días dentro de cualquier ventana de 180. Si viajaste hace
              poco, <b>no empiezas de cero</b>. Díselo a tu asesor antes de comprar nada.
            </Aviso>
            <div className="pt-1"><Calculadora /></div>
          </Seccion>
        </>
      )}

      {fase === "estancia" && (
        <>
          <Seccion numero="3" icono={<IconoPaso nombre="upload" className="w-[18px] h-[18px]" />} titulo="Documentos que subes tú"
            subtitulo="Cada uno con su requisito: extranjería devuelve los que no cumplen"
            avance={cuenta(DOCS)}>
            {DOCS.map(([id, t, d]) => (
              <Marcable key={id} id={id} marcado={marcado} alternar={alternar} titulo={t}>{d}</Marcable>
            ))}
          </Seccion>

          <Seccion numero="4" icono={<Icono nombre="documento" size={18} />} titulo="Datos que nos tienes que dar"
            avance={cuenta(DATOS)}>
            {DATOS.map(([id, t, d]) => (
              <Marcable key={id} id={id} marcado={marcado} alternar={alternar} titulo={t}>{d}</Marcable>
            ))}
            <Aviso tono="rojo" titulo="Ojo con la dirección">
              Tienes que vivir en la <b>misma provincia</b> donde estudias. Si estudias en
              Sevilla, tu domicilio tiene que estar en Sevilla: la solicitud se presenta ante
              la oficina de extranjería de esa jurisdicción, y si no coincide la inadmiten.
            </Aviso>
          </Seccion>

          <Seccion numero="5" icono={<Icono nombre="maletin" size={18} />} titulo="Lo que preparamos nosotros"
            subtitulo="No tienes que hacer nada con esto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {["Formulario EX-00", "Carta de representación", "Tasa 790"].map((x) => (
                <div key={x} className="rounded-xl border border-linea bg-info-soft px-3 py-2.5">
                  <p className="text-cuerpo-sm font-semibold text-primary">{x}</p>
                </div>
              ))}
            </div>
            <Aviso tono="azul" titulo="Y si hace falta">
              <b>Declaración jurada de plazo</b>, si la solicitud se presenta con menos de dos
              meses de antelación al inicio de clases.<br />
              <b>Declaración jurada a mejor resolver</b>, si extranjería pide alguna aclaración.
            </Aviso>
          </Seccion>

          <Seccion numero="6" icono={<Icono nombre="campana" size={18} />} titulo="Avísanos cada vez que subas algo"
            subtitulo="Es lo que evita que un documento caduque esperando">
            <p className="text-lectura text-tinta leading-relaxed max-w-[68ch]">
              Cuando actualices tus documentos, dínoslo para programar la revisión. Te diremos
              si está aprobado o qué hay que corregir, y lo verás en el apartado de documentos
              de tu portal.
            </p>
          </Seccion>

          <Seccion numero="7" icono={<Icono nombre="lupa" size={18} />} titulo="Sigue tu expediente"
            subtitulo="Cuando ya esté presentado">
            <p className="text-lectura text-tinta leading-relaxed max-w-[68ch]">
              Podrás consultarlo con tres datos: <b>número de expediente</b>, <b>fecha de
              ingreso</b> y tu <b>año de nacimiento</b>. Te los damos nosotros.
            </p>
            <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 min-h-[56px] border border-linea
                hover:bg-info-soft transition-colors no-underline">
              <span className="shrink-0 w-9 h-9 rounded-xl grid place-items-center bg-info-soft text-primary-light"><Icono nombre="globo" size={18} /></span>
              <span className="min-w-0">
                <span className="block text-cuerpo font-bold text-primary">
                  Consulta de expedientes de extranjería
                </span>
                <span className="block text-meta text-tinta-2 truncate">
                  infoext2.delegaciondelgobierno.gob.es
                </span>
              </span>
            </a>
            <Aviso tono="azul">
              Si llega un requerimiento o la resolución, <b>te avisamos por correo</b> y lo
              tendrás en el apartado de Extranjería.
            </Aviso>
          </Seccion>

          <Seccion numero="8" icono={<Icono nombre="casa" size={18} />} titulo="Después de la resolución"
            subtitulo="El último paso">
            <p className="text-lectura text-tinta leading-relaxed max-w-[68ch]">
              Con la resolución favorable toca el <b>empadronamiento</b>, que es lo que
              necesitas para tramitar tu <b>TIE</b> (Tarjeta de Identidad de Extranjero).
            </p>
          </Seccion>
        </>
      )}

      <div className="rounded-[20px] px-5 py-4 text-white text-center mt-4 bg-gradient-to-br from-noche via-primary to-primary-light">
        <p className="text-cuerpo font-semibold mb-1">El trámite tarda de 1 a 3 meses</p>
        <p className="text-cuerpo-sm text-white/90 leading-relaxed">
          Varía según la carga de la Oficina de Extranjería y la complejidad del expediente.
          Estamos contigo en cada paso.
        </p>
      </div>
    </div>
  );
}
