// Guía de la modificación de estancia por estudios a residencia y trabajo.
//
// El contenido sale de la guía oficial de tramitación del procedimiento
// (versión de 26.05.2026, adaptada al Real Decreto 1155/2024) y del impreso
// EX-03. No es un resumen de andar por casa: cada plazo y cada requisito está
// donde está porque lo dice esa hoja, y si Extranjería la cambia hay que
// cambiarla aquí.
//
// La guía NO se ata a ninguna comunidad: el trámite se presenta ante
// Extranjería, y la oficina concreta depende de dónde viva el asesorado. Decir
// «Cataluña» aquí confundiría a quien no está allí.
//
// Dos avisos que no se pueden suavizar y por eso van en rojo:
//
//  · El plazo es una ventana, no una fecha tope. Se abre dos meses ANTES de que
//    termine la estancia y se cierra tres meses DESPUÉS. Presentar antes de que
//    se abra es tan inútil como presentar tarde, y es el error que más se
//    repite porque nadie espera que existan plazos con principio.
//
//  · Hay que haber terminado la formación ENTERA. No basta con ir aprobando:
//    si falta una asignatura, el expediente se cae.
import { useCallback, useState } from "react";

const AZUL = "#013446";
const CLAVE = "inspira:guia-modificatoria";

/* ── Persistencia local del marcado ──────────────────────────────────────── */

function useMarcado() {
  const [marcado, setMarcado] = useState(() => {
    try {
      const g = window.localStorage.getItem(CLAVE);
      return g ? JSON.parse(g) : {};
    } catch {
      return {};
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

/* ── La ventana de presentación ──────────────────────────────────────────── */


function sumarMeses(iso, meses) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const dia = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + meses);
  // Si el mes destino es más corto, JavaScript se pasa al siguiente: 31 de
  // enero + 1 mes daría 3 de marzo. Se retrocede al último día del mes bueno.
  if (d.getUTCDate() !== dia) d.setUTCDate(0);
  return d;
}

const enLetra = (d) => (d
  ? d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })
  : null);

function diasHasta(d) {
  if (!d) return null;
  const hoy = new Date();
  const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((d.getTime() - hoyUTC) / 86400000);
}

/**
 * La ventana de presentación.
 *
 * No es «antes de tal día»: se abre dos meses antes del hecho que la dispara y
 * se cierra tres meses después. Presentar antes de que se abra se inadmite
 * igual que presentar tarde, y eso no lo espera nadie.
 */
function Ventana() {
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState("titulo");

  const desde = sumarMeses(fecha, -2);
  const hasta = sumarMeses(fecha, 3);
  const faltanAbrir = diasHasta(desde);
  const faltanCerrar = diasHasta(hasta);

  const estado = !fecha ? null
    : faltanAbrir > 0 ? "pronto"
    : faltanCerrar < 0 ? "tarde"
    : "abierta";

  return (
    <div className="rounded-2xl border border-primary/15 bg-[#EEF2F8]/40 p-4">
      <p className="font-serif text-[14px] font-bold text-primary mb-0.5">
        ¿Cuándo puedo presentar?
      </p>
      <p className="text-[12px] text-neutral-600 leading-relaxed mb-3">
        Pon la fecha y te decimos si tu ventana ya está abierta.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <label className="flex-1 min-w-0">
          <span className="block text-[11.5px] font-medium text-neutral-600 mb-1">¿Qué pasa primero?</span>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)}
            className="w-full text-[13px] border border-neutral-300 rounded-lg px-3 py-2 bg-white">
            <option value="titulo">Termino mis estudios y obtengo el título</option>
            <option value="estancia">Se me vence la estancia por estudios</option>
          </select>
        </label>
        <label className="sm:w-48">
          <span className="block text-[11.5px] font-medium text-neutral-600 mb-1">¿Qué día?</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="w-full text-[13px] border border-neutral-300 rounded-lg px-3 py-2 bg-white" />
        </label>
      </div>

      {fecha && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-neutral-200 bg-white px-3.5 py-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Se abre el
              </p>
              <p className="text-[17px] font-bold text-primary leading-tight mt-0.5">
                {enLetra(desde)}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {faltanAbrir > 0 ? `faltan ${faltanAbrir} días` : "ya está abierta"}
              </p>
            </div>
            <div className={`rounded-xl border px-3.5 py-3 ${
              estado === "tarde" ? "border-red-300 bg-red-50" : "border-[#1D6A4A]/30 bg-[#E8F5EE]"
            }`}>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Se cierra el
              </p>
              <p className={`text-[17px] font-bold leading-tight mt-0.5 ${
                estado === "tarde" ? "text-red-700" : "text-[#14532d]"
              }`}>{enLetra(hasta)}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {faltanCerrar >= 0 ? `quedan ${faltanCerrar} días` : `pasó hace ${Math.abs(faltanCerrar)} días`}
              </p>
            </div>
          </div>

          <div className="mt-2.5">
            {estado === "pronto" && (
              <Aviso tono="azul" titulo="Todavía no">
                Tu ventana aún no se abre. Presentar antes de tiempo <b>no adelanta nada</b>:
                lo inadmiten igual. Aprovecha estos días para reunir los documentos, sobre
                todo los que dependen de tu empresa.
              </Aviso>
            )}
            {estado === "abierta" && (
              <Aviso tono="verde" titulo="Ventana abierta">
                Ya se puede presentar. No lo dejes para el final: si falta algún documento
                de la empresa, conseguirlo puede tomar semanas y el plazo no se detiene.
              </Aviso>
            )}
            {estado === "tarde" && (
              <Aviso tono="rojo" titulo="Fuera de plazo">
                La ventana ya se cerró. <b>Escríbenos hoy mismo</b>: según tu caso puede haber
                otra vía, pero hay que mirarlo cuanto antes.
              </Aviso>
            )}
          </div>
        </>
      )}

      <p className="text-[11px] text-neutral-500 leading-relaxed mt-3">
        La ventana va de <b>dos meses antes</b> a <b>tres meses después</b> de que termines tus
        estudios o se te venza la estancia, lo que pase primero. Es un cálculo orientativo: la
        fecha que vale es la que confirma tu asesor con tu expediente delante.
      </p>
    </div>
  );
}

