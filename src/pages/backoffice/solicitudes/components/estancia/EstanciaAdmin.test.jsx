// @vitest-environment jsdom
//
// Instantáneas del HTML del panel de estancia (09/10/2026). Se tomaron ANTES
// de partir EstanciaAdmin.jsx en piezas y sirven para eso: si un refactor
// cambia una clase, un texto o el orden de algo, falla. Si el cambio es a
// propósito, se regeneran con `npx vitest run -u` y se revisa el diff del .snap.
//
// Reloj y zona fijos (viernes 09/10/2026 10:20 en Lima): las fechas del
// expediente se pintan con la zona del navegador, y los hijos (el aviso de
// cierre, los impresos) miran "hoy".
//
// Los hijos de otros archivos (Invitados, Acompañantes, Recordatorio, Cierre,
// Generadores, VisorArchivo) se pintan de verdad: solo se simulan los
// servicios de red, archivos y diálogos.
//
// vitest.config.js no carga el plugin de React, así que aquí el JSX se compila
// en modo clásico (React.createElement) y los componentes no importan React:
// se expone como global antes de cargar nada.
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
vi.mock("../../../../../services/dialogService", () => ({
  dialog: { toast: vi.fn(), confirm: vi.fn(), prompt: vi.fn() },
}));
vi.mock("../../../../../services/archivos", () => ({
  abrirArchivo: vi.fn(), descargarArchivo: vi.fn(), pedirArchivo: vi.fn(),
}));

import { render, fireEvent, act, cleanup, screen, within } from "@testing-library/react";
import { boGET, boPOST, boPATCH, boDELETE, boFetch } from "../../../../../services/backofficeApi";
import { dialog } from "../../../../../services/dialogService";
import { abrirArchivo, pedirArchivo } from "../../../../../services/archivos";
import EstanciaAdmin from "./EstanciaAdmin";

const AHORA = new Date("2026-10-09T10:20:00-05:00");
const ID = 42;
const BASE = `/backoffice/solicitudes/${ID}`;

const REVISION = {
  etapa: {
    tono: "ambar", asesor: "Revisando documentos", cliente: "En revisión",
    explica_cliente: "Estamos revisando lo que ha subido.",
  },
  recorrido: [
    { clave: "DATOS", tono: "azul", asesor: "Recogiendo datos", pasada: true },
    { clave: "REVISION", tono: "ambar", asesor: "Revisando documentos", actual: true },
    { clave: "PRESENTADO", tono: "violeta", asesor: "Presentado" },
    { clave: "FAVORABLE", tono: "verde", asesor: "Favorable" },
  ],
  faltan: ["Nombre del padre", "Domicilio en España", "Fecha de llegada a España"],
  plazos: {
    antelacion: { a_tiempo: false, limite: "01/08/2026", dias_restantes: -69 },
    tope: { a_tiempo: true, limite: "08/11/2026", dias_restantes: 30 },
    escrito_excepcionalidad: true,
  },
  avisos: ["El pasaporte caduca antes de que acabe el programa."],
};

