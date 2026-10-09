// @vitest-environment jsdom
//
// Instantáneas del HTML del panel de la modificatoria (09/10/2026). Se tomaron
// ANTES de partir ModificatoriaAdmin.jsx en piezas y sirven para eso: si un
// refactor cambia una clase, un texto o el orden de algo, falla. Si el cambio
// es a propósito, se regeneran con `npx vitest run -u` y se revisa el diff del
// .snap.
//
// Reloj y zona fijos (viernes 09/10/2026 10:20 en Lima): las fechas del panel
// («ha pedido revisión», «cerrada el», «subido el») dependen de la zona.
//
// vitest.config.js no carga el plugin de React, así que aquí el JSX se compila
// en modo clásico (React.createElement) y los componentes no importan React:
// se expone como global antes de cargar nada.
//
// Los hijos de otros archivos (Invitados, RecordatorioModificatoria,
// GeneradoresModificatoria, VisorArchivo) se pintan de verdad; solo se simulan
// los servicios.
import { vi, describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";

const zonaOriginal = await vi.hoisted(async () => {
  const antes = globalThis.process.env.TZ;
  globalThis.process.env.TZ = "America/Lima";
  globalThis.React = (await import("react")).default;
  return antes;
});

vi.mock("../../../../../services/backofficeApi", () => ({
  boGET: vi.fn(), boPOST: vi.fn(), boPATCH: vi.fn(), boDELETE: vi.fn(), boFetch: vi.fn(),
}));
vi.mock("../../../../../services/archivos", () => ({
  abrirArchivo: vi.fn(), pedirArchivo: vi.fn(), descargarArchivo: vi.fn(),
}));
vi.mock("../../../../../services/dialogService", () => ({
  dialog: { toast: vi.fn(), confirm: vi.fn(), prompt: vi.fn() },
}));

import { render, fireEvent, act, cleanup, screen } from "@testing-library/react";
import { boGET, boPATCH, boFetch } from "../../../../../services/backofficeApi";
import { pedirArchivo } from "../../../../../services/archivos";
import ModificatoriaAdmin from "./ModificatoriaAdmin";

const AHORA = new Date("2026-10-09T10:20:00-05:00");
const ID = 77;
const BASE = `/backoffice/solicitudes/${ID}`;

const REVISION = {
  smi_referencia: 16576,
  faltan: ["NIE", "Código postal", "Horas de jornada"],
  avisos: ["El precontrato no indica el grupo de cotización."],
  etapa: {
    clave: "REVISION", tono: "ambar", asesor: "Revisando documentos",
    cliente: "En revisión", explica_cliente: "estamos mirando sus documentos uno por uno.",
  },
  recorrido: [
    { clave: "DATOS", tono: "azul", asesor: "Recogiendo datos", pasada: true },
    { clave: "REVISION", tono: "ambar", asesor: "Revisando documentos", actual: true },
    { clave: "PRESENTADO", tono: "violeta", asesor: "Presentado" },
    { clave: "RESUELTO", tono: "verde", asesor: "Resuelto" },
  ],
};

const EXP = {
  apellido1: "Quispe", apellido2: "Mamani", nombres: "Rosa Elena", sexo: "Mujer",
  pasaporte_numero: "PE1234567", nie: "", fecha_nacimiento: "1998-04-17",
  lugar_nacimiento: "Arequipa", pais_nacimiento: "Perú", nacionalidad: "Peruana",
  estado_civil: "Soltero/a", nombre_padre: "Juan Quispe", nombre_madre: "Elena Mamani",
  telefono: "+34 600 111 222", correo: "rosa@example.com",
  dom_direccion: "Calle Mayor", dom_numero: "12", dom_piso: "3ºB", dom_localidad: "Madrid",
  dom_cp: "", dom_provincia: "Madrid",
  emp_razon_social: "Construcciones Sol S.L.", emp_nif: "B12345678", emp_actividad: "Construcción",
  emp_cnae: "4121", emp_direccion: "Av. de América 5", emp_localidad: "Madrid", emp_cp: "28002",
  emp_provincia: "Madrid", emp_telefono: "", emp_correo: "rrhh@sol.example",
  con_puesto: "Ingeniera de obra", con_retribucion: "24.000", con_jornada_horas: "",
  con_duracion: "Indefinido", con_grupo_cotizacion: "", con_cno_sepe: "", con_codigo_convenio: "",
  con_denom_convenio: "Construcción de Madrid", con_codigo_contrato: "", con_denom_contrato: "",
  con_cuenta_cotizacion: "", con_centro_direccion: "Calle Alcalá", con_centro_numero: "200",
  con_centro_piso: "", con_centro_localidad: "Madrid", con_centro_cp: "", con_centro_provincia: "Madrid",
  hijos_escolarizacion: false, notas: "Trabaja de prácticas en la misma empresa desde marzo.",
  venc_tie: "2026-12-15", expediente_numero: "", expediente_justificante: "", expediente_nie: "",
  expediente_fecha: "",
  revision_solicitada_at: "2026-10-08T21:30:00Z", revision_nota: "Ya subí el contrato firmado.",
  carpeta_lista_at: null, presentacion_prevista: "",
  revision: REVISION,
};

const archivo = (id_documento, nombre, extra = {}) => ({
  id_documento, nombre, mime: "application/pdf", tamano: 219000,
  fecha: "2026-10-06T16:20:00Z", observaciones: [], en_drive: true, ...extra,
});

const RANURAS = {
  pasaporte: {
    grupo: "extranjero", etiqueta: "Pasaporte completo", obligatorio: true, estado: "APROBADO",
    de: "extranjero", requisito: "Todas las páginas, en un solo PDF.",
    archivos: [archivo(501, "pasaporte.pdf", { subido_por_quien: "Rosa Quispe" })],
  },
  tie: {
    grupo: "extranjero", etiqueta: "TIE de estudiante", obligatorio: true, estado: "OBSERVADO",
    de: "extranjero",
    archivos: [
      archivo(502, "tie-anverso.jpg", {
        mime: "image/jpeg", subido_por_quien: "Rosa Quispe", en_drive: false,
        drive_error: "Cuota de Drive superada",
        observaciones: [
          { id_observacion: 9001, texto: "Falta el reverso de la tarjeta.", avisada_at: "2026-10-07T15:00:00Z" },
          { id_observacion: 9002, texto: "La foto está cortada por arriba.", avisada_at: null },
        ],
      }),
      archivo(499, "tie-viejo.jpg", { mime: "image/jpeg" }),
    ],
  },
  empadronamiento: {
    grupo: "extranjero", etiqueta: "Certificado de empadronamiento", obligatorio: true,
    estado: "SIN_SUBIR", de: "extranjero", requisito: "Expedido hace menos de 90 días.", archivos: [],
  },
  antecedentes: {
    grupo: "extranjero", etiqueta: "Antecedentes penales", obligatorio: false, estado: "SIN_SUBIR",
    de: "extranjero", archivos: [],
  },
  precontrato: {
    grupo: "empresa", etiqueta: "Precontrato de trabajo", obligatorio: true, estado: "PENDIENTE",
    de: "empresa",
    archivos: [archivo(503, "precontrato-firmado.pdf", { subido_por_quien: "Carina Meza", en_drive: false })],
  },
  emp_autorizacion: {
    grupo: "empresa", etiqueta: "Carta de representación de la empresa", obligatorio: true,
    estado: "SIN_SUBIR", de: "asesor", archivos: [],
  },
  formulario: {
    grupo: "inspira", etiqueta: "Formulario EX-03", obligatorio: true, estado: "APROBADO", de: "asesor",
    archivos: [archivo(504, "EX03-quispe.pdf", { subido_por_quien: "Carina Meza" })],
  },
  otros_asesor: {
    grupo: "inspira", etiqueta: "Carta del asesorado", obligatorio: false, estado: "SIN_SUBIR",
    de: "asesor", archivos: [],
  },
  justificante: {
    grupo: "presentacion", etiqueta: "Justificante de registro", obligatorio: false, estado: "PENDIENTE",
    de: "asesor", archivos: [archivo(600, "justificante-mercurio.pdf")],
  },
};

const REGISTROS = [
  {
    id_registro: 31, tipo: "REQUERIMIENTO", tipo_label: "Requerimiento", titulo: "Aportar contrato firmado",
    notificado_at: "2026-10-02T12:00:00Z", plazo: "2026-10-22", tiene_archivo: true,
    archivo_nombre: "requerimiento.pdf",
  },
  {
    id_registro: 32, tipo: "RESOLUCION", tipo_label: "Resolución", titulo: "Resolución favorable",
    notificado_at: null, plazo: null, tiene_archivo: false,
  },
  { id_registro: 33, tipo: "TASA", tipo_label: "Solicitud de tasa", titulo: "Tasa 790-052", notificado_at: null },
  {
    id_registro: 34, tipo: "NOTIFICACION", tipo_label: "Notificación", titulo: "Escaneo de la sede",
    sin_clasificar: true, tiene_archivo: true, archivo_nombre: "escaneo-0412.pdf",
  },
  {
    id_registro: 35, tipo: "NOTIFICACION", tipo_label: "Notificación", titulo: "Documento sin nombre",
    sin_clasificar: true, tiene_archivo: false,
  },
];

const INVITADOS = {
  ok: true, maximo: 2,
  invitados: [{
    id_invitado: 1, correo: "hermana@example.com", quien: "Su hermana",
    aceptado_at: "2026-10-01T10:00:00Z", puede_editar: false,
  }],
};

let respuestas;
function respuestasPorDefecto() {
  return {
    [`${BASE}/modificatoria`]: { ok: true, expediente: EXP },
    [`${BASE}/modificatoria/documentos`]: { ok: true, ranuras: RANURAS },
    [`${BASE}/modificatoria/extranjeria`]: { ok: true, registros: REGISTROS },
    [`${BASE}/invitados`]: INVITADOS,
  };
}

/** Otro expediente: carpeta cerrada, todo aprobado, sin justificante y condiciones que fallan. */
function expedienteCerrado() {
  const ranuras = {
    pasaporte: RANURAS.pasaporte,
    formulario: RANURAS.formulario,
    otros_asesor: RANURAS.otros_asesor,
    justificante: { ...RANURAS.justificante, estado: "SIN_SUBIR", archivos: [] },
  };
  return {
    [`${BASE}/modificatoria`]: {
      ok: true,
      expediente: {
        ...EXP,
        con_retribucion: "12000", con_jornada_horas: "30", con_duracion: "6 meses",
        hijos_escolarizacion: null, notas: "", fecha_nacimiento: "",
        revision_solicitada_at: null, revision_nota: null,
        carpeta_lista_at: "2026-10-05T10:00:00Z", presentacion_prevista: "2026-10-20",
        expediente_numero: "MAD-2026-001234", expediente_nie: "Y1234567X",
        revision: { faltan: [], avisos: [] },
      },
    },
    [`${BASE}/modificatoria/documentos`]: { ok: true, ranuras },
    [`${BASE}/modificatoria/extranjeria`]: { ok: true, registros: REGISTROS.slice(3) },
    [`${BASE}/invitados`]: { ok: true, invitados: [], maximo: 2 },
  };
}

/** HTML exacto, con un salto entre etiquetas para que el diff se lea. */
const html = (c) => c.innerHTML.replace(/></g, ">\n<");
/** Deja que terminen las promesas de los fetch simulados. */
const esperar = async () => { for (let i = 0; i < 3; i++) await act(() => new Promise((r) => setTimeout(r, 0))); };
/** Espera de verdad (el guardado de la ficha va con un temporizador de 900 ms). */
const dormir = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));

