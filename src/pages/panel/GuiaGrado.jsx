// Guía del grado universitario y la Formación Profesional en España, para el
// panel del asesorado (19/10/2026). Dos partes, como pidió Carina: cómo es el
// proceso de postulación para un extranjero (homologación, vías de acceso,
// pruebas PCE, preinscripción, FP) y la «guía directa de documentos»: los
// dos documentos exactos, cómo tienen que venir y cómo se envían.
//
// Sin pasos para marcar: la ruta real la lleva su expediente; esto es lectura.
import Icono from "../../components/common/Icono";

const AZUL = "#013446";
const AMBAR = "#8A5A0B";

function Seccion({ icono, titulo, children, tono = AZUL }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5">
      <h2 className="m-0 mb-3 flex items-center gap-2 text-[15px] font-extrabold" style={{ color: tono }}>
        <span className="w-8 h-8 rounded-xl grid place-items-center shrink-0" style={{ background: `${tono}14`, color: tono }}>
          <Icono nombre={icono} size={16} />
        </span>
        {titulo}
      </h2>
      <div className="text-[13.5px] leading-relaxed text-neutral-800 space-y-2">{children}</div>
    </section>
  );
}

function Paso({ n, titulo, children }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[12px] font-extrabold text-white" style={{ background: AZUL }}>{n}</span>
      <div className="min-w-0">
        <b className="block text-[13.5px] text-neutral-900">{titulo}</b>
        <span className="block text-[13px] text-neutral-700">{children}</span>
      </div>
    </li>
  );
}