const EXPEDIENTE = {
  apellido1: "Quispe", apellido2: "Huamán", nombres: "Rosa María", sexo: "Mujer",
  fecha_nacimiento: "1998-04-12", lugar_nacimiento: "Cusco", pais_nacimiento: "Perú",
  nacionalidad: "Peruana", estado_civil: "Soltero/a", nombre_padre: "", nombre_madre: "Juana Huamán",
  pasaporte_numero: "PE1234567", dni: "45678901", pasaporte_emision: "2022-01-10",
  pasaporte_caducidad: "2027-01-10", correo: "rosa@example.com", telefono: "+51 999 111 222",
  fecha_admision: "2026-06-01", fecha_llegada_espana: "", fecha_inicio_clases: "2026-10-01",
  prog_fin: "2027-07-15", uni_denominacion: "Universidad de Salamanca",
  prog_denominacion: "Máster en Derecho Ambiental", tipo_estudios: "MASTER", tipo_titulo: "OFICIAL",
  master_tipo: "OFICIAL", creditos: "60", prog_modalidad: "PRESENCIAL", prog_codigo: "4312345",
  uni_direccion: "Patio de Escuelas 1", uni_localidad: "Salamanca", uni_cp: "37008",
  uni_provincia: "Salamanca", uni_registro_tipo: "RUCT", uni_registro_num: "4312345",
  dom_direccion: "", dom_numero: "", dom_piso: "", dom_localidad: "Salamanca", dom_cp: "",
  dom_provincia: "Salamanca", dom_usa_universidad: false, viaje_schengen_180: true,
  notas: "Tuvo un NIE de estudiante en 2019.",
  expediente_numero: "SA/123/2026", expediente_justificante: "I-2026-000123",
  expediente_nie: "Y1234567Z", expediente_fecha: "2026-09-20",
  consulta_estado: "EN_TRAMITE", consulta_fecha: "2026-10-05T15:30:00Z", consulta_por: "Carina Meza",
  revision_solicitada_at: "2026-10-08T21:15:00Z", revision_nota: "Ya subí el seguro corregido.",
  abogada_email: "letrada@despacho.com", abogada_avisada_at: "2026-10-02T14:00:00Z",
  presentacion_prevista: "2026-10-15", carpeta_lista_at: "2026-10-01T16:00:00Z",
  con_acompanantes: false,
  revision: REVISION,
};

const archivo = (id, nombre, extra = {}) => ({
  id_documento: id, nombre, mime: "application/pdf", tamano: 51200,
  fecha: "2026-10-06T15:00:00Z", en_drive: true, observaciones: [], ...extra,
});

const RANURAS = {
  pasaporte: {
    de: "cliente", etiqueta: "Pasaporte completo", obligatorio: true, estado: "APROBADO",
    requisito: "Todas las hojas, en color.",
    archivos: [archivo(101, "pasaporte.pdf", { subido_por_quien: "Rosa Quispe", tamano: 219000 })],
  },
  seguro: {
    de: "cliente", etiqueta: "Seguro médico", obligatorio: true, estado: "OBSERVADO",
    modelo: "/modelos/seguro.pdf",
    archivos: [
      archivo(102, "seguro-v2.pdf", {
        subido_por_quien: "Rosa Quispe", en_drive: false, drive_error: "Cuota de Drive superada",
        observaciones: [
          { id_observacion: 1, texto: "No cubre repatriación.", avisada_at: "2026-10-03T12:00:00Z" },
          { id_observacion: 2, texto: "Falta el sello de la aseguradora.", avisada_at: null },
        ],
      }),
      archivo(103, "seguro.pdf"),
    ],
  },
  fondos: {
    de: "cliente", etiqueta: "Medios económicos", obligatorio: true, estado: "PENDIENTE",
    requisito: "Extractos de los últimos 6 meses.",
    archivos: [archivo(104, "extractos.pdf", { subido_por_quien: "Carina Meza", en_drive: false, mime: null })],
  },
  antecedentes: { de: "cliente", etiqueta: "Antecedentes penales", obligatorio: true, estado: "SIN_SUBIR", archivos: [] },
  foto: { de: "cliente", etiqueta: "Fotografía", obligatorio: false, estado: "SIN_SUBIR", archivos: [] },
  ex00: { de: "asesor", etiqueta: "EX-00 firmado", obligatorio: true, estado: "SIN_SUBIR", archivos: [] },
  representacion: {
    de: "asesor", etiqueta: "Carta de representación", obligatorio: false, estado: "APROBADO",
    archivos: [archivo(105, "representacion.pdf")],
  },
  justificante: {
    de: "asesor", etiqueta: "Justificante de registro", obligatorio: false, estado: "PENDIENTE",
    archivos: [archivo(106, "justificante-mercurio.pdf", { fecha: "2026-10-07T17:30:00Z" })],
  },
};