/* ── Contenido ───────────────────────────────────────────────────────────── */

const REQUISITOS_TUYOS = [
  ["req-titulo", "Haber terminado tus estudios por completo",
    "No basta con ir aprobando: tiene que estar terminada toda la formación por la que te dieron la estancia, con el título o certificado en la mano."],
  ["req-beca", "No haber sido becado en programas de cooperación",
    "Si tuviste una beca de cooperación al desarrollo o de acción humanitaria —española o de tu país— hay que acreditarlo. Solo se exige si tu estancia se concedió bajo el reglamento nuevo (RD 1155/2024)."],
  ["req-orden", "No tener orden de expulsión ni prohibición de entrada",
    "Ni figurar como amenaza para el orden público. Se comprueba con tus antecedentes en España y un informe policial."],
  ["req-tasa", "Pagar la tasa de residencia (modelo 790, código 052)",
    "Solo se puede pagar si ya tienes NIE. La de trabajo se paga aparte y esa la verifican ellos solos, sin que haya que adjuntar nada."],
];

const REQUISITOS_EMPRESA = [
  ["emp-contrato", "Contrato firmado por las dos partes",
    "Sin tachones ni anotaciones a mano, con las dos firmas visibles. Si la empresa tiene administradores mancomunados, lo firman todos."],
  ["emp-duracion", "Indefinido o mínimo un año",
    "Y con la cláusula obligatoria sobre la fecha de inicio (la tienes más abajo, para copiarla tal cual)."],
  ["emp-sueldo", "Sueldo expreso en euros y número de pagas",
    "Si el contrato es a tiempo parcial, la retribución anual tiene que llegar igual al salario mínimo de jornada completa."],
  ["emp-cno", "La ocupación, tal como figura en la CNO 2011",
    "El nombre del puesto debe coincidir con uno de la Clasificación Nacional de Ocupaciones. Tu asesor lo revisa."],
  ["emp-hacienda", "La empresa, al día con Hacienda y Seguridad Social"],
  ["emp-medios", "La empresa, con medios para sostener el contrato",
    "Con el Impuesto de Sociedades o las cuatro últimas declaraciones de IVA. Si tiene menos de cuatro trabajadores, siempre los cuatro trimestres de IVA."],
  ["emp-capacit", "Que puedas ejercer esa profesión",
    "Con tu título, tu formación o tu experiencia. Si la profesión está regulada, además el título homologado y la colegiación."],
];

