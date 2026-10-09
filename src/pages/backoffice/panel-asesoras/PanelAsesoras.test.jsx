// @vitest-environment jsdom
//
// Instantáneas del HTML del Panel asesoras (09/10/2026). Se tomaron ANTES de
// partir PanelAsesoras.jsx en piezas y sirven para eso: si un refactor cambia
// una clase, un texto o el orden de algo, falla. Si el cambio es a propósito,
// se regeneran con `npx vitest run -u` y se revisa el diff del .snap.
//
// También se guardan las llamadas a la API (cuerpos de PATCH/POST/DELETE) al
// crear, editar y quitar: el formulario arma el cuerpo a mano y un campo
// perdido no se vería en el HTML.
//
// Reloj y zona fijos (viernes 09/10/2026 10:20 en Lima) para que nada dependa
// de "ahora" (el nombre de la descarga JSON usa la fecha del día).
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

vi.mock("../../../services/backofficeApi", () => ({
  boGET: vi.fn(), boPOST: vi.fn(), boPATCH: vi.fn(), boDELETE: vi.fn(),
}));
vi.mock("../../../services/dialogService", () => ({
  dialog: { toast: vi.fn(), confirm: vi.fn(), prompt: vi.fn() },
}));

import { render, fireEvent, act, cleanup, screen, within } from "@testing-library/react";
import { boGET, boPOST, boPATCH, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import PanelAsesoras from "./PanelAsesoras";

const AHORA = new Date("2026-10-09T10:20:00-05:00");

/* ─── Datos falsos ───────────────────────────────────────────────────────── */
const FASES_VISA = [
  { label: "Estrategia realizada", done: true, pendiente: "" },
  { label: "Preparación documentaria", done: true, pendiente: "" },
  { label: "Cita programada", done: false, pendiente: "Falta antecedentes penales apostillados" },
  { label: "Documentos listos", done: false, pendiente: "" },
];

const ANA = {
  _id: 101, name: "Ana Torres Vega", estado: "ACTIVO", paquete: "Premium", carpeta: "M-101",
  portalLinked: true, beca: { aprobable: true, detalle: "Perfil fuerte para Fundación Carolina" },
  promedio: "16.5", interes: "Derecho internacional", uni_origen: "PUCP", masterElegido: "",
  notaMedia: true, cvEuropass: false, docCompletos: true,
  pasos: { fichero: true, informe: true, escogio: false, postulacion: false },
  origen: { notaMedia: "manual", promedio: "manual", interes: "auto", fichero: "manual", cvEuropass: "manual" },
  auto: { interes: "Derecho", uni_origen: "PUCP", promedio: "15", masterElegido: "", fichero: true, notaMedia: false, cvEuropass: true, docCompletos: false, informe: true, escogio: false, postulacion: true },
  progreso: { pct: 62, etiqueta: "en curso" },
  unis: [
    { _idAcceso: 501, u: "Universidad de Salamanca", master: "Máster en Abogacía", fPost: "01/03/2026", fResult: "01/05/2026", est: "ADMITIDO" },
    { _idAcceso: 502, u: "Universitat de València", master: "", fPost: "", fResult: "", est: "LISTA DE ESPERA ALTA" },
    { _idAcceso: 503, u: "Universidad Complutense de Madrid", master: "Máster en Derecho Internacional Público y Relaciones Internacionales", fPost: "15/04/2026", fResult: "", est: "POSTULADO" },
    { u: "Universidad de Granada", master: "Máster en Criminología", fPost: "", fResult: "", est: "EXCLUIDO" },
    { _idAcceso: 505, u: "Universidad de Navarra", master: "Máster en Derecho", fPost: "", fResult: "", est: "NO POSTULAR AUN" },
    { _idAcceso: 506, u: "Universidad de Sevilla", master: "Máster en Gestión", fPost: "", fResult: "", est: "PENDIENTE" },
  ],
  pagos: { tipo: "Cuotas", total: "1200", pagadas: "450", pendiente: "750", cuotas: "4" },
  pending: ["Enviar título apostillado", "Firmar contrato de servicio"],
};

const LUIS = {
  _id: 102, name: "Luis Pérez", estado: "NO_ACTIVO", paquete: "", carpeta: "",
  beca: { aprobable: false, detalle: "" }, promedio: "", interes: "", uni_origen: "", masterElegido: "",
  origen: { masterElegido: "manual" }, pending: [],
};

const SIN_NOMBRE = { _id: 103, name: null, estado: "ACTIVAR", paquete: "Esencial", beca: null };

const MARTA_MASTER = {
  _id: 104, name: "Marta Ruiz", estado: "ACTIVAR", paquete: "Esencial", carpeta: "M-104",
  progreso: { pct: 10, etiqueta: "inicio" }, unis: [], pending: ["Subir DNI"],
};

const ROSA = {
  _id: 201, name: "Rosa Quispe", estado: "ACTIVAR", paquete: "Visa Plus", carpeta: "V-201",
  fases: FASES_VISA, fechaCita: "02/11/2026", pasaporte: "P1234567", fNac: "", nie: "",
  expediente: "EX-2026-1", llegada: "", plazoMax: "30/11/2026", plazoIdeal: "15/11/2026",
  pagos: { tipo: "Contado", total: "300", pagadas: "300", pendiente: "", cuotas: "1" },
  pending: ["Cita consular"],
};
// Mismo expediente que Ana en otro servicio: la clave de fila es id + servicio.
const ANA_VISA = { _id: 101, name: "Ana Torres Vega", estado: "ACTIVO", paquete: "Visa estudios", portalLinked: true };
const PEDRO_VISA = { _id: 203, name: "Pedro Gil", estado: "NO_ACTIVO", paquete: "", promedio: "14" };

const ELENA = {
  _id: 301, name: "Elena Soto", estado: "ACTIVO", paquete: "Estancia", carpeta: "E-301",
  fases: [{ label: "Estrategia realizada", done: false, pendiente: "" }, { label: "Preparación documentaria", done: false, pendiente: "" }],
  detalle: "Renovación por estudios", llegada: "01/09/2026", plazoMax: "", plazoIdeal: "",
  pasaporte: "", fNac: "12/12/1998", nie: "Y1234567X", expediente: "", fPresentacion: "05/10/2026",
};
const JORGE_EE = { _id: 302, name: "Jorge Díaz", estado: "ACTIVO", paquete: "Estancia" };

const SOFIA = {
  _id: 401, name: "Sofía León", estado: "ACTIVO", paquete: "FP Superior", carpeta: "F-401",
  centro: "IES Séneca", estadoAdm: "", nie: "", expediente: "EX-401",
};
const CARLOS = {
  _id: 501, name: "Carlos Mena", estado: "NO_ACTIVO", paquete: "Arraigo", carpeta: "L-501",
  tipo: "Arraigo social", resultado: "Favorable", asesor: "", resolucion: "", nie: "X7654321Z", expediente: "",
};
const DIANA = {
  _id: 601, name: "Diana Paz", estado: "ACTIVO", paquete: "Doctorado", carpeta: "D-601",
  centro: "Universidad de Barcelona · Programa de Derecho", estadoAdm: "Admitida", resultado: "", nie: "", expediente: "",
};

function relleno(n, desde, extra = {}) {
  return Array.from({ length: n }, (_, i) => ({
    _id: desde + i, name: `Cliente ${String(i + 1).padStart(3, "0")}`,
    estado: ["ACTIVO", "NO_ACTIVO", "ACTIVAR"][i % 3], paquete: i % 2 ? "Premium" : "",
    pending: i % 4 === 0 ? ["Pendiente genérico"] : [], ...extra,
  }));
}

function datosPorDefecto() {
  return {
    master: [ANA, LUIS, SIN_NOMBRE, MARTA_MASTER, ...relleno(9, 1000)],
    visa: [ROSA, ANA_VISA, PEDRO_VISA],
    ee: [ELENA, JORGE_EE],
    fp: [SOFIA],
    legal: [CARLOS],
    doc: [DIANA],
  };
}

let respuesta;

/** HTML exacto, con un salto entre etiquetas para que el diff se lea. */
const html = (c) => c.innerHTML.replace(/></g, ">\n<");
/** Deja que terminen las promesas de los fetch simulados. */
const esperar = async () => { for (let i = 0; i < 3; i++) await act(() => new Promise((r) => setTimeout(r, 0))); };

async function montar() {
  const r = render(<PanelAsesoras />);
  await esperar();
  return r;
}

/** Tarjeta de un cliente por su nombre visible (i: si está en dos servicios). */
function tarjeta(nombre, i = 0) {
  return screen.getAllByText(nombre, { selector: "span.font-bold[title]" })[i].closest(".border-t");
}
function abrirMenu(nombre, i = 0) {
  fireEvent.click(screen.getAllByLabelText(`Acciones de ${nombre}`)[i]);
}
function pestana(nombre) {
  fireEvent.click(screen.getByText(nombre, { selector: "button" }));
}

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ["Date"] });
  respuesta = { ok: true, data: datosPorDefecto() };
  boGET.mockImplementation((ruta) => {
    if (ruta === "/backoffice/panel-asesoras") return Promise.resolve(respuesta);
    if (ruta.endsWith("/drive-folder-url")) return Promise.resolve({ ok: true, url: "https://drive.google.com/drive/folders/abc" });
    return Promise.resolve({ ok: false });
  });
  boPATCH.mockResolvedValue({ ok: true });
  boPOST.mockResolvedValue({ ok: true });
  boDELETE.mockResolvedValue({ ok: true });
  vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