async function montar() {
  const r = render(<ModificatoriaAdmin idSolicitud={ID} />);
  await esperar();
  return r;
}

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ["Date"] });
  respuestas = respuestasPorDefecto();
  boGET.mockImplementation((ruta) => Promise.resolve(respuestas[ruta]));
  pedirArchivo.mockResolvedValue({ error: "No se pudo descargar el archivo" });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  if (zonaOriginal === undefined) delete globalThis.process.env.TZ;
  else globalThis.process.env.TZ = zonaOriginal;
});

describe("ModificatoriaAdmin — carga", () => {
  it("cargando: el expediente no llega", async () => {
    respuestas[`${BASE}/modificatoria`] = { ok: false, msg: "No existe" };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("expediente completo en revisión", async () => {
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("carpeta cerrada, todo aprobado y justificante por clasificar", async () => {
    respuestas = expedienteCerrado();
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("sin documentos ni comunicaciones (fallan esas dos llamadas)", async () => {
    respuestas[`${BASE}/modificatoria/documentos`] = { ok: false };
    respuestas[`${BASE}/modificatoria/extranjeria`] = { ok: false };
    respuestas[`${BASE}/modificatoria`] = {
      ok: true, expediente: { ...EXP, revision: undefined, revision_solicitada_at: null },
    };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });
});

describe("ModificatoriaAdmin — interacciones", () => {
  it("mover el expediente de etapa", async () => {
    const { container } = await montar();
    let responder;
    boPATCH.mockImplementationOnce(() => new Promise((r) => { responder = r; }));
    fireEvent.click(screen.getByText("Presentado"));
    expect(boPATCH).toHaveBeenCalledWith(`${BASE}/modificatoria`, { estado_proceso: "PRESENTADO" });
    expect(html(container)).toMatchSnapshot("guardando");
    await act(async () => {
      responder({
        ok: true,
        expediente: {
          ...EXP,
          revision: {
            ...REVISION,
            etapa: { ...REVISION.etapa, clave: "PRESENTADO", tono: "violeta", asesor: "Presentado" },
            recorrido: REVISION.recorrido.map((e) => ({
              ...e, actual: e.clave === "PRESENTADO", pasada: ["DATOS", "REVISION"].includes(e.clave),
            })),
          },
        },
      });
    });
    expect(html(container)).toMatchSnapshot("movido");
  });

  it("la ficha en edición, con un cambio que se guarda solo", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("✎ Editar"));
    expect(html(container)).toMatchSnapshot("editable");

    boPATCH.mockResolvedValueOnce({ ok: true, expediente: { ...EXP, con_retribucion: "12000" } });
    const sueldo = container.querySelector('span[title="Retribución bruta anual"]').nextElementSibling;
    fireEvent.change(sueldo, { target: { value: "12000" } });
    expect(html(container)).toMatchSnapshot("sin guardar");

    await dormir(1000);
    expect(boPATCH).toHaveBeenCalledWith(`${BASE}/modificatoria`, { con_retribucion: "12000" });
    expect(html(container)).toMatchSnapshot("guardado");
  });

  it("revisar documentos: editar una observación, observar otro, subir y abrir el visor", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getAllByText("editar")[0]);
    fireEvent.click(screen.getAllByText("Observar")[1]);
    fireEvent.change(screen.getByPlaceholderText("Qué tiene que corregir…"), {
      target: { value: "Falta la firma de la empresa" },
    });
    expect(html(container)).toMatchSnapshot("observando");

    boFetch.mockImplementationOnce(() => new Promise(() => {}));
    const subir = screen.getAllByText("subir")[0].querySelector("input");
    fireEvent.change(subir, { target: { files: [new File(["x"], "carta.pdf", { type: "application/pdf" })] } });
    expect(boFetch).toHaveBeenCalledWith(`${BASE}/modificatoria/documentos/emp_autorizacion`, expect.anything());

    fireEvent.click(screen.getByText("📄 pasaporte.pdf"));
    await esperar();
    expect(html(container)).toMatchSnapshot("subiendo y visor abierto");
  });

  it("cerrar la carpeta con documentos sin aprobar", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("Cerrar carpeta"));
    expect(html(container)).toMatchSnapshot();
  });

  it("reenviar el aviso de una carpeta ya cerrada", async () => {
    respuestas = expedienteCerrado();
    const { container } = await montar();
    fireEvent.click(screen.getByText("Revisar y reenviar"));
    expect(html(container)).toMatchSnapshot();
  });

  it("registrar una comunicación de extranjería", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("+ Registrar comunicación"));
    fireEvent.change(screen.getByPlaceholderText("Título"), { target: { value: "Requerimiento de tasa" } });
    const adjunto = screen.getByText("📎 Adjuntar documento").querySelector("input");
    fireEvent.change(adjunto, {
      target: { files: [new File(["x"], "requerimiento-de-subsanacion-2026.pdf", { type: "application/pdf" })] },
    });
    expect(html(container)).toMatchSnapshot();
  });
});