/**
 * Lo que se le va a pedir, en el mismo orden y con el mismo nombre que en su
 * portal. Si aquí dice una cosa y allí se le pide otra, la guía estorba.
 */
const DOCS_TUYOS = [
  ["doc-precontrato", "Precontrato de trabajo",
    "Firmado por las dos partes. Salario igual o superior al SMI, jornada de 40 horas y duración de un año o indefinido. Es el documento que decide el expediente."],
  ["doc-notas", "Certificado de notas",
    "Con los estudios ya finalizados. No vale que te falte una asignatura."],
  ["doc-tie", "Último TIE o resolución",
    "Tu tarjeta actual, o la resolución de la autorización si aún no la tienes."],
  ["doc-pasaporte", "Pasaporte completo",
    "Todas las páginas, de la primera a la última, en un único PDF."],
  ["doc-beca-es", "No haber sido becado · España",
    "Se pide por correo a la AECID desde tu propia dirección. Suele demorar unos 3 días."],
  ["doc-beca-pe", "No haber sido becado · Perú",
    "Se solicita en línea en Pronabec, con tu DNI y tus datos."],
  ["doc-penales", "Antecedentes penales",
    "Apostillados."],
  ["doc-cv", "Currículum",
    "Al día, con toda tu experiencia."],
  ["doc-memoria", "Memoria descriptiva de funciones",
    "Qué vas a hacer en el puesto, con detalle. La preparas con tu empresa."],
  ["doc-padron", "Empadronamiento",
    "El de tu domicilio actual en España."],
  ["doc-cualif", "Cualificación profesional previa",
    "Títulos o experiencia que acrediten que puedes ocupar ese puesto."],
];

const DOCS_EMPRESA = [
  ["emd-nif", "Tarjeta acreditativa del NIF",
    "La descarga en línea en la sede de la Agencia Tributaria."],
  ["emd-escritura", "Escritura de constitución",
    "Copia."],
  ["emd-repr", "Acreditación del representante legal",
    "Que demuestre que quien firma puede firmar por la empresa."],
  ["emd-autoriza", "Autorización del representante legal a Inspira",
    "Para que podamos presentar el trámite en su nombre. Se la preparamos nosotros."],
  ["emd-modelo200", "Modelo 200 · última declaración",
    "Se obtiene en la web de la Agencia Tributaria. Acredita la solvencia de la empresa."],
  ["emd-ss", "Al corriente con la Seguridad Social",
    "Certificado de estar al día en los pagos, de la web de la Seguridad Social."],
];

/**
 * Las dos tasas.
 *
 * Van con su importe y con el aviso de no adelantarse: se pagan cuando
 * Extranjería las requiere, y pagarlas antes no acelera nada.
 */
const TASAS = [
  ["Tasa 062", "203,84 €", "La de la autorización de trabajo."],
  ["Tasa 052", "10,94 €", "La de residencia. Sólo se puede pagar si ya tienes NIE."],
];

const CLAUSULA =
  "Dada la vinculación de este contrato con la solicitud de una autorización de residencia y " +
  "trabajo a favor de la persona trabajadora, se deja constancia que la fecha de inicio del " +
  "contrato será aquella en la que la autorización solicitada tome eficacia, y que la empresa " +
  "o el empleador/a se compromete a mantener la actividad laboral de la persona trabajadora " +
  "de forma continuada durante el periodo de un año como mínimo.";

function Clausula() {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(CLAUSULA);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch { /* sin portapapeles: queda el texto para seleccionarlo a mano */ }
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-[#EEF2F8]/50 px-3.5 py-3">
      <div className="flex items-start gap-2 flex-wrap mb-2">
        <p className="text-[11.5px] font-bold text-primary min-w-0 flex-1">
          Cláusula que el contrato tiene que incluir, palabra por palabra
        </p>
        <button type="button" onClick={copiar}
          className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-primary
            text-white hover:opacity-90">
          {copiado ? "✓ copiada" : "Copiar"}
        </button>
      </div>
      <p className="text-[12px] text-neutral-700 leading-relaxed italic bg-white border
        border-neutral-200 rounded-lg px-3 py-2.5">
        «{CLAUSULA}»
      </p>
      <p className="text-[11px] text-neutral-500 leading-relaxed mt-2">
        Pásasela a quien redacte tu contrato. Sin ella, Extranjería devuelve el expediente.
      </p>
    </div>
  );
}

/* ── La guía ─────────────────────────────────────────────────────────────── */

