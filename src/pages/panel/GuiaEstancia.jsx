// src/pages/panel/GuiaEstancia.jsx
//
// Guía de la estancia por estudios.
//
// Se presenta desde España, en calidad de turista, y eso cambia todo: hay dos
// plazos que se estrechan por los dos lados y documentos que caducan mientras
// se reúnen. La guía va en el orden en que se hacen las cosas, no por temas,
// porque quien la lee está haciendo el trámite, no estudiándolo.

const AZUL = "#1A3557";
const NARANJA = "#E8730C";

function Paso({ num, icono, titulo, children }) {
  return (
    <div className="bg-white border border-[#1A3557]/12 rounded-2xl mb-4 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3.5 px-5 py-4 border-b border-[#1A3557]/10"
        style={{ background: "linear-gradient(90deg, rgba(26,53,87,.05) 0%, transparent 100%)" }}>
        <span className="shrink-0 w-9 h-9 rounded-xl grid place-items-center text-white text-[15px] font-bold font-serif"
          style={{ background: AZUL }}>
          {num}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-[15px] font-bold text-[#1A3557] leading-tight">
            {icono} {titulo}
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Aviso({ titulo, tono = "naranja", children }) {
  const tonos = {
    naranja: "bg-orange-50 border-orange-300 text-orange-800",
    rojo: "bg-red-50 border-red-300 text-red-800",
    verde: "bg-[#E8F5EE] border-[#1D6A4A]/30 text-[#14532d]",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 mb-3 ${tonos[tono]}`}>
      {titulo && (
        <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5">{titulo}</p>
      )}
      <div className="text-[13px] leading-relaxed">{children}</div>
    </div>
  );
}

function Item({ children, nota }) {
  return (
    <li className="flex gap-2.5 mb-2.5">
      <span className="shrink-0 mt-[3px] w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold text-white"
        style={{ background: NARANJA }}>✓</span>
      <span className="text-[13.5px] text-neutral-700 leading-relaxed">
        {children}
        {nota && <span className="block text-[12px] text-neutral-500 mt-0.5">{nota}</span>}
      </span>
    </li>
  );
}

export default function GuiaEstancia() {
  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Portada */}
      <div className="rounded-2xl px-6 py-7 mb-5 text-white"
        style={{ background: "linear-gradient(135deg, #1A3557 0%, #023A4B 100%)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60 font-mono mb-2">
          Guía del proceso
        </p>
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold leading-tight mb-3">
          Estancia por estudios
        </h1>
        <p className="text-[13.5px] text-white/80 leading-relaxed max-w-xl">
          Tiene los <b className="text-white">mismos efectos que un visado de estudios</b>. La
          diferencia es que viajas como turista y haces el trámite ya en España.
        </p>
      </div>

      <Aviso tono="naranja" titulo="Lo que decide tus plazos">
        Todo el calendario sale de <b>tu fecha de llegada a España</b> y del <b>inicio de
        clases de tu carta de admisión</b>. En cuanto los tengas, ponlos en tus datos: el
        portal te calcula solo las dos fechas límite.
      </Aviso>

      <Paso num="1" icono="📅" titulo="Confirma tu fecha de llegada a España">
        <p className="text-[13.5px] text-neutral-700 leading-relaxed mb-3">
          Es el primer dato que necesitamos. Con él te decimos cuándo hay que subir los
          documentos y cuál es tu fecha máxima según los plazos legales.
        </p>
        <Aviso tono="rojo" titulo="Si ya estuviste en Europa">
          Si has viajado al espacio Schengen en los últimos <b>180 días</b>, tus 90 días no
          empiezan de cero. Dínoslo antes de calcular nada.
        </Aviso>
      </Paso>

      <Paso num="2" icono="📤" titulo="Reúne y sube tus documentos">
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-2">
          Obligatorios
        </p>
        <ul className="mb-4">
          <Item nota="Todas las páginas, de la primera a la última, en un solo PDF.">
            <b>Pasaporte completo</b>
          </Item>
          <Item nota="De los países donde hayas residido los últimos 5 años. Apostillados y con menos de 3 meses.">
            <b>Antecedentes penales</b>
          </Item>
          <Item><b>Carta de admisión</b> y <b>matrícula</b></Item>
          <Item nota="O seguro escolar, cuando corresponda.">
            <b>Comprobante de pago</b> de los estudios
          </Item>
          <Item nota="Extracto de cuenta española con sello y firma del banco, con fecha actualizada. Mínimo 7.200 €.">
            <b>Solvencia económica</b>
          </Item>
          <Item nota="Póliza y condiciones particulares y generales, todo en un único PDF.">
            <b>Seguro médico</b>
          </Item>
          <Item nota="Preferiblemente español; vale del país de origen si cumple los requisitos.">
            <b>Certificado médico</b>
          </Item>
          <Item nota="Tarjeta de embarque con tu fecha de llegada."><b>Entrada a España</b></Item>
        </ul>

        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-2">
          Además necesitamos
        </p>
        <ul>
          <Item>Dirección donde residirás en España</Item>
          <Item>Nombre completo de tu <b>padre</b> y de tu <b>madre</b></Item>
          <Item nota="Sobre una hoja en blanco, para formularios y autorizaciones.">
            Tu <b>firma</b> escaneada
          </Item>
        </ul>

        <Aviso tono="rojo" titulo="Ojo con la dirección">
          Tienes que vivir en la <b>misma provincia</b> donde estudias. Si estudias en
          Sevilla, tu domicilio tiene que estar en Sevilla: la solicitud se presenta ante la
          oficina de extranjería de esa jurisdicción.
        </Aviso>
      </Paso>

      <Paso num="3" icono="🔔" titulo="Avísanos siempre que subas algo">
        <p className="text-[13.5px] text-neutral-700 leading-relaxed">
          Cada vez que actualices tus documentos, dínoslo para programar su revisión y darte
          las correcciones a tiempo. Es lo que evita que un documento caduque esperando.
        </p>
      </Paso>

      <Paso num="4" icono="📋" titulo="Nosotros preparamos">
        <ul>
          <Item>Formulario <b>EX-00</b></Item>
          <Item><b>Carta de representación</b></Item>
          <Item>Formulario de pago de la <b>Tasa 790</b></Item>
        </ul>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono mt-4 mb-2">
          Y si hace falta
        </p>
        <ul>
          <Item nota="Cuando la solicitud se presenta con menos de dos meses de antelación al inicio de clases.">
            <b>Declaración jurada</b> explicando los motivos
          </Item>
          <Item nota="Si extranjería pide alguna aclaración u observación.">
            <b>Declaración jurada</b> a mejor resolver
          </Item>
        </ul>
      </Paso>

      <Paso num="5" icono="⏳" titulo="Los dos plazos">
        <div className="rounded-xl border border-[#1A3557]/15 overflow-hidden mb-3">
          <div className="px-4 py-3 bg-[#EEF2F8]">
            <p className="text-[12px] font-bold text-[#1A3557]">Antelación mínima</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[13px] text-neutral-700 leading-relaxed">
              Hay que presentarla <b>dos meses antes</b> del inicio de clases. Si las clases
              empiezan el 1 de septiembre, la fecha tope es el <b>1 de julio</b>.
            </p>
            <p className="text-[12.5px] text-orange-700 mt-1.5">
              Después de esa fecha se puede presentar igual, pero hace falta la declaración
              jurada de excepcionalidad.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#1A3557]/15 overflow-hidden mb-3">
          <div className="px-4 py-3 bg-[#EEF2F8]">
            <p className="text-[12px] font-bold text-[#1A3557]">Plazo máximo</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[13px] text-neutral-700 leading-relaxed mb-2">
              Se calcula desde tu llegada:
            </p>
            <div className="flex items-center gap-2 flex-wrap text-[12px] font-semibold">
              <span className="px-2.5 py-1.5 rounded-lg bg-[#1A3557] text-white">Llegada a España</span>
              <span className="text-neutral-400">+</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-[#1A3557] text-white">90 días</span>
              <span className="text-neutral-400">−</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-[#1A3557] text-white">2 meses</span>
              <span className="text-neutral-400">=</span>
              <span className="px-2.5 py-1.5 rounded-lg text-white" style={{ background: NARANJA }}>
                Fecha máxima
              </span>
            </div>
          </div>
        </div>

        <Aviso tono="verde">
          <b>Recomendación:</b> programa el ingreso con antelación. Hace falta tiempo para
          revisar, corregir y presentar un expediente completo.
        </Aviso>
      </Paso>

      <Paso num="6" icono="✈️" titulo="Requisitos para viajar como turista">
        <ul>
          <Item nota="Con una diferencia de 15 a 20 días.">Pasaje de ida y vuelta</Item>
          <Item nota="Mínimo un día, obligatoria en destino.">Reserva de hotel</Item>
          <Item nota="Distinto del seguro de estudios.">Seguro de viaje</Item>
        </ul>
        <Aviso tono="naranja" titulo="Consejo de frontera">
          Ve con un itinerario pautado. La vuelta debe estar <b>confirmada</b>, no vale solo
          la reserva: pueden pedírtelo en el mostrador. Cómprala flexible para poder
          cancelarla y pedir devolución.
        </Aviso>
      </Paso>

      <Paso num="7" icono="🔎" titulo="Haz seguimiento de tu expediente">
        <p className="text-[13.5px] text-neutral-700 leading-relaxed mb-3">
          Cuando esté presentado, podrás consultarlo en la sede de la Delegación del
          Gobierno con tres datos: <b>número de expediente</b>, <b>fecha de ingreso</b> y
          tu <b>año de nacimiento</b>.
        </p>
        <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl px-4 py-3 border border-[#1A3557]/20 hover:bg-[#EEF2F8] transition-colors no-underline">
          <span className="text-lg">🌐</span>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-bold text-[#1A3557]">
              Consulta de expedientes de extranjería
            </span>
            <span className="block text-[11px] text-neutral-500 truncate">
              infoext2.delegaciondelgobierno.gob.es
            </span>
          </span>
        </a>
        <p className="text-[12.5px] text-neutral-600 mt-3 leading-relaxed">
          Si llega un requerimiento o la resolución, te avisamos por correo y lo verás en el
          apartado de <b>Extranjería</b> de tu portal.
        </p>
      </Paso>

      <Paso num="8" icono="🏠" titulo="Después de la resolución">
        <p className="text-[13.5px] text-neutral-700 leading-relaxed">
          Con la resolución favorable toca el <b>empadronamiento</b>, que es lo que
          necesitarás para tramitar tu <b>TIE</b> (Tarjeta de Identidad de Extranjero).
        </p>
      </Paso>

      <div className="rounded-2xl px-5 py-4 text-white text-center"
        style={{ background: "linear-gradient(135deg, #1A3557 0%, #023A4B 100%)" }}>
        <p className="text-[13px] font-semibold mb-1">El trámite tarda de 1 a 3 meses</p>
        <p className="text-[12px] text-white/70 leading-relaxed">
          Puede variar según la carga de la Oficina de Extranjería y la complejidad del
          expediente. Estamos contigo en cada paso.
        </p>
      </div>
    </div>
  );
}