const REGISTROS = [
  {
    id_registro: 7, tipo: "REQUERIMIENTO", tipo_label: "Requerimiento", titulo: "Aportar seguro sin copago",
    plazo: "2026-10-20", notificado_at: "2026-10-05T12:00:00Z", tiene_archivo: true,
    archivo_nombre: "requerimiento.pdf",
  },
  { id_registro: 8, tipo: "RESOLUCION", tipo_label: "Resolución", titulo: "Resolución favorable", notificado_at: null },
  { id_registro: 9, tipo: "TASA", tipo_label: "Solicitud de tasa", titulo: "Tasa 790-052", notificado_at: null },
];

const SIN_CLASIFICAR = [
  { id_registro: 11, sin_clasificar: true, titulo: "Escaneo_0042", archivo_nombre: "Escaneo_0042.pdf" },
  { id_registro: 12, sin_clasificar: true, titulo: "Documento recibido" },
];

let respuestas;
function respuestasPorDefecto() {
  return {
    [`${BASE}/estancia`]: { ok: true, expediente: EXPEDIENTE },
    [`${BASE}/estancia/documentos`]: { ok: true, ranuras: RANURAS },
    [`${BASE}/estancia/extranjeria`]: { ok: true, registros: REGISTROS },
    [`${BASE}/invitados`]: { ok: true, invitados: [], maximo: 2 },
    [`${BASE}/estancia/acompanantes`]: { ok: true, acompanantes: [] },
    [`${BASE}/estancia/carpeta-drive`]: { ok: true, url: "https://drive.google.com/drive/folders/abc" },
  };
}

/** HTML exacto, con un salto entre etiquetas para que el diff se lea. */
const html = (c) => c.innerHTML.replace(/></g, ">\n<");
/** Deja que terminen las promesas de los fetch simulados. */
const esperar = async () => { for (let i = 0; i < 3; i++) await act(() => new Promise((r) => setTimeout(r, 0))); };
/** El recuadro de una sección, por su título. */
const bloque = (titulo) => screen.getByText(titulo).closest("div.rounded-xl");
/** La fila de un documento, por su etiqueta. */
const fila = (etiqueta) => within(document.getElementById("bloque-documentos"))
  .getByText(etiqueta).closest("div.rounded-xl");

async function montar() {
  const r = render(<EstanciaAdmin idSolicitud={ID} />);
  await esperar();
  return r;
}

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ["Date"] });
  respuestas = respuestasPorDefecto();
  boGET.mockImplementation((ruta) => Promise.resolve(respuestas[ruta]));
  boPOST.mockResolvedValue({ ok: true, msg: "Hecho" });
  boPATCH.mockResolvedValue({ ok: true, expediente: EXPEDIENTE });
  boDELETE.mockResolvedValue({ ok: true });
  boFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true, msg: "Registrado" }) });
  dialog.confirm.mockResolvedValue(true);
  pedirArchivo.mockResolvedValue({ error: "No se pudo cargar el documento" });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

afterAll(() => {
  if (zonaOriginal === undefined) delete globalThis.process.env.TZ;
  else globalThis.process.env.TZ = zonaOriginal;
});

