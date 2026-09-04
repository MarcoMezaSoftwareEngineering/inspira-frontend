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

const AZUL = "#013446";
const NARANJA = "#E8730C";
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
    <button type="button" onClick={() => alternar(id)}
      className={`w-full text-left flex gap-3 rounded-xl border px-3.5 py-3 transition-all ${
        hecho ? "border-[#1D6A4A]/30 bg-[#E8F5EE]/50" : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}>
      <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-md grid place-items-center text-[11px]
        font-bold border-2 transition-colors ${
        hecho ? "bg-[#1D6A4A] border-[#1D6A4A] text-white" : "border-neutral-300 text-transparent"
      }`}>✓</span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[13.5px] font-semibold leading-snug ${
          hecho ? "text-[#14532d] line-through decoration-[#1D6A4A]/40" : "text-neutral-800"
        }`}>{titulo}</span>
        {children && (
          <span className="block text-[12px] text-neutral-500 leading-relaxed mt-0.5">{children}</span>
        )}
      </span>
    </button>
  );
}

function Seccion({ numero, icono, titulo, subtitulo, children, avance }) {
  const [abierto, setAbierto] = useState(true);
  return (
    <div className="bg-white border border-primary/12 rounded-2xl mb-3 overflow-hidden shadow-sm">
      <button type="button" onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50/60">
        <span className="shrink-0 w-9 h-9 rounded-xl grid place-items-center text-white text-[14px] font-bold"
          style={{ background: AZUL }}>{icono || numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-[15px] font-bold text-primary leading-tight">{titulo}</span>
          {subtitulo && <span className="block text-[11.5px] text-neutral-500 mt-0.5">{subtitulo}</span>}
        </span>
        {avance && (
          <span className={`shrink-0 text-[11px] font-bold px-2 py-1 rounded-lg ${
            avance.hechos === avance.total ? "bg-[#E8F5EE] text-[#14532d]" : "bg-neutral-100 text-neutral-500"
          }`}>{avance.hechos}/{avance.total}</span>
        )}
        <span className="shrink-0 text-neutral-300 text-[12px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && <div className="px-4 pb-4 pt-1 border-t border-neutral-100 space-y-2">{children}</div>}
    </div>
  );
}

function Aviso({ titulo, tono = "naranja", children }) {
  const tonos = {
    naranja: "bg-orange-50 border-orange-300 text-orange-900",
    rojo: "bg-red-50 border-red-300 text-red-900",
    verde: "bg-[#E8F5EE] border-[#1D6A4A]/30 text-[#14532d]",
    azul: "bg-[#EEF2F8] border-primary/20 text-primary",
  };
  return (
    <div className={`border rounded-xl px-3.5 py-3 ${tonos[tono]}`}>
      {titulo && <p className="text-[10.5px] font-bold uppercase tracking-wider mb-1">{titulo}</p>}
      <div className="text-[12.5px] leading-relaxed">{children}</div>
    </div>
  );
}

/* ── Calculadora ─────────────────────────────────────────────────────────── */

/* Fuera del render: declarada dentro se recrearia en cada pasada. */
function CajaFecha({ titulo, dato, pie }) {
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${
      !dato ? "border-neutral-200 bg-neutral-50"
        : dato.a_tiempo ? "border-[#1D6A4A]/30 bg-[#E8F5EE]" : "border-red-300 bg-red-50"
    }`}>
      <p className="text-[10px] font-bold uppercase tracking-wider font-mono text-neutral-500">{titulo}</p>
      <p className={`text-[20px] font-bold leading-tight mt-0.5 ${
        !dato ? "text-neutral-300" : dato.a_tiempo ? "text-[#14532d]" : "text-red-700"
      }`}>{dato ? dato.limite : "—"}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5">
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

  const campo = "text-[13px] border border-neutral-300 rounded-lg px-3 py-2 bg-white " +
    "focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]";

  // Si borra las fechas, deja de verse el resultado anterior.
  const res = (llegada || clases) ? r : null;

  return (
    <div className="rounded-2xl border border-primary/15 overflow-hidden">
      <div className="px-4 py-3" style={{ background: "linear-gradient(135deg,#013446,#013446)" }}>
        <p className="text-[13px] font-bold text-white">🗓️ Calcula tus fechas</p>
        <p className="text-[11.5px] text-white/70 mt-0.5">
          Pon tus dos fechas y te digo cuándo hay que presentarlo.
        </p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400">
              Llegada a España
            </span>
            <input type="date" className={campo} value={llegada}
              onChange={(e) => setLlegada(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400">
              Inicio de clases
            </span>
            <input type="date" className={campo} value={clases}
              onChange={(e) => setClases(e.target.value)} />
          </label>
        </div>

        <label className="flex items-start gap-2 text-[12.5px] text-neutral-700">
          <input type="checkbox" className="mt-0.5 accent-[#1D6A4A]"
            checked={schengen} onChange={(e) => setSchengen(e.target.checked)} />
          <span>He estado en Europa en los últimos 180 días</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CajaFecha titulo="Presentar antes de" dato={res?.antelacion} pie="pon el inicio de clases" />
          <CajaFecha titulo="Tope desde tu llegada" dato={res?.tope} pie="pon tu fecha de llegada" />
        </div>

        {res?.avisos?.map((a, i) => (
          <div key={i} className={`rounded-xl border px-3.5 py-2.5 text-[12px] leading-relaxed ${
            a.nivel === "alto" ? "bg-red-50 border-red-300 text-red-800"
              : a.nivel === "medio" ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-neutral-50 border-neutral-200 text-neutral-500"
          }`}>{a.texto}</div>
        ))}

        <p className="text-[11px] text-neutral-400 leading-relaxed">
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
      className={`flex-1 rounded-xl px-3 py-2.5 text-left transition-all border ${
        fase === id ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
      }`}>
      <span className={`block text-[13px] font-bold ${fase === id ? "text-primary" : "text-neutral-500"}`}>
        {texto}
      </span>
      <span className="block text-[11px] text-neutral-400 mt-0.5">{sub}</span>
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Portada */}
      <div className="rounded-2xl px-6 py-6 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #013446 0%, #013446 100%)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60 font-mono mb-2">
          Guía del proceso
        </p>
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold leading-tight mb-3">
          Estancia por estudios
        </h1>
        <p className="text-[13.5px] text-white/80 leading-relaxed max-w-xl mb-4">
          Tiene los <b className="text-white">mismos efectos que un visado de estudios</b>. La
          diferencia está en cómo se hace: <b className="text-white">viajas como turista</b> y
          tramitas ya desde España.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-[#F5C842] transition-all"
              style={{ width: `${total.total ? (total.hechos / total.total) * 100 : 0}%` }} />
          </div>
          <span className="text-[12px] font-bold text-white/80 shrink-0">
            {total.hechos}/{total.total}
          </span>
        </div>
        <p className="text-[11px] text-white/50 mt-1.5">
          Ve marcando lo que tengas listo. Se guarda en este navegador.
        </p>
      </div>

      {/* Las dos fases */}
      <div className="flex gap-2 mb-4 p-1.5 rounded-2xl bg-[#EEF2F8]">
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

          <Seccion numero="1" icono="✈️" titulo="Para pasar la frontera"
            subtitulo="Llévalo impreso y a mano, no solo en el móvil"
            avance={cuenta(TURISTA)}>
            {TURISTA.map(([id, t, d]) => (
              <Marcable key={id} id={id} marcado={marcado} alternar={alternar} titulo={t}>{d}</Marcable>
            ))}
          </Seccion>

          <Seccion numero="2" icono="⏱️" titulo="Tus 90 días empiezan al entrar"
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
          <Seccion numero="3" icono="📤" titulo="Documentos que subes tú"
            subtitulo="Cada uno con su requisito: extranjería devuelve los que no cumplen"
            avance={cuenta(DOCS)}>
            {DOCS.map(([id, t, d]) => (
              <Marcable key={id} id={id} marcado={marcado} alternar={alternar} titulo={t}>{d}</Marcable>
            ))}
          </Seccion>

          <Seccion numero="4" icono="📝" titulo="Datos que nos tienes que dar"
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

          <Seccion numero="5" icono="📋" titulo="Lo que preparamos nosotros"
            subtitulo="No tienes que hacer nada con esto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {["Formulario EX-00", "Carta de representación", "Tasa 790"].map((x) => (
                <div key={x} className="rounded-xl border border-primary/15 bg-[#EEF2F8] px-3 py-2.5">
                  <p className="text-[12.5px] font-semibold text-primary">{x}</p>
                </div>
              ))}
            </div>
            <Aviso tono="azul" titulo="Y si hace falta">
              <b>Declaración jurada de plazo</b>, si la solicitud se presenta con menos de dos
              meses de antelación al inicio de clases.<br />
              <b>Declaración jurada a mejor resolver</b>, si extranjería pide alguna aclaración.
            </Aviso>
          </Seccion>

          <Seccion numero="6" icono="🔔" titulo="Avísanos cada vez que subas algo"
            subtitulo="Es lo que evita que un documento caduque esperando">
            <p className="text-[13px] text-neutral-700 leading-relaxed">
              Cuando actualices tus documentos, dínoslo para programar la revisión. Te diremos
              si está aprobado o qué hay que corregir, y lo verás en el apartado de documentos
              de tu portal.
            </p>
          </Seccion>

          <Seccion numero="7" icono="🔎" titulo="Sigue tu expediente"
            subtitulo="Cuando ya esté presentado">
            <p className="text-[13px] text-neutral-700 leading-relaxed">
              Podrás consultarlo con tres datos: <b>número de expediente</b>, <b>fecha de
              ingreso</b> y tu <b>año de nacimiento</b>. Te los damos nosotros.
            </p>
            <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 border border-primary/20
                hover:bg-[#EEF2F8] transition-colors no-underline">
              <span className="text-lg">🌐</span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-bold text-primary">
                  Consulta de expedientes de extranjería
                </span>
                <span className="block text-[11px] text-neutral-500 truncate">
                  infoext2.delegaciondelgobierno.gob.es
                </span>
              </span>
            </a>
            <Aviso tono="azul">
              Si llega un requerimiento o la resolución, <b>te avisamos por correo</b> y lo
              tendrás en el apartado de Extranjería.
            </Aviso>
          </Seccion>

          <Seccion numero="8" icono="🏠" titulo="Después de la resolución"
            subtitulo="El último paso">
            <p className="text-[13px] text-neutral-700 leading-relaxed">
              Con la resolución favorable toca el <b>empadronamiento</b>, que es lo que
              necesitas para tramitar tu <b>TIE</b> (Tarjeta de Identidad de Extranjero).
            </p>
          </Seccion>
        </>
      )}

      <div className="rounded-2xl px-5 py-4 text-white text-center mt-4"
        style={{ background: "linear-gradient(135deg, #013446 0%, #013446 100%)" }}>
        <p className="text-[13px] font-semibold mb-1">El trámite tarda de 1 a 3 meses</p>
        <p className="text-[12px] text-white/70 leading-relaxed">
          Varía según la carga de la Oficina de Extranjería y la complejidad del expediente.
          Estamos contigo en cada paso.
        </p>
      </div>
    </div>
  );
}