function Documento({ titulo, requisitos, nota }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: `${AMBAR}55`, background: "#FFFBF3" }}>
      <h3 className="m-0 mb-2 text-[14px] font-extrabold" style={{ color: AMBAR }}>{titulo}</h3>
      <ul className="m-0 pl-0 list-none space-y-1.5">
        {requisitos.map((r) => (
          <li key={r} className="flex gap-2 text-[13px] text-neutral-800">
            <span className="mt-[3px] shrink-0 text-[11px]" style={{ color: AMBAR }}>●</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
      {nota && <p className="m-0 mt-2 text-[12px] text-neutral-600">{nota}</p>}
    </div>
  );
}

export default function GuiaGrado() {
  return (
    <div className="max-w-3xl mx-auto w-full px-1 pb-8 space-y-4">
      <header className="rounded-2xl p-5 text-white" style={{ background: AZUL }}>
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[.14em] opacity-80">Guía Inspira</p>
        <h1 className="m-0 mt-1 text-[22px] font-extrabold leading-tight">Grado universitario y Formación Profesional en España</h1>
        <p className="m-0 mt-2 text-[13.5px] opacity-90">
          Cómo postula un extranjero a una carrera o a un ciclo de FP en España, qué documentos necesitas y en qué orden
          va todo. Tu expediente te marca en qué paso estás; aquí tienes el mapa completo.
        </p>
      </header>

      <Seccion icono="brujula" titulo="El camino, en seis pasos">
        <ol className="m-0 pl-0 list-none space-y-3">
          <Paso n="1" titulo="Documentos y homologación escolar">
            Dos documentos apostillados (los ves abajo). Con ellos homologamos tu secundaria al Bachillerato español ante el
            Ministerio de Educación. Es lo que más tarda —el plazo legal son tres meses—, por eso se empieza por aquí. Con el
            <b> volante de inscripción condicional</b> ya puedes matricularte mientras se resuelve.
          </Paso>
          <Paso n="2" titulo="Formulario">
            Qué quieres estudiar (carrera, ciclo de FP o las dos cosas), tu promedio, tu presupuesto y las ciudades donde te
            gustaría vivir. Las ciudades las acotas con tu asesor.
          </Paso>
          <Paso n="3" titulo="Informe">
            Te proponemos <b>tres carreras universitarias y tres ciclos superiores</b> sacados de los registros oficiales (RUCT
            para los grados, Registro Estatal de Centros Docentes para la FP), con universidad o centro, ciudad, nota de corte,
            plazas, precio y plazos.
          </Paso>
          <Paso n="4" titulo="Elección">
            Revisado el informe, marcas a cuáles quieres postular. Tu asesor cierra la elección contigo.
          </Paso>
          <Paso n="5" titulo="Postulaciones">
            Presentamos cada una: preinscripción en la universidad o en el distrito único de la comunidad, e inscripción directa
            en los centros de FP. Si tu carrera pide examen, gestionamos las PCE de la UNED.
          </Paso>
          <Paso n="6" titulo="Admisión y cierre">
            Con la carta de admisión formalizamos la matrícula y arrancamos tu vía migratoria: visado de estudios desde Perú o
            estancia por estudios si ya estás en España.
          </Paso>
        </ol>
      </Seccion>

      <Seccion icono="birrete" titulo="Cómo entra un extranjero a la universidad española">
        <p>
          Para un grado oficial necesitas tener la secundaria homologada al Bachillerato español. A partir de ahí hay
          <b> dos vías</b>:
        </p>
        <ul className="m-0 pl-5 space-y-1.5">
          <li>
            <b>Sin examen de admisión</b> (la que recomendamos cuando es posible): postulas con tu bachillerato homologado y
            tu nota media convertida a la escala española. Muchas universidades, sobre todo privadas y algunas públicas en
            carreras sin nota de corte alta, admiten por esta vía.
          </li>
          <li>
            <b>Con examen: las PCE de UNEDasiss.</b> Son las Pruebas de Competencias Específicas que organiza la UNED para
            estudiantes de sistemas educativos extranjeros. Te inscribes en UNEDasiss, eliges las materias que pide tu carrera,
            una sede (hay sedes en Perú y en España) y la convocatoria (normalmente mayo-junio, con otra en septiembre).
            La nota de las PCE se suma a tu nota de bachillerato para competir por plaza en las universidades públicas con
            nota de corte. Inspira gestiona toda la parte administrativa; la preparación del examen corre por tu cuenta.
          </li>
        </ul>
        <p>
          <b>La preinscripción.</b> En las universidades públicas se hace por comunidad autónoma, normalmente entre junio y
          julio: en Andalucía y otras comunidades es un <b>distrito único</b> (una sola solicitud con varias carreras en orden
          de preferencia); en el resto, cada universidad abre su propio portal. Las privadas tienen procesos propios y abren
          antes. Las <b>notas de corte</b> se publican al adjudicar las plazas y cambian cada año.
        </p>
      </Seccion>

      <Seccion icono="maletin" titulo="Y la Formación Profesional">
        <p>
          Los ciclos de grado superior duran dos años, incluyen prácticas en empresas y dan el título de Técnico Superior,
          que además da acceso a la universidad. La admisión es <b>directa en cada comunidad o centro</b>: no hay examen, se
          presenta la solicitud en el proceso de admisión de la comunidad (normalmente entre mayo y julio) y se baremán la
          nota de la secundaria homologada y otros criterios. Puedes postular a varias comunidades. Para el visado de
          estudios el centro tiene que ser oficial (público, concertado o privado autorizado).
        </p>
      </Seccion>

      <Seccion icono="calendario" titulo="Calendario orientativo">
        <ul className="m-0 pl-5 space-y-1">
          <li><b>Noviembre – febrero:</b> documentos apostillados y presentación de la homologación.</li>
          <li><b>Febrero – mayo:</b> inscripción a las PCE, solo si vas con examen.</li>
          <li><b>Mayo – junio:</b> pruebas PCE; abren las admisiones de FP.</li>
          <li><b>Junio – julio:</b> preinscripción universitaria y listas de admitidos.</li>
          <li><b>Julio – agosto:</b> matrícula y solicitud del visado (mínimo dos meses antes de clases).</li>
          <li><b>Septiembre – octubre:</b> inicio de clases.</li>
        </ul>
        <p className="text-[12.5px] text-neutral-600">Cada comunidad, universidad y UNEDasiss publican sus fechas; las tuyas las verás en tu expediente.</p>
      </Seccion>

      <section className="rounded-2xl p-4 sm:p-5" style={{ background: "#FFF6E5", border: `1px solid ${AMBAR}44` }}>
        <h2 className="m-0 mb-1 flex items-center gap-2 text-[15px] font-extrabold" style={{ color: AMBAR }}>
          <Icono nombre="documento" size={18} /> Guía directa de documentos
        </h2>
        <p className="m-0 mb-3 text-[13px] text-neutral-700">
          Para la postulación académica y la homologación solo necesitas <b>dos documentos</b>. Tienen que venir exactamente así:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Documento
            titulo="1 · Certificado de estudios secundarios"
            requisitos={[
              "De 1.º a 5.º de secundaria, completo.",
              "Con código QR de verificación.",
              "Firmado y sellado por el director del colegio.",
              "Visado por el Ministerio de Educación (Minedu).",
              "Apostillado por el Ministerio de Relaciones Exteriores.",
            ]}
            nota="Si tu colegio no lo emite con QR, pídelo en la UGEL o la DRE que corresponda: sin el visado del Minedu no se puede apostillar."
          />
          <Documento
            titulo="2 · Pasaporte"
            requisitos={[
              "La primera hoja (la de tus datos).",
              "Certificada por Migraciones.",
              "Apostillada por Relaciones Exteriores.",
              "Pasaporte vigente.",
            ]}
          />
        </div>
        <h3 className="m-0 mt-4 mb-2 text-[13.5px] font-extrabold" style={{ color: AMBAR }}>Cómo nos los haces llegar</h3>
        <ol className="m-0 pl-5 space-y-1.5 text-[13px] text-neutral-800">
          <li><b>Súbelos escaneados</b> en tu expediente: escaneo nítido, al 100 %, sin recortes ni sombras, en PDF. Nada de fotos del celular.</li>
          <li>Cuando tu asesor te lo indique, <b>envía los originales a nuestras oficinas</b>. Nosotros los mandamos a España.</li>
          <li>Verás cada tramo en tu expediente: documentos en España, pago de la tasa, volante y resolución de la homologación.</li>
        </ol>
        <p className="m-0 mt-3 text-[12px] text-neutral-600">
          La tasa oficial de la homologación no está incluida en el paquete y se paga cuando el Ministerio la requiere; te avisamos del importe y del medio de pago.
        </p>
      </section>
    </div>
  );
}