export default function GuiaModificatoria() {
  const [marcado, alternar] = useMarcado();
  const cuenta = (lista) => ({
    hechos: lista.filter(([id]) => marcado[id]).length,
    total: lista.length,
  });

  const lista = (items) => items.map(([id, titulo, detalle]) => (
    <Marcable key={id} id={id} marcado={marcado} alternar={alternar} titulo={titulo}>
      {detalle}
    </Marcable>
  ));

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Portada */}
      <div className="rounded-2xl overflow-hidden mb-4 shadow-sm">
        <div className="px-5 py-6" style={{ background: `linear-gradient(135deg, ${AZUL} 0%, #013446 100%)` }}>
          <p className="text-[10.5px] font-bold uppercase tracking-[.18em] text-white/60 mb-1.5">
            Guía del proceso
          </p>
          <h1 className="font-serif text-[22px] sm:text-[26px] font-bold text-white leading-tight">
            De estancia por estudios<br />a residencia y trabajo
          </h1>
          <p className="text-[13px] text-white/75 leading-relaxed mt-2.5">
            Terminaste tus estudios y una empresa quiere contratarte. Esto es lo que hay que
            hacer, en qué orden y con qué plazos.
          </p>
        </div>
      </div>

      {/* Lo que hay que entender antes de nada */}
      <Seccion numero="0" icono="!" titulo="Dos cosas antes de empezar"
        subtitulo="Son las que más expedientes tumban">
        <Aviso tono="rojo" titulo="El plazo es una ventana, no una fecha tope">
          Se abre <b>dos meses antes</b> de que termines tus estudios o se te venza la estancia,
          y se cierra <b>tres meses después</b>. Presentar antes de que se abra se inadmite
          igual que presentar tarde. Mucha gente lo pierde por adelantarse.
        </Aviso>
        <Aviso tono="rojo" titulo="Tienes que haber terminado TODO">
          No vale ir aprobando ni que te falte una asignatura. La formación por la que te
          dieron la estancia tiene que estar <b>terminada por completo y con resultado
          satisfactorio</b>, con el título o el certificado emitido.
        </Aviso>
        <Aviso tono="azul" titulo="Lo bueno">
          En cuanto admiten tu solicitud a trámite, tu estancia por estudios <b>pasa a ser una
          autorización provisional de residencia y trabajo a jornada completa</b>. Es decir:
          puedes empezar a trabajar mientras lo resuelven. Tienen tres meses para contestar.
        </Aviso>
      </Seccion>

      {/* Los plazos */}
      <Seccion numero="1" icono="📅" titulo="Tu ventana de presentación"
        subtitulo="Calcula cuándo se abre y cuándo se cierra">
        <Ventana />
      </Seccion>

      {/* Requisitos tuyos */}
      <Seccion numero="2" icono="👤" titulo="Lo que tienes que cumplir tú"
        subtitulo="La parte de residencia" avance={cuenta(REQUISITOS_TUYOS)}>
        {lista(REQUISITOS_TUYOS)}
        <Aviso tono="naranja" titulo="Ojo">
          Esta vía <b>no sirve</b> si tu estancia era para secundaria, para estudiar idiomas
          (salvo que te la dieran bajo el RD 557/2011) o para cursos preparatorios de formación
          sanitaria especializada. Si es tu caso, avísanos antes de gastar tiempo en papeles.
        </Aviso>
      </Seccion>

      {/* Requisitos de la empresa */}
      <Seccion numero="3" icono="🏢" titulo="Lo que tiene que cumplir tu empresa"
        subtitulo="La parte laboral" avance={cuenta(REQUISITOS_EMPRESA)}>
        {lista(REQUISITOS_EMPRESA)}
        <Clausula />
      </Seccion>

      {/* Documentos tuyos */}
      <Seccion numero="4" icono="📄" titulo="Documentos que aportas tú"
        subtitulo="Los once que subes tú, en «Ver servicio»" avance={cuenta(DOCS_TUYOS)}>
        {lista(DOCS_TUYOS)}
        <Aviso tono="naranja" titulo="Traducción y legalización">
          Todo documento público extranjero va <b>legalizado o apostillado y traducido</b> al
          castellano. Un documento sin apostillar no lo miran.
        </Aviso>
      </Seccion>

      {/* Documentos de la empresa */}
      <Seccion numero="5" icono="🏛" titulo="Documentos que aporta tu empresa"
        subtitulo="Los seis que no dependen de ti. Pídeselos hoy" avance={cuenta(DOCS_EMPRESA)}>
        {lista(DOCS_EMPRESA)}
        <Aviso tono="azul" titulo="Un consejo">
          Estos son los que más demoran, porque hay que pedírselos a la gestoría de la empresa
          y no a ti. Mándales la lista <b>el mismo día</b> que sepas que te van a contratar.
        </Aviso>
      </Seccion>

      {/* Las tasas */}
      <Seccion numero="5b" icono="€" titulo="Las dos tasas"
        subtitulo="No las pagues antes de tiempo">
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
          {TASAS.map(([nombre, importe, detalle]) => (
            <div key={nombre} className="flex items-baseline gap-2 flex-wrap mb-2 last:mb-0">
              <span className="text-[13.5px] font-bold text-neutral-900">{nombre}</span>
              <span className="text-[13.5px] font-bold text-amber-700">{importe}</span>
              <span className="text-[12.5px] text-neutral-600 w-full">{detalle}</span>
            </div>
          ))}
        </div>
        <Aviso tono="rojo" titulo="Espera a que te lo digamos">
          Se abonan <b>cuando Extranjería las requiere</b>, no antes. Pagarlas por adelantado
          no acelera nada y, si el expediente cambia, puedes acabar pagando una tasa que no
          tocaba. Te avisamos cuando sea el momento.
        </Aviso>
      </Seccion>

      {/* Cómo se presenta */}
      <Seccion numero="6" icono="🖥" titulo="Cómo se presenta"
        subtitulo="De esto nos encargamos nosotros">
        <div className="text-[13px] text-neutral-700 leading-relaxed space-y-2.5">
          <p>
            La solicitud se presenta ante <b>Extranjería</b>, es <b>solo electrónica</b> y va
            firmada digitalmente. La oficina que te corresponde depende de dónde vivas; de eso
            nos ocupamos nosotros.
          </p>
          <p>
            La puede presentar la empresa o puedes presentarla tú. En cualquier caso,
            <b> nosotros preparamos y presentamos el expediente</b>: tú te encargas de reunir
            tus documentos y de que la empresa mande los suyos.
          </p>
          <p>
            Sobre las tasas: la de <b>trabajo</b> se paga desde el propio formulario y no hay que
            adjuntar el justificante —lo comprueban ellos—. La de <b>residencia</b> es el modelo
            790 código 052 y solo se puede pagar si ya tienes NIE.
          </p>
        </div>
      </Seccion>

      {/* Después */}
      <Seccion numero="7" icono="✅" titulo="Cuando te la concedan"
        subtitulo="Queda un paso, y tiene plazo">
        <Aviso tono="rojo" titulo="Un mes para el alta">
          Tu empresa tiene que darte de alta en la Seguridad Social <b>dentro del mes siguiente</b>
          a la notificación. La autorización <b>no vale hasta que esa alta se hace</b>. Recuérdaselo
          tú también: es su obligación, pero el perjudicado si se olvida eres tú.
        </Aviso>
        <div className="text-[13px] text-neutral-700 leading-relaxed space-y-2">
          <p>
            A partir de ahí puedes <b>residir y trabajar un año</b> en España, por cuenta ajena
            o por cuenta propia.
          </p>
          <p className="text-[12.5px] text-neutral-600">
            Y una obligación que casi nadie conoce: si mientras lo resuelven <b>cambia el contrato
            o la empresa ya no te va a contratar</b>, hay que comunicarlo. Avísanos y lo hacemos
            nosotros.
          </p>
        </div>
      </Seccion>

      <div className="rounded-2xl border border-primary/15 bg-white px-4 py-4">
        <p className="font-serif text-[14px] font-bold text-primary mb-1">¿Dudas?</p>
        <p className="text-[12.5px] text-neutral-600 leading-relaxed">
          Escríbenos por el portal o responde a cualquiera de nuestros correos. Es mejor una
          consulta a tiempo que un documento rehecho tres veces.
        </p>
        <p className="text-[11px] text-neutral-400 leading-relaxed mt-3">
          Contenido basado en la guía oficial de tramitación del procedimiento (versión de
          26.05.2026, Real Decreto 1155/2024) y en el impreso EX-03. Si la normativa cambia,
          manda lo que diga Extranjería.
        </p>
      </div>
    </div>
  );
}
