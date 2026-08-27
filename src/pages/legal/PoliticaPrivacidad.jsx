// src/pages/legal/PoliticaPrivacidad.jsx
import LegalLayout, { Seccion, Tabla } from "./LegalLayout";
import {
  AUTORIDAD,
  PLAZOS,
  RESPONSABLE_DATOS,
  RUTAS_LEGALES,
  TITULAR,
  VERSIONES,
  pendiente,
} from "../../config/legal";

const A = ({ href, children }) => (
  <a
    className="font-medium text-primary underline underline-offset-2"
    href={href}
  >
    {children}
  </a>
);

const Li = ({ children }) => <li className="ml-5 list-disc">{children}</li>;

export default function PoliticaPrivacidad() {
  const { version, fecha } = VERSIONES.privacidad;

  return (
    <LegalLayout
      titulo="Aviso y Política de Privacidad"
      version={version}
      fecha={fecha}
      resumen={
        "Este documento explica quiénes somos, qué datos personales recogemos en este sitio, para qué los usamos, con quién los compartimos, cuánto tiempo los conservamos y cómo puedes ejercer tus derechos. Está redactado conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento."
      }
    >
      <Seccion n="1" titulo="Quién es el responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es{" "}
          <strong>{TITULAR.razonSocial}</strong>, con RUC {TITULAR.ruc}
          {!pendiente(TITULAR.domicilioFiscal) && (
            <> y domicilio en {TITULAR.domicilioFiscal}</>
          )}, que opera bajo el nombre
          comercial <strong>{TITULAR.nombreComercial}</strong> y es titular del
          sitio web {TITULAR.web}.
        </p>
        <p>
          Canal de contacto en materia de protección de datos personales:{" "}
          <A href={"mailto:" + TITULAR.emailDatosPersonales}>
            {TITULAR.emailDatosPersonales}
          </A>
          {RESPONSABLE_DATOS.designado && (
            <>
              {" "}
              (a la atención de {RESPONSABLE_DATOS.nombre},{" "}
              {RESPONSABLE_DATOS.cargo})
            </>
          )}
          . También puedes escribirnos a{" "}
          <A href={"mailto:" + TITULAR.emailContacto}>
            {TITULAR.emailContacto}
          </A>
          .
        </p>
      </Seccion>

      <Seccion n="2" titulo="Qué datos tratamos y con qué finalidad">
        <p>
          Solo recogemos los datos que necesitamos para cada finalidad concreta.
          Ninguna finalidad se usa para algo distinto de lo aquí declarado. Este
          es el detalle completo de los tratamientos que realizamos en el sitio:
        </p>

        <Tabla
          cabeceras={[
            "Tratamiento",
            "Datos que recogemos",
            "Finalidad",
            "Base que lo legitima",
            "Conservación",
          ]}
          filas={[
            [
              "Calculadora de máster",
              "Nombre, país, correo electrónico, número de WhatsApp, carrera, promedio académico y escala de notas, universidad de origen, presupuesto, preferencias de comunidad autónoma y de máster, y condición de funcionario público o de pertenencia a una universidad AUIP.",
              "Calcular tu equivalencia de nota, estimar costos, mostrarte universidades y becas compatibles con tu perfil y enviarte el resultado. Si lo autorizas por separado, contactarte para orientarte sobre nuestros servicios.",
              "Tu consentimiento, otorgado al marcar la casilla antes de enviar el formulario.",
              "Hasta que solicites la supresión de tus datos o te opongas al tratamiento; revisamos periódicamente la vigencia del interés.",
            ],
            [
              "Solicitud de presupuesto",
              "Nombre, un dato de contacto (correo o WhatsApp), comunidades y servicios de interés y la descripción de tu situación que decidas escribir.",
              "Elaborar y enviarte una propuesta económica y responder tu consulta.",
              "Tu consentimiento y, cuando pides un presupuesto, la ejecución de medidas precontractuales a tu solicitud.",
              "Hasta que solicites la supresión de tus datos o te opongas al tratamiento; revisamos periódicamente la vigencia del interés.",
            ],
            [
              "Cuenta de cliente e inicio de sesión con Google",
              "Nombre, correo electrónico e identificador de la cuenta de Google con la que inicias sesión.",
              "Crear y mantener tu cuenta, autenticarte y darte acceso a tu panel.",
              "Ejecución del contrato de servicios y tu consentimiento al iniciar sesión.",
              "Mientras la cuenta esté activa y, tras su baja, durante los plazos de prescripción legal aplicables.",
            ],
            [
              "Prestación del servicio contratado (expediente)",
              "Datos de identificación (DNI o pasaporte), datos académicos y de formación, experiencia, idiomas, datos de las postulaciones y los documentos que subes a tu expediente (títulos, certificados, justificantes, documentación de visado y de solvencia).",
              "Ejecutar el servicio contratado: búsqueda y selección de máster, preparación y revisión documental, postulación, matrícula y acompañamiento en el trámite de visado.",
              "Ejecución del contrato que celebras con nosotros.",
              "Durante la prestación del servicio y hasta 5 años después de su finalización, por plazos de prescripción contractual y obligaciones de acreditación.",
            ],
            [
              "Reserva y pago de citas",
              "Nombre, correo, datos de la reserva y datos de la transacción. Los datos de tu tarjeta o medio de pago los recoge y trata directamente Mercado Pago; nosotros no los recibimos ni los almacenamos.",
              "Gestionar la agenda, generar el enlace de la videollamada y cobrar el servicio.",
              "Ejecución del contrato y cumplimiento de obligaciones tributarias y contables.",
              "Los datos con efectos contables y tributarios se conservan por los plazos exigidos por la normativa tributaria peruana.",
            ],
            [
              "Comunicaciones comerciales",
              "Nombre, correo electrónico y número de WhatsApp.",
              "Enviarte información sobre convocatorias, becas, plazos y servicios de Inspira Legal.",
              "Tu consentimiento específico, que se solicita en una casilla separada y nunca marcada por defecto.",
              "Hasta que retires tu consentimiento o te des de baja.",
            ],
            [
              "Atención de reclamos y ejercicio de derechos",
              "Nombre, documento de identidad, datos de contacto y el contenido de tu solicitud o reclamo.",
              "Tramitar y responder tu reclamo en el Libro de Reclamaciones o tu solicitud de derechos sobre tus datos, y acreditar la respuesta.",
              "Cumplimiento de una obligación legal.",
              "Los reclamos, 2 años desde su presentación. Las solicitudes de derechos, durante el plazo en que puedan ser fiscalizadas.",
            ],
          ]}
        />

        <p className="rounded-xl bg-secondary-light p-4 text-sm">
          <strong>Sobre los campos obligatorios.</strong> En cada formulario, los
          campos marcados con asterisco son obligatorios porque sin ellos no
          podemos darte el resultado o el servicio que pides. El resto es
          opcional. Negarte a facilitar los datos obligatorios significa
          únicamente que no podremos atender esa solicitud concreta; no tiene
          ninguna otra consecuencia.
        </p>

        <p>
          <strong>No solicitamos datos sensibles.</strong> No te pedimos datos de
          salud, origen racial o étnico, convicciones religiosas, políticas o
          filosóficas, vida sexual ni datos biométricos. Te pedimos que no los
          incluyas en los campos de texto libre ni en los documentos que subas,
          salvo que un trámite concreto lo exija y te lo hayamos solicitado
          expresamente.
        </p>
      </Seccion>

      <Seccion n="3" titulo="Bancos de datos personales">
        <p>
          Los datos que nos facilitas se almacenan en bancos de datos personales
          de titularidad de {TITULAR.razonSocial}, denominados{" "}
          <em>Leads y prospectos</em>, <em>Clientes y expedientes</em>,{" "}
          <em>Reservas y pagos</em>, <em>Usuarios internos</em> y{" "}
          <em>Reclamos y solicitudes de derechos</em>, inscritos o en proceso de
          inscripción en el Registro Nacional de Protección de Datos Personales.
        </p>
      </Seccion>

      <Seccion n="4" titulo="Con quién compartimos tus datos">
        <p>
          No vendemos tus datos personales. Los compartimos únicamente con
          proveedores que nos prestan servicios como encargados de tratamiento,
          bajo contrato y solo para las finalidades descritas:
        </p>
        <Tabla
          cabeceras={["Proveedor", "Para qué", "Dónde se tratan los datos"]}
          filas={[
            [
              "Google (Google Workspace, Google Cloud Storage, Google Drive, Google Calendar, Google Meet e inicio de sesión con Google)",
              "Correo corporativo, almacenamiento de los documentos de tu expediente, agenda y videollamadas, y autenticación de tu cuenta.",
              "Estados Unidos y otros países donde Google opera centros de datos.",
            ],
            [
              "Mercado Pago",
              "Procesar los pagos de citas y servicios y prevenir el fraude.",
              "Perú y otros países de la región donde opera el grupo.",
            ],
            [
              "Calendly",
              "Agendar llamadas de asesoría cuando eliges esa opción.",
              "Estados Unidos.",
            ],
            [
              "Make (integromat)",
              "Automatizar el aviso interno al equipo cuando llega una nueva solicitud desde la calculadora.",
              "Unión Europea / Estados Unidos.",
            ],
            [
              "Hostinger",
              "Alojamiento del servidor y de la base de datos del sitio.",
              "Centro de datos del proveedor de alojamiento.",
            ],
            [
              "WhatsApp (Meta)",
              "Comunicación contigo por WhatsApp cuando tú inicias la conversación.",
              "Estados Unidos.",
            ],
          ]}
        />
        <p>
          Además, podemos comunicar tus datos a autoridades públicas,
          universidades, consulados y organismos de extranjería{" "}
          <strong>cuando ello sea imprescindible</strong> para ejecutar el
          servicio que has contratado (por ejemplo, presentar tu postulación o
          tu solicitud de visado), así como cuando exista una obligación legal o
          un requerimiento de autoridad competente.
        </p>
      </Seccion>

      <Seccion n="5" titulo="Flujo transfronterizo de datos personales">
        <p>
          Varios de los proveedores anteriores tratan datos fuera del Perú, por
          lo que existe un <strong>flujo transfronterizo de datos personales</strong>{" "}
          hacia Estados Unidos y la Unión Europea, entre otros. Al aceptar esta
          política y contratar nuestros servicios prestas tu consentimiento
          informado para dicha transferencia; además, exigimos a estos
          proveedores compromisos contractuales de confidencialidad y seguridad
          equivalentes a los que aplicamos nosotros.
        </p>
        <p>
          Si tu proceso de admisión o de visado lo requiere, tus datos y
          documentos se comunicarán también a universidades y autoridades del
          Reino de España, lo que constituye igualmente un flujo transfronterizo
          necesario para la ejecución del contrato.
        </p>
      </Seccion>

      <Seccion n="6" titulo="Cuánto tiempo conservamos tus datos">
        <p>
          Los plazos concretos figuran en la tabla del punto 2. Como regla
          general: conservamos los datos mientras dure la relación contigo y,
          después, únicamente durante los plazos necesarios para atender
          responsabilidades legales, contractuales o tributarias. Cumplidos esos
          plazos, los datos se eliminan o se anonimizan de forma irreversible
          mediante un proceso periódico de depuración.
        </p>
      </Seccion>

      <Seccion n="7" titulo="Tus derechos y cómo ejercerlos">
        <p>
          Como titular de los datos puedes ejercer, de forma gratuita, los
          derechos de <strong>información, acceso, rectificación, cancelación
          (supresión) y oposición</strong>, así como el derecho a{" "}
          <strong>revocar el consentimiento</strong> que nos hayas dado, a
          solicitar la <strong>portabilidad</strong> de tus datos y a{" "}
          <strong>no ser objeto de decisiones basadas únicamente en un
          tratamiento automatizado</strong> que produzcan efectos jurídicos sobre
          ti.
        </p>
        <p>
          Para ejercerlos, usa el formulario de{" "}
          <A href={RUTAS_LEGALES.derechos}>solicitud de derechos</A> o escribe a{" "}
          <A href={"mailto:" + TITULAR.emailDatosPersonales}>
            {TITULAR.emailDatosPersonales}
          </A>
          , indicando tu nombre, tu documento de identidad, el derecho que
          ejerces y un domicilio o correo para responderte. Podemos pedirte que
          acredites tu identidad antes de atender la solicitud.
        </p>
        <p>
          Responderemos en un plazo máximo de{" "}
          <strong>{PLAZOS.acceso}</strong> para el derecho de acceso y de{" "}
          <strong>{PLAZOS.rectificacionCancelacionOposicion}</strong> para los
          derechos de rectificación, cancelación y oposición, contados desde el
          día siguiente a la recepción de tu solicitud.
        </p>
        <p>
          Si consideras que no hemos atendido correctamente tu solicitud, puedes
          presentar un reclamo ante la{" "}
          <A href={AUTORIDAD.web}>{AUTORIDAD.nombre}</A>.
        </p>
      </Seccion>

      <Seccion n="8" titulo="Seguridad de la información">
        <p>
          Aplicamos medidas técnicas y organizativas para proteger tus datos:
          cifrado del tráfico mediante HTTPS, control de acceso por roles y
          permisos, autenticación mediante tokens con expiración, cifrado de las
          credenciales de portales de terceros, contraseñas almacenadas con
          funciones de resumen (hash), limitación de peticiones para prevenir
          abusos, cabeceras de seguridad del navegador, y copias de respaldo de
          la base de datos. El acceso del personal se otorga bajo el principio
          de mínimo privilegio y con deber de confidencialidad.
        </p>
        <p>
          Si se produjera una brecha de seguridad que afecte a tus datos
          personales, aplicaremos nuestro procedimiento interno de gestión de
          incidentes y te informaremos, junto con la autoridad competente, en
          los casos y plazos que exige la normativa.
        </p>
      </Seccion>

      <Seccion n="9" titulo="Menores de edad">
        <p>
          Nuestros servicios están dirigidos a personas mayores de edad. No
          recogemos deliberadamente datos de menores de 14 años. Si detectamos
          que hemos recibido datos de un menor sin la autorización de su padre,
          madre o tutor, los eliminaremos. La única excepción es el{" "}
          <A href={RUTAS_LEGALES.reclamaciones}>Libro de Reclamaciones</A>,
          donde la normativa de protección al consumidor nos obliga a recoger
          los datos del padre, madre o apoderado cuando quien reclama es menor
          de edad. Si crees que hemos recibido datos de un menor por otra vía,
          escríbenos a{" "}
          <A href={"mailto:" + TITULAR.emailDatosPersonales}>
            {TITULAR.emailDatosPersonales}
          </A>
          .
        </p>
      </Seccion>

      <Seccion n="10" titulo="Cookies y almacenamiento local">
        <p>
          El uso de cookies y de almacenamiento local en el navegador se explica
          en detalle en nuestra{" "}
          <A href={RUTAS_LEGALES.cookies}>Política de Cookies</A>, donde también
          puedes cambiar tu configuración en cualquier momento.
        </p>
      </Seccion>

      <Seccion n="11" titulo="Cambios en esta política">
        <p>
          Podemos actualizar este documento cuando cambien nuestros tratamientos,
          nuestros proveedores o la normativa aplicable. Cada versión lleva
          número y fecha de vigencia. Si el cambio afecta de forma sustancial a
          las finalidades que consentiste, te lo comunicaremos y, cuando
          corresponda, te pediremos un nuevo consentimiento.
        </p>
        <ul className="space-y-1">
          <Li>
            Versión vigente: {version}, desde el {fecha}.
          </Li>
        </ul>
      </Seccion>
    </LegalLayout>
  );
}