describe("EstanciaAdmin — estados de carga", () => {
  it("cargando", () => {
    boGET.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<EstanciaAdmin idSolicitud={ID} />);
    expect(html(container)).toMatchSnapshot();
  });

  it("expediente completo", async () => {
    const { container } = await montar();
    expect(boGET).toHaveBeenCalledWith(`${BASE}/estancia`);
    expect(boGET).toHaveBeenCalledWith(`${BASE}/estancia/documentos`);
    expect(boGET).toHaveBeenCalledWith(`${BASE}/estancia/extranjeria`);
    expect(html(container)).toMatchSnapshot();
  });

  it("expediente recién abierto", async () => {
    respuestas[`${BASE}/estancia`] = {
      ok: true,
      expediente: {
        nombres: "Luis", correo: "luis@example.com", con_acompanantes: true,
        revision: {
          recorrido: [], faltan: ["Primer apellido", "Sexo", "Fecha de nacimiento", "Nº de pasaporte"],
          plazos: { antelacion: null, tope: null },
        },
      },
    };
    respuestas[`${BASE}/estancia/documentos`] = {
      ok: true,
      ranuras: Object.fromEntries(Object.entries(RANURAS).map(([k, d]) => [
        k, { ...d, estado: "SIN_SUBIR", archivos: [] },
      ])),
    };
    respuestas[`${BASE}/estancia/extranjeria`] = { ok: true, registros: [] };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("documentos y extranjería sin responder", async () => {
    respuestas[`${BASE}/estancia/documentos`] = { ok: false };
    respuestas[`${BASE}/estancia/extranjeria`] = { ok: false };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("todo aprobado y sin cerrar", async () => {
    respuestas[`${BASE}/estancia`] = {
      ok: true,
      expediente: {
        ...EXPEDIENTE, carpeta_lista_at: null, abogada_avisada_at: null, abogada_email: null,
        revision_solicitada_at: null, notas: "", consulta_fecha: null, dom_usa_universidad: true,
        viaje_schengen_180: null,
        revision: { ...REVISION, faltan: [], avisos: [], plazos: { ...REVISION.plazos, escrito_excepcionalidad: false } },
      },
    };
    respuestas[`${BASE}/estancia/documentos`] = {
      ok: true,
      ranuras: Object.fromEntries(Object.entries(RANURAS).map(([k, d], i) => [
        k, d.obligatorio ? { ...d, estado: "APROBADO", archivos: [archivo(200 + i, `${k}.pdf`)] } : d,
      ])),
    };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });
});

describe("EstanciaAdmin — flujo y datos", () => {
  it("mover el expediente: guardando y guardado", async () => {
    let resolver;
    boPATCH.mockImplementation(() => new Promise((r) => { resolver = r; }));
    await montar();
    fireEvent.click(within(bloque("Dónde está el expediente")).getByText("Presentado"));
    expect(boPATCH).toHaveBeenCalledWith(`${BASE}/estancia`, { estado_proceso: "PRESENTADO" });
    expect(html(bloque("Dónde está el expediente"))).toMatchSnapshot("guardando");
    await act(async () => resolver({
      ok: true,
      expediente: {
        ...EXPEDIENTE,
        revision: {
          ...REVISION,
          etapa: { tono: "violeta", asesor: "Presentado", cliente: "Presentado", explica_cliente: "Ya está en Extranjería." },
          recorrido: REVISION.recorrido.map((e) => ({
            ...e, actual: e.clave === "PRESENTADO", pasada: e.clave !== "PRESENTADO" && e.clave !== "FAVORABLE",
          })),
        },
      },
    }));
    expect(html(bloque("Dónde está el expediente"))).toMatchSnapshot("guardado");
    fireEvent.click(within(bloque("Dónde está el expediente")).getByText("Desfavorable"));
    expect(boPATCH).toHaveBeenLastCalledWith(`${BASE}/estancia`, { estado_proceso: "DESFAVORABLE" });
  });

  it("ficha en edición y guardado automático de lo tocado", async () => {
    await montar();
    fireEvent.click(screen.getByText("✎ Editar"));
    expect(html(document.getElementById("bloque-datos"))).toMatchSnapshot("editando");

    const datos = document.getElementById("bloque-datos");
    const nombres = within(datos).getByText("Nombres").closest("label").querySelector("input");
    fireEvent.change(nombres, { target: { value: "Rosa" } });
    fireEvent.click(within(datos).getByText("Usa la dirección de la universidad").closest("label").querySelector("input"));
    fireEvent.change(within(datos).getByText("Schengen 180 días").closest("label").querySelector("select"),
      { target: { value: "no" } });
    expect(html(datos)).toMatchSnapshot("sin guardar");

    await act(() => new Promise((r) => setTimeout(r, 1000)));
    expect(boPATCH).toHaveBeenCalledWith(`${BASE}/estancia`, {
      nombres: "Rosa", dom_usa_universidad: true, viaje_schengen_180: false,
    });
    await esperar();
    fireEvent.click(screen.getByText("✓ Listo"));
    expect(html(datos)).toMatchSnapshot("de vuelta a la vista");
  });

  it("seguimiento en extranjería: se guarda al salir del campo", async () => {
    await montar();
    const datos = document.getElementById("bloque-datos");
    const numero = within(datos).getByText("Nº expediente").closest("label").querySelector("input");
    fireEvent.change(numero, { target: { value: "SA/999/2026" } });
    fireEvent.blur(numero);
    expect(boPATCH).toHaveBeenCalledWith(`${BASE}/estancia`, { expediente_numero: "SA/999/2026" });
    fireEvent.change(within(datos).getByText("Estado en consulta").closest("label").querySelector("select"),
      { target: { value: "REQUERIDO" } });
    expect(boPATCH).toHaveBeenLastCalledWith(`${BASE}/estancia`, { consulta_estado: "REQUERIDO" });
  });
});

describe("EstanciaAdmin — documentos", () => {
  it("observar un documento por revisar", async () => {
    await montar();
    fireEvent.click(within(fila("Medios económicos")).getByText("Observar"));
    expect(html(fila("Medios económicos"))).toMatchSnapshot("observando");
    const entrada = fila("Medios económicos").querySelector("input:not([type])");
    fireEvent.change(entrada, { target: { value: "Faltan dos meses" } });
    fireEvent.click(within(fila("Medios económicos")).getByText("Observar"));
    expect(boPATCH).toHaveBeenCalledWith(
      `${BASE}/estancia/documentos/archivo/104/revision`,
      { estado: "OBSERVADO", observacion: "Faltan dos meses" },
    );
    await esperar();
    expect(html(fila("Medios económicos"))).toMatchSnapshot("tras observar");
  });

  it("aprobar y añadir observación a uno ya observado", async () => {
    await montar();
    fireEvent.click(within(fila("Medios económicos")).getByText("Aprobar"));
    expect(boPATCH).toHaveBeenCalledWith(
      `${BASE}/estancia/documentos/archivo/104/revision`, { estado: "APROBADO", observacion: undefined },
    );
    await esperar();
    fireEvent.click(within(fila("Seguro médico")).getByText("+ observación"));
    const entrada = fila("Seguro médico").querySelector("input[placeholder]");
    fireEvent.change(entrada, { target: { value: "Otra más" } });
    fireEvent.keyDown(entrada, { key: "Enter" });
    expect(boPOST).toHaveBeenCalledWith(
      `${BASE}/estancia/documentos/archivo/102/observaciones`, { texto: "Otra más" },
    );
  });

  it("editar y retirar una observación", async () => {
    await montar();
    fireEvent.click(within(fila("Seguro médico")).getAllByText("editar")[1]);
    expect(html(fila("Seguro médico"))).toMatchSnapshot("editando observación");
    const entrada = fila("Seguro médico").querySelector("input:not([type]):not([placeholder])");
    fireEvent.change(entrada, { target: { value: "Falta el sello y la firma." } });
    fireEvent.keyDown(entrada, { key: "Enter" });
    expect(boPATCH).toHaveBeenCalledWith(
      `${BASE}/estancia/observaciones/2`, { texto: "Falta el sello y la firma." },
    );
    await esperar();
    fireEvent.click(within(fila("Seguro médico")).getAllByTitle("Retirar")[0]);
    await esperar();
    expect(dialog.confirm).toHaveBeenCalledWith("¿Retirar esta observación?");
    expect(boDELETE).toHaveBeenCalledWith(`${BASE}/estancia/observaciones/1`);
  });

  it("visor con aprobar desde dentro", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("📄 extractos.pdf"));
    await esperar();
    expect(pedirArchivo).toHaveBeenCalledWith(`${BASE}/estancia/documentos/archivo/104`, { interno: true });
    expect(html(container.querySelector(".fixed"))).toMatchSnapshot("visor");
    fireEvent.click(within(container.querySelector(".fixed")).getByText("Aprobar"));
    expect(boPATCH).toHaveBeenCalledWith(
      `${BASE}/estancia/documentos/archivo/104/revision`, { estado: "APROBADO", observacion: null },
    );
    await esperar();
    expect(container.querySelector(".fixed")).toBeNull();
  });

  it("subir uno de Inspira, reponer Drive y abrir la carpeta", async () => {
    let terminar;
    boFetch.mockImplementation(() => new Promise((r) => { terminar = r; }));
    const ventana = { opener: {}, location: { replace: vi.fn() }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(ventana);
    await montar();

    const pdf = new File(["%PDF"], "ex00.pdf", { type: "application/pdf" });
    fireEvent.change(fila("EX-00 firmado").querySelector("input[type=file]"), { target: { files: [pdf] } });
    expect(boFetch).toHaveBeenCalledWith(`${BASE}/estancia/documentos/ex00`, expect.objectContaining({ method: "POST" }));
    expect(html(fila("EX-00 firmado"))).toMatchSnapshot("subiendo");
    await act(async () => terminar({ ok: true }));
    await esperar();

    fireEvent.click(screen.getByText("Subirlos a Drive"));
    expect(boPOST).toHaveBeenCalledWith(`${BASE}/estancia/reponer-drive`);
    await esperar();
    expect(dialog.toast).toHaveBeenCalledWith("Hecho", "exito");

    fireEvent.click(screen.getByText("📁 Abrir carpeta del asesorado"));
    await esperar();
    expect(window.open).toHaveBeenCalledWith("", "_blank");
    expect(ventana.opener).toBeNull();
    expect(ventana.location.replace).toHaveBeenCalledWith("https://drive.google.com/drive/folders/abc");
  });
});

describe("EstanciaAdmin — cierre, abogada y presentación", () => {
  it("cerrar la carpeta otra vez con documentos sin aprobar", async () => {
    boPOST.mockResolvedValue({ ok: true, msg: "Aviso reenviado" });
    await montar();
    fireEvent.click(screen.getByText("Revisar y reenviar"));
    expect(html(bloque("Cerrar la carpeta"))).toMatchSnapshot("formulario");
    fireEvent.click(screen.getByText("Reenviar aviso"));
    expect(boPOST).toHaveBeenCalledWith(`${BASE}/estancia/carpeta-lista`, {
      presentacion_prevista: "2026-10-15", avisar: true,
    });
    await esperar();
    expect(html(bloque("Cerrar la carpeta"))).toMatchSnapshot("reenviada");
  });

  it("pasársela a la abogada", async () => {
    boPOST.mockResolvedValue({ ok: true, para: "otra@despacho.com", carpeta: true, acceso: { nuevo: true } });
    await montar();
    fireEvent.click(screen.getByText("Volver a enviar"));
    const caja = bloque("Pasársela a la abogada");
    fireEvent.change(caja.querySelector("input[type=email]"), { target: { value: " otra@despacho.com " } });
    fireEvent.change(caja.querySelector("textarea"), { target: { value: "Ojo con el seguro" } });
    expect(html(caja)).toMatchSnapshot("formulario");
    fireEvent.click(within(caja).getByText("Enviar"));
    expect(boPOST).toHaveBeenCalledWith(`${BASE}/estancia/avisar-abogada`, {
      para: "otra@despacho.com", nota: "Ojo con el seguro",
    });
    await esperar();
    expect(html(bloque("Pasársela a la abogada"))).toMatchSnapshot("enviado");
  });

  it("abogada: fallo y primera vez", async () => {
    boPOST.mockResolvedValue({ ok: false, msg: "Correo no válido" });
    respuestas[`${BASE}/estancia`] = {
      ok: true, expediente: { ...EXPEDIENTE, abogada_avisada_at: null, abogada_email: null },
    };
    await montar();
    expect(html(bloque("Pasársela a la abogada"))).toMatchSnapshot("sin avisar");
    fireEvent.click(screen.getByText("Enviar a la abogada"));
    fireEvent.change(bloque("Pasársela a la abogada").querySelector("input[type=email]"), { target: { value: "x@y" } });
    fireEvent.click(within(bloque("Pasársela a la abogada")).getByText("Enviar"));
    await esperar();
    expect(html(bloque("Pasársela a la abogada"))).toMatchSnapshot("error");
  });

  it("justificante: verlo y mandar la guía", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("Ver el justificante"));
    await esperar();
    expect(html(container.querySelector(".fixed"))).toMatchSnapshot("visor del justificante");
    fireEvent.click(screen.getByLabelText("Cerrar"));
    fireEvent.click(screen.getByText("Mandarle la guía"));
    expect(html(bloque("Presentado ante Extranjería"))).toMatchSnapshot("enviando la guía");
    expect(boPOST).toHaveBeenCalledWith(`${BASE}/estancia/explicar-seguimiento`);
    await esperar();
    expect(dialog.toast).toHaveBeenCalledWith("Hecho", "exito");
  });

  it("candidatos del vigilante y registros sin clasificar", async () => {
    const { justificante: _j, ...sinJustificante } = RANURAS;
    respuestas[`${BASE}/estancia/documentos`] = { ok: true, ranuras: sinJustificante };
    respuestas[`${BASE}/estancia/extranjeria`] = { ok: true, registros: [...SIN_CLASIFICAR, ...REGISTROS] };
    await montar();
    expect(html(bloque("Presentado ante Extranjería"))).toMatchSnapshot("presentado con candidatos");
    expect(html(document.getElementById("bloque-extranjeria"))).toMatchSnapshot("extranjería con sin clasificar");

    let adoptar;
    boPOST.mockImplementation(() => new Promise((r) => { adoptar = r; }));
    fireEvent.click(within(bloque("Presentado ante Extranjería")).getAllByText("Es el justificante")[0]);
    expect(boPOST).toHaveBeenCalledWith(`${BASE}/estancia/extranjeria/11/es-justificante`);
    expect(html(bloque("Presentado ante Extranjería"))).toMatchSnapshot("adoptando");
    await act(async () => adoptar({ ok: true }));
    await esperar();

    boPATCH.mockResolvedValue({ ok: false, msg: "Falta la fecha" });
    const tarjeta = within(document.getElementById("bloque-extranjeria"))
      .getByText("Escaneo_0042").closest("div.rounded-lg");
    fireEvent.change(tarjeta.querySelector("select"), { target: { value: "REQUERIMIENTO" } });
    fireEvent.change(tarjeta.querySelectorAll("input[type=date]")[1], { target: { value: "2026-10-25" } });
    fireEvent.click(tarjeta.querySelector("input[type=checkbox]"));
    fireEvent.click(within(tarjeta).getByText("Clasificar y avisar"));
    expect(boPATCH).toHaveBeenCalledWith(`${BASE}/estancia/extranjeria/11`, {
      tipo: "REQUERIMIENTO", titulo: "Escaneo_0042", fecha: "", plazo: "2026-10-25", avisar: false,
    });
    await esperar();
    expect(html(tarjeta)).toMatchSnapshot("clasificar con error");
  });

  it("registrar una comunicación de extranjería", async () => {
    await montar();
    const ext = document.getElementById("bloque-extranjeria");
    fireEvent.click(within(ext).getByText("📄 requerimiento.pdf"));
    expect(abrirArchivo).toHaveBeenCalledWith(`${BASE}/estancia/extranjeria/7/archivo`, { interno: true });

    fireEvent.click(within(ext).getByText("+ Registrar comunicación"));
    fireEvent.change(ext.querySelector("input[placeholder=Título]"), { target: { value: "Requerimiento de seguro" } });
    fireEvent.change(ext.querySelector("textarea"), { target: { value: "Hay que aportar otro seguro." } });
    const adjunto = new File(["%PDF"], "requerimiento-seguro-sin-copago-2026.pdf", { type: "application/pdf" });
    fireEvent.change(ext.querySelector("input[type=file]"), { target: { files: [adjunto] } });
    expect(html(ext)).toMatchSnapshot("formulario");

    fireEvent.click(within(ext).getByText("Registrar"));
    expect(boFetch).toHaveBeenCalledWith(`${BASE}/estancia/extranjeria`, expect.objectContaining({ method: "POST" }));
    const enviado = boFetch.mock.calls.at(-1)[1].body;
    expect(Object.fromEntries(enviado.entries())).toMatchObject({
      tipo: "REQUERIMIENTO", titulo: "Requerimiento de seguro", detalle: "Hay que aportar otro seguro.", avisar: "true",
    });
    await esperar();
    expect(html(document.getElementById("bloque-extranjeria"))).toMatchSnapshot("registrada");
  });
});