afterAll(() => {
  if (zonaOriginal === undefined) delete globalThis.process.env.TZ;
  else globalThis.process.env.TZ = zonaOriginal;
});

describe("Panel asesoras — lista", () => {
  it("cargando", async () => {
    boGET.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<PanelAsesoras />);
    expect(html(container)).toMatchSnapshot();
  });

  it("todos los servicios, página 1 y página 2", async () => {
    const { container } = await montar();
    expect(boGET).toHaveBeenCalledWith("/backoffice/panel-asesoras");
    expect(html(container)).toMatchSnapshot("página 1");
    fireEvent.click(screen.getByLabelText("Página siguiente"));
    expect(html(container)).toMatchSnapshot("página 2");
    fireEvent.click(screen.getByText("1", { selector: "button" }));
    expect(screen.getByText("Pág. 1/2 · 21 clientes")).toBeTruthy();
  });

  it("muchas páginas: puntos suspensivos y saltos", async () => {
    respuesta = { ok: true, data: { master: relleno(120, 2000), visa: [], ee: [], fp: [], legal: [], doc: [] } };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot("página 1 de 8");
    fireEvent.click(screen.getByText("7", { selector: "button" }));
    fireEvent.click(screen.getByLabelText("Página anterior"));
    fireEvent.click(screen.getByLabelText("Página anterior"));
    expect(html(container)).toMatchSnapshot("página 5 de 8");
    fireEvent.click(screen.getByText("8", { selector: "button" }));
    expect(html(container)).toMatchSnapshot("última página");
  });

  it("búsqueda, filtro por estado y limpiar (vuelve a la página 1)", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByLabelText("Página siguiente"));
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente..."), { target: { value: "ana" } });
    expect(html(container)).toMatchSnapshot("buscar ana");
    fireEvent.change(container.querySelector("select"), { target: { value: "NO_ACTIVO" } });
    expect(html(container)).toMatchSnapshot("ana + no activo (vacío)");
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente..."), { target: { value: "" } });
    expect(html(container)).toMatchSnapshot("solo no activos");
    fireEvent.click(screen.getByText("✕ Limpiar filtros"));
    expect(screen.getByText("Pág. 1/2 · 21 clientes")).toBeTruthy();
  });

  it("pestañas de servicio", async () => {
    const { container } = await montar();
    for (const t of ["Máster", "Visa estudios", "Estancia est.", "FP / Grado", "Legal / RR", "Doctorado"]) {
      pestana(t);
      expect(html(container)).toMatchSnapshot(t);
    }
  });

  it("sin datos", async () => {
    respuesta = { ok: true, data: { master: [], visa: [], ee: [], fp: [], legal: [], doc: [] } };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("error al cargar (ok: false)", async () => {
    respuesta = { ok: false, msg: "La base de datos no responde" };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("servicio que falta en la respuesta", async () => {
    respuesta = { ok: true, data: { master: [LUIS], visa: [ROSA] } };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot("todos");
    pestana("Doctorado");
    expect(html(container)).toMatchSnapshot("doctorado vacío");
  });
});

describe("Panel asesoras — detalle", () => {
  it("máster completo: resumen, universidades, pagos y pendientes", async () => {
    const { container } = await montar();
    fireEvent.click(within(tarjeta("Ana Torres Vega")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("resumen");
    fireEvent.click(screen.getByText("Universidades (6)"));
    expect(html(container)).toMatchSnapshot("universidades");
    fireEvent.click(screen.getByText("Pagos"));
    expect(html(container)).toMatchSnapshot("pagos");
    fireEvent.click(screen.getByText("Pendientes (2)"));
    expect(html(container)).toMatchSnapshot("pendientes");
    // Al pulsar la fila otra vez se contrae.
    fireEvent.click(within(tarjeta("Ana Torres Vega")).getByLabelText("Contraer"));
    expect(container.querySelector("table")).toBeNull();
  });

  it("máster vacío: sin beca, sin universidades, sin pagos ni pendientes", async () => {
    const { container } = await montar();
    fireEvent.click(tarjeta("Luis Pérez").querySelector(".cursor-pointer"));
    expect(html(container)).toMatchSnapshot("resumen");
    fireEvent.click(screen.getByText("Universidades (0)"));
    expect(html(container)).toMatchSnapshot("universidades vacías");
    fireEvent.click(screen.getByText("Pagos"));
    expect(html(container)).toMatchSnapshot("pagos vacíos");
    fireEvent.click(screen.getByText("Pendientes"));
    expect(html(container)).toMatchSnapshot("pendientes vacíos");
  });

  it("máster sin nombre ni registro de beca", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getAllByLabelText("Expandir")[2]);
    expect(html(container)).toMatchSnapshot();
  });

  it("visa con fases y visa sin fases", async () => {
    const { container } = await montar();
    pestana("Visa estudios");
    fireEvent.click(within(tarjeta("Rosa Quispe")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("con fases");
    fireEvent.click(screen.getByText("Pagos"));
    expect(html(container)).toMatchSnapshot("pagos al día");
    fireEvent.click(within(tarjeta("Pedro Gil")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("sin fases");
  });

  it("estancia, FP, legal y doctorado", async () => {
    const { container } = await montar();
    pestana("Estancia est.");
    fireEvent.click(within(tarjeta("Elena Soto")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("estancia");
    pestana("FP / Grado");
    fireEvent.click(within(tarjeta("Sofía León")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("fp");
    pestana("Legal / RR");
    fireEvent.click(within(tarjeta("Carlos Mena")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("legal");
    pestana("Doctorado");
    fireEvent.click(within(tarjeta("Diana Paz")).getByLabelText("Expandir"));
    expect(html(container)).toMatchSnapshot("doctorado");
  });

  it("abrir Drive y expediente desde el detalle", async () => {
    const { container } = await montar();
    fireEvent.click(within(tarjeta("Ana Torres Vega")).getByLabelText("Expandir"));
    fireEvent.click(screen.getByTitle("Abrir carpeta en Drive"));
    await esperar();
    expect(boGET).toHaveBeenCalledWith("/backoffice/panel-asesoras/101/drive-folder-url");
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/drive/folders/abc", "_blank");
    expect(html(container)).toMatchSnapshot("aviso de Drive");
    fireEvent.click(screen.getByTitle("Abrir el expediente completo"));
    expect(window.location.pathname).toBe("/backoffice/solicitudes/101");
  });

  it("copiar al portapapeles", async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(globalThis.navigator, "clipboard", { value: { writeText }, configurable: true });
    await montar();
    fireEvent.click(within(tarjeta("Ana Torres Vega")).getByLabelText("Copiar nombre"));
    await esperar();
    expect(writeText).toHaveBeenCalledWith("Ana Torres Vega");
    expect(dialog.toast).toHaveBeenCalledWith("Nombre copiado", "success");
    writeText.mockRejectedValueOnce(new Error("denegado"));
    fireEvent.click(within(tarjeta("Ana Torres Vega")).getByLabelText("Expandir"));
    fireEvent.click(screen.getByLabelText("Copiar paquete"));
    await esperar();
    expect(dialog.toast).toHaveBeenLastCalledWith("No se pudo copiar", "error");
    delete globalThis.navigator.clipboard;
  });
});

describe("Panel asesoras — menú, modales y acciones", () => {
  it("menú de acciones: abrir, cerrar al hacer clic fuera, ver detalle y copiar", async () => {
    const { container } = await montar();
    abrirMenu("Ana Torres Vega");
    expect(html(container)).toMatchSnapshot("menú abierto");
    fireEvent.click(document.body);
    expect(screen.queryByText("Editar datos del panel")).toBeNull();
    abrirMenu("Rosa Quispe");
    fireEvent.click(screen.getByText("Ver detalle"));
    expect(html(container)).toMatchSnapshot("ver detalle desde el menú");
    abrirMenu("Rosa Quispe");
    fireEvent.click(screen.getByText("Abrir expediente #201"));
    expect(window.location.pathname).toBe("/backoffice/solicitudes/201");
    expect(screen.queryByText("Ver detalle")).toBeNull();
  });

  it("quitar del panel: confirmación, cancelar y confirmar", async () => {
    const { container } = await montar();
    abrirMenu("Luis Pérez");
    fireEvent.click(screen.getByText("Eliminar cliente"));
    expect(html(container)).toMatchSnapshot("confirmación");
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Sí, quitar")).toBeNull();
    abrirMenu("Luis Pérez");
    fireEvent.click(screen.getByText("Eliminar cliente"));
    fireEvent.click(screen.getByText("Sí, quitar"));
    await esperar();
    expect(boDELETE).toHaveBeenCalledWith("/backoffice/panel-asesoras/102");
    expect(boGET.mock.calls.filter(([r]) => r === "/backoffice/panel-asesoras")).toHaveLength(2);
    expect(screen.queryByText("Sí, quitar")).toBeNull();
  });

  it("editar un máster: formulario, universidades y guardar", async () => {
    const { container } = await montar();
    abrirMenu("Ana Torres Vega");
    fireEvent.click(screen.getByText("Editar datos del panel"));
    expect(html(container)).toMatchSnapshot("modal editar máster");
    const modal = container.querySelector(".fixed.inset-0");
    // Universidad: cambiar un campo, quitar una sin acceso y añadir otra.
    fireEvent.change(within(modal).getByDisplayValue("Universidad de Salamanca"), { target: { value: "USAL" } });
    fireEvent.change(within(modal).getByDisplayValue("15/04/2026"), { target: { value: "20/04/2026" } });
    fireEvent.change(modal.querySelectorAll("tbody select")[1], { target: { value: "ADMITIDO" } });
    fireEvent.click(within(modal).getAllByText("✕")[3]);
    boPOST.mockResolvedValueOnce({ ok: true, _idAcceso: 777 });
    fireEvent.click(within(modal).getByText("+ agregar universidad"));
    await esperar();
    expect(boPOST).toHaveBeenCalledWith("/backoffice/panel-asesoras/101/portales", { u: "Nueva universidad", est: "PENDIENTE" });
    fireEvent.click(within(modal).getAllByText("✕")[0]);
    await esperar();
    expect(boDELETE).toHaveBeenCalledWith("/backoffice/panel-asesoras/portales/501");
    // Campos tri-estado y de texto.
    const selects = modal.querySelectorAll("select");
    fireEvent.change(selects[3], { target: { value: "auto" } });
    fireEvent.change(selects[4], { target: { value: "si" } });
    fireEvent.change(within(modal).getByPlaceholderText("Auto: Derecho"), { target: { value: "Derecho penal" } });
    fireEvent.change(modal.querySelector("textarea"), { target: { value: "Uno\n  \nDos  " } });
    expect(html(container)).toMatchSnapshot("modal editado");
    fireEvent.click(within(modal).getByText("Guardar cambios"));
    await esperar();
    expect(boPATCH.mock.calls).toMatchSnapshot("llamadas PATCH");
    expect(screen.queryByText("Guardar cambios")).toBeNull();
  });

  it("editar: error del servidor y nombre vacío", async () => {
    await montar();
    abrirMenu("Rosa Quispe");
    fireEvent.click(screen.getByText("Editar datos del panel"));
    boPATCH.mockResolvedValueOnce({ ok: false, msg: "Conflicto de versión" });
    fireEvent.click(screen.getByText("Guardar cambios"));
    await esperar();
    expect(dialog.toast).toHaveBeenCalledWith("Conflicto de versión", "error");
    boPATCH.mockResolvedValueOnce({ ok: false });
    fireEvent.click(screen.getByText("Guardar cambios"));
    await esperar();
    expect(dialog.toast).toHaveBeenLastCalledWith("Error al guardar", "error");
    fireEvent.change(screen.getByDisplayValue("Rosa Quispe"), { target: { value: "   " } });
    fireEvent.click(screen.getByText("Guardar cambios"));
    await esperar();
    expect(dialog.toast).toHaveBeenLastCalledWith("El nombre es obligatorio", "error");
    expect(boPATCH).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByText("×"));
    expect(screen.queryByText("Guardar cambios")).toBeNull();
  });

  it("editar visa (fases) y guardar", async () => {
    const { container } = await montar();
    abrirMenu("Rosa Quispe");
    fireEvent.click(screen.getByText("Editar datos del panel"));
    expect(html(container)).toMatchSnapshot("modal editar visa");
    const modal = container.querySelector(".fixed.inset-0");
    fireEvent.click(modal.querySelectorAll("input[type=checkbox]")[2]);
    fireEvent.change(within(modal).getByDisplayValue("Falta antecedentes penales apostillados"), { target: { value: "" } });
    fireEvent.change(within(modal).getByDisplayValue("P1234567"), { target: { value: "P7654321" } });
    fireEvent.click(within(modal).getByText("Guardar cambios"));
    await esperar();
    expect(boPATCH.mock.calls).toMatchSnapshot("llamadas PATCH");
  });

  it("editar estancia, FP, legal y doctorado (cancelar)", async () => {
    const { container } = await montar();
    for (const [tab, nombre] of [["Estancia est.", "Elena Soto"], ["FP / Grado", "Sofía León"], ["Legal / RR", "Carlos Mena"], ["Doctorado", "Diana Paz"]]) {
      pestana(tab);
      abrirMenu(nombre);
      fireEvent.click(screen.getByText("Editar datos del panel"));
      expect(html(container)).toMatchSnapshot(`modal editar ${tab}`);
      fireEvent.click(within(container.querySelector(".fixed.inset-0")).getByText("Cancelar"));
    }
    expect(boPATCH).not.toHaveBeenCalled();
  });

  it("agregar cliente: un formulario por servicio y crear", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("+ Agregar cliente"));
    expect(html(container)).toMatchSnapshot("modal nuevo máster");
    const modal = () => container.querySelector(".fixed.inset-0");
    for (const s of ["Visa estudios", "Estancia est.", "FP / Grado", "Legal / RR", "Doctorado"]) {
      fireEvent.click(within(modal()).getByText(s));
      expect(html(container)).toMatchSnapshot(`modal nuevo ${s}`);
    }
    // Vuelve a máster: el formulario se reinicia (key = servicio).
    fireEvent.click(within(modal()).getByText("Máster"));
    fireEvent.click(within(modal()).getByText("Crear cliente"));
    await esperar();
    expect(dialog.toast).toHaveBeenCalledWith("El nombre es obligatorio", "error");
    fireEvent.click(within(modal()).getByText("Legal / RR"));
    const inputs = modal().querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "  Nuevo Cliente  " } });
    fireEvent.change(inputs[1], { target: { value: "nuevo@example.com" } });
    fireEvent.change(within(modal()).getByText("Tipo procedimiento").nextSibling, { target: { value: "Nacionalidad" } });
    fireEvent.click(within(modal()).getByText("Crear cliente"));
    await esperar();
    expect(boPOST.mock.calls).toMatchSnapshot("llamadas POST");
    expect(html(container)).toMatchSnapshot("tras crear: pestaña legal");
  });

  it("agregar: error del servidor y cerrar con ×", async () => {
    await montar();
    fireEvent.click(screen.getByText("+ Agregar cliente"));
    fireEvent.change(document.querySelector(".fixed.inset-0 input"), { target: { value: "Alguien" } });
    boPOST.mockResolvedValueOnce({ ok: false });
    fireEvent.click(screen.getByText("Crear cliente"));
    await esperar();
    expect(dialog.toast).toHaveBeenCalledWith("Error al crear", "error");
    fireEvent.click(screen.getByText("×"));
    expect(screen.queryByText("Nuevo cliente")).toBeNull();
  });

  it("exportar JSON", async () => {
    const createObjectURL = vi.fn(() => "blob:x");
    globalThis.URL.createObjectURL = createObjectURL;
    const clic = vi.spyOn(globalThis.HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await montar();
    fireEvent.click(screen.getByText("Exportar JSON"));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const a = clic.mock.instances[0];
    expect(a.download).toBe("inspira_panel_2026-10-09.json");
    expect(a.href).toBe("blob:x");
    delete globalThis.URL.createObjectURL;
  });
});
