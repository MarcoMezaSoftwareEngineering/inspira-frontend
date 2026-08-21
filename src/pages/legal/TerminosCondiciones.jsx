// src/pages/legal/TerminosCondiciones.jsx
import LegalLayout, { Seccion } from "./LegalLayout";
import { PLAZOS, RUTAS_LEGALES, TITULAR, VERSIONES, AUTORIDAD, pendiente } from "../../config/legal";

const A = ({ href, children }) => (
  <a className="font-medium text-primary underline underline-offset-2" href={href}>
    {children}
  </a>
);

const Li = ({ children }) => <li className="ml-5 list-disc">{children}</li>;

export default function TerminosCondiciones() {
  const { version, fecha } = VERSIONES.terminos;

  return (
    <LegalLayout
      titulo="Términos y Condiciones de Contratación"
      version={version}
      fecha={fecha}
      resumen={
        "Estas condiciones regulan la contratación de los servicios de Inspira Legal a través de este sitio. Léelas antes de contratar: al confirmar un pago o una reserva declaras haberlas leído y aceptado."
      }
    >
      <Seccion n="1" titulo="Identificación del proveedor">
        <ul className="space-y-1">
          <Li>Razón social: {TITULAR.razonSocial}</Li>
          <Li>RUC: {TITULAR.ruc}</Li>
          <Li>Nombre comercial: {TITULAR.nombreComercial}</Li>
          {!pendiente(TITULAR.domicilioFiscal) && (
            <Li>Domicilio: {TITULAR.domicilioFiscal}</Li>
          )}
          {!pendiente(TITULAR.representanteLegal) && (
            <Li>Representante legal: {TITULAR.representanteLegal}</Li>
          )}
          <Li>
            Correo de atención:{" "}
            <A href={"mailto:" + TITULAR.emailContacto}>
              {TITULAR.emailContacto}
            </A>
          </Li>
          {!pendiente(TITULAR.telefono) && (
            <Li>Teléfono / WhatsApp: {TITULAR.telefono}</Li>
          )}
        </ul>
      </Seccion>

      <Seccion n="2" titulo="Qué servicios prestamos (y cuáles no)">
        <p>
          Inspira Legal presta servicios de <strong>asesoría y gestión</strong>{" "}
          en procesos de admisión a másteres y posgrados en España y en trámites
          de extranjería y visado, que pueden incluir, según el paquete
          contratado: búsqueda y selección de programas, elaboración de informes
          de compatibilidad, orientación y revisión documental, apoyo en
          apostillas y traducciones, gestión de postulaciones en portales
          universitarios, acompañamiento en la matrícula y preparación del
          expediente de visado.
        </p>
        <p className="rounded-xl bg-secondary-light p-4 text-sm">
          <strong>Naturaleza del servicio y ausencia de garantía de
          resultado.</strong> Nuestras obligaciones son de medios, no de
          resultado. No somos una universidad, un consulado ni una entidad
          pública, y no tenemos capacidad de decisión sobre las admisiones, las
          becas ni los visados. En consecuencia,{" "}
          <strong>no garantizamos la admisión a un programa, la obtención de
          una beca ni la concesión de un visado</strong>, decisiones que
          corresponden exclusivamente a las instituciones competentes. Nos
          obligamos a ejecutar el servicio con diligencia profesional y en los
          plazos pactados.
        </p>
        <p>
          Las simulaciones de la calculadora, las estimaciones de costos y las
          indicaciones sobre becas son <strong>referenciales</strong>, se basan
          en la información que tú introduces y en convocatorias publicadas que
          pueden variar o no volver a convocarse. No constituyen una oferta ni
          una promesa de resultado.
        </p>
      </Seccion>

      <Seccion n="3" titulo="Proceso de contratación">
        <ol className="space-y-1">
          <li className="ml-5 list-decimal">
            Eliges el servicio o paquete y revisas su descripción y su precio.
          </li>
          <li className="ml-5 list-decimal">
            Aceptas expresamente estos Términos y el{" "}
            <A href={RUTAS_LEGALES.privacidad}>Aviso de Privacidad</A>. La
            aceptación se registra con fecha, hora y versión del documento.
          </li>
          <li className="ml-5 list-decimal">
            Realizas el pago a través de la pasarela de Mercado Pago.
          </li>
          <li className="ml-5 list-decimal">
            Recibes la confirmación por correo electrónico, con el detalle del
            servicio contratado, y el comprobante de pago que corresponda.
          </li>
        </ol>
        <p>
          El contrato se perfecciona con la confirmación del pago. Conservamos
          registro de la contratación y te lo facilitamos si lo solicitas.
        </p>
      </Seccion>

      <Seccion n="4" titulo="Precios, impuestos y medios de pago">
        <ul className="space-y-1">
          <Li>
            Los precios mostrados están expresados en la moneda que se indica en
            cada caso e incluyen los impuestos aplicables, salvo indicación
            expresa en contrario junto al precio.
          </Li>
          <Li>
            Los pagos se procesan mediante <strong>Mercado Pago</strong>. Los
            datos de tu tarjeta o medio de pago los trata directamente esa
            pasarela; Inspira Legal no los recibe ni los almacena.
          </Li>
          <Li>
            El precio del servicio de Inspira Legal{" "}
            <strong>no incluye</strong> los costos de terceros: tasas de
            solicitud y matrícula de universidades, apostillas, traducciones
            juradas, tasas consulares, seguros, envíos ni gastos de viaje o
            alojamiento, salvo que el paquete contratado lo diga expresamente.
          </Li>
          <Li>
            Emitimos el comprobante de pago electrónico que corresponda conforme
            a la normativa tributaria peruana.
          </Li>
        </ul>
      </Seccion>

      <Seccion n="5" titulo="Reservas de citas, cancelaciones y reprogramación">
        <ul className="space-y-1">
          <Li>
            La reserva de una cita queda confirmada al completarse el pago. Si
            el pago no se completa dentro del tiempo de retención del horario,
            este vuelve a quedar disponible.
          </Li>
          <Li>
            Puedes reprogramar tu cita sin costo comunicándolo con al menos{" "}
            <strong>24 horas</strong> de antelación al horario reservado.
          </Li>
          <Li>
            Si no asistes a la cita ni la reprogramas dentro de ese plazo, el
            servicio se considera prestado.
          </Li>
          <Li>
            Si somos nosotros quienes cancelamos o reprogramamos, podrás elegir
            entre un nuevo horario o la devolución íntegra de lo pagado.
          </Li>
        </ul>
      </Seccion>

      <Seccion n="6" titulo="Desistimiento y devoluciones">
        <p>
          Puedes desistir de un servicio contratado y solicitar la devolución en
          las siguientes condiciones:
        </p>
        <ul className="space-y-1">
          <Li>
            <strong>Antes del inicio de la ejecución:</strong> devolución del
            100 % de lo pagado, descontando únicamente las comisiones no
            reembolsables que la pasarela de pago haya retenido, si las hubiera.
          </Li>
          <Li>
            <strong>Con la ejecución ya iniciada:</strong> devolución
            proporcional a la parte del servicio aún no ejecutada, según las
            etapas descritas en el paquete contratado.
          </Li>
          <Li>
            <strong>No son reembolsables</strong> los importes ya pagados a
            terceros por tu cuenta (tasas universitarias, apostillas,
            traducciones, tasas consulares) ni los servicios ya prestados.
          </Li>
          <Li>
            Solicita la devolución escribiendo a{" "}
            <A href={"mailto:" + TITULAR.emailContacto}>
              {TITULAR.emailContacto}
            </A>
            . La resolveremos en un plazo máximo de{" "}
            {PLAZOS.reclamoConsumidor} y, si procede, ejecutaremos la devolución
            por el mismo medio de pago.
          </Li>
        </ul>
      </Seccion>

      <Seccion n="7" titulo="Tus obligaciones como cliente">
        <ul className="space-y-1">
          <Li>
            Facilitar información y documentación{" "}
            <strong>veraz, completa y vigente</strong>. Los retrasos o rechazos
            derivados de información inexacta o de documentación entregada fuera
            de plazo no son imputables a Inspira Legal.
          </Li>
          <Li>
            Cumplir los plazos de cada convocatoria y responder a nuestras
            solicitudes de información dentro de los tiempos indicados.
          </Li>
          <Li>
            Custodiar tus credenciales de acceso al panel y no compartirlas con
            terceros.
          </Li>
          <Li>
            No utilizar el sitio con fines ilícitos ni intentar acceder a áreas
            o datos que no te correspondan.
          </Li>
        </ul>
      </Seccion>

      <Seccion n="8" titulo="Acceso a portales de terceros">
        <p>
          Cuando el servicio contratado incluye la gestión de postulaciones,
          podrás facilitarnos credenciales de acceso a portales universitarios o
          administrativos. Estas credenciales se almacenan cifradas, se usan
          exclusivamente para ejecutar el servicio contratado y solo acceden a
          ellas las personas asignadas a tu expediente. Puedes cambiarlas o
          revocarlas cuando quieras.
        </p>
      </Seccion>

      <Seccion n="9" titulo="Propiedad intelectual">
        <p>
          Los contenidos del sitio, los informes, plantillas, instructivos y
          metodologías que te entregamos son titularidad de{" "}
          {TITULAR.razonSocial} y se te licencian para tu uso personal en el
          marco del servicio contratado. No pueden reproducirse, distribuirse ni
          comercializarse sin autorización escrita.
        </p>
      </Seccion>

      <Seccion n="10" titulo="Responsabilidad">
        <p>
          Respondemos por los daños directos que se deriven del incumplimiento
          de nuestras obligaciones, con el límite del importe efectivamente
          pagado por el servicio afectado. No respondemos por las decisiones de
          universidades, consulados u otras autoridades, por cambios normativos
          o de convocatorias, ni por la información inexacta facilitada por el
          cliente. Nada de lo aquí dispuesto limita los derechos que la
          normativa de protección al consumidor reconoce de forma imperativa.
        </p>
      </Seccion>

      <Seccion n="11" titulo="Atención de reclamos">
        <p>
          Puedes presentar una queja o un reclamo en nuestro{" "}
          <A href={RUTAS_LEGALES.reclamaciones}>Libro de Reclamaciones virtual</A>,
          disponible en todo momento. Responderemos en un plazo máximo de{" "}
          {PLAZOS.reclamoConsumidor}, prorrogable por única vez cuando la
          naturaleza del reclamo lo justifique, comunicándote la ampliación. Si
          no quedas conforme, puedes acudir a {AUTORIDAD.consumidor} (
          <A href={AUTORIDAD.consumidorWeb}>{AUTORIDAD.consumidorWeb}</A>).
        </p>
      </Seccion>

      <Seccion n="12" titulo="Protección de datos personales">
        <p>
          El tratamiento de tus datos se rige por nuestro{" "}
          <A href={RUTAS_LEGALES.privacidad}>Aviso de Privacidad</A> y, en cuanto
          a cookies, por la{" "}
          <A href={RUTAS_LEGALES.cookies}>Política de Cookies</A>. Puedes ejercer
          tus derechos desde el{" "}
          <A href={RUTAS_LEGALES.derechos}>formulario de derechos</A>.
        </p>
      </Seccion>

      <Seccion n="13" titulo="Modificaciones, ley aplicable y jurisdicción">
        <p>
          Podemos modificar estos Términos; la versión aplicable a tu
          contratación es la vigente en el momento en que la aceptaste, y la
          conservamos como parte del registro del contrato. Estas condiciones se
          rigen por la ley peruana. Para cualquier controversia, las partes se
          someten a los jueces y tribunales del distrito judicial de Lima, sin
          perjuicio del derecho del consumidor de acudir a las instancias
          administrativas de protección al consumidor.
        </p>
        <p className="text-xs text-neutral-500">
          Versión {version}, vigente desde el {fecha}.
        </p>
      </Seccion>
    </LegalLayout>
  );
}
