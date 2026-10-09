// @vitest-environment jsdom
//
// Instantáneas del HTML de la Agenda (09/10/2026). Se tomaron ANTES de partir
// Agenda.jsx en piezas y sirven para eso: si un refactor cambia una clase, un
// texto o el orden de algo, falla. Si el cambio es a propósito, se regeneran
// con `npx vitest run -u` y se revisa el diff del .snap.
//
// Reloj y zona fijos (viernes 09/10/2026 10:20 en Lima): la Agenda calcula
// "hoy", la línea de "ahora", lo pasado y las cuentas atrás con new Date().
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

import { render, fireEvent, act, cleanup, screen } from "@testing-library/react";
import { boGET, boPOST, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import Agenda from "./Agenda";

const AHORA = new Date("2026-10-09T10:20:00-05:00");

const CARINA = { id_usuario: 1, nombre: "Carina Meza" };
const NICOLE = { id_usuario: 2, nombre: "Nicole Ramos" };

const SLOTS = [
  { id_slot: 1, fecha: "2026-10-09", hora_inicio: "09:00", estado: "OCUPADO", asesor: CARINA },
  { id_slot: 2, fecha: "2026-10-09", hora_inicio: "11:00", estado: "LIBRE", asesor: CARINA },
  { id_slot: 3, fecha: "2026-10-09", hora_inicio: "11:00", estado: "RESERVADO", asesor: NICOLE },
  { id_slot: 4, fecha: "2026-10-10", hora_inicio: "15:30", estado: "BLOQUEADO", asesor: CARINA },
  { id_slot: 5, fecha: "2026-10-12", hora_inicio: "10:00", estado: "RESERVADO", asesor: NICOLE },
  { id_slot: 6, fecha: "2026-10-13", hora_inicio: "16:00", estado: "LIBRE", asesor: CARINA },
];

const RESERVAS = [
  {
    id_reserva: 10, fecha: "2026-10-09", hora_inicio: "09:00", estado: "CONFIRMADA", pago_estado: "APROBADO",
    monto: 50, moneda: "USD", meet_url: "https://meet.google.com/abc-defg-hij",
    cliente: { nombre: "Ana Torres", email_contacto: "ana@example.com", telefono: "+51 999 111 222" }, asesor: CARINA,
  },
  {
    id_reserva: 11, fecha: "2026-10-12", hora_inicio: "10:00", estado: "PENDIENTE_PAGO", pago_estado: "PENDIENTE",
    monto: 150, moneda: "PEN", meet_url: null, hold_expira_en: "2026-10-09T15:45:00Z",
    cliente: { nombre: "Luis Pérez", email_contacto: "luis@example.com" }, asesor: NICOLE,
  },
  {
    id_reserva: 12, fecha: "2026-10-11", hora_inicio: "12:00", estado: "CANCELADA", pago_estado: "REEMBOLSADO",
    monto: 50, moneda: "USD", meet_url: null, cliente: { email_contacto: "sin-nombre@example.com" }, asesor: CARINA,
  },
  {
    id_reserva: 13, fecha: "2026-10-09", hora_inicio: "11:00", estado: "EXPIRADA", pago_estado: "RECHAZADO",
    monto: 50, moneda: "USD", meet_url: null, cliente: { nombre: "Marta Ruiz" }, asesor: NICOLE,
  },
];

const INVITADO = {
  name: "Rosa Quispe", email: "rosa@example.com", created_at: "2026-10-01T17:42:00Z",
  reschedule_url: "https://calendly.com/reschedule/1",
  questions: [{ question: "¿Qué servicio te interesa?", answer: "Máster en España" }],
};
const EVENTOS = [
  // en curso ahora
  { uuid: "e1", event_name: "Asesoría", status: "active", start_time: "2026-10-09T15:00:00Z", end_time: "2026-10-09T15:30:00Z", location: "https://zoom.us/j/1", invitees: [INVITADO] },
  // más tarde hoy: cuenta atrás
  { uuid: "e2", event_name: "Asesoría", status: "active", start_time: "2026-10-09T18:00:00Z", end_time: "2026-10-09T18:45:00Z", location: "https://zoom.us/j/2", invitees: [{ ...INVITADO, name: "Pedro Gil", questions: [] }] },
  // ya pasó
  { uuid: "e3", event_name: "Seguimiento", status: "active", start_time: "2026-10-09T13:00:00Z", end_time: "2026-10-09T13:30:00Z", location: "https://zoom.us/j/3", invitees: [INVITADO] },
  // mañana, cancelada
  { uuid: "e4", event_name: "Asesoría", status: "canceled", start_time: "2026-10-10T16:00:00Z", end_time: "2026-10-10T16:30:00Z", invitees: [INVITADO] },
  // sin datos del invitado
  { uuid: "e5", event_name: "Llamada", status: "active", start_time: "2026-10-14T20:00:00Z", end_time: "2026-10-14T21:00:00Z", invitees: [] },
];

const DISPONIBILIDAD = {
  schedule: {
    timezone: "America/Lima",
    rules: [
      { wday: "monday", intervals: [{ from: "09:00", to: "13:00" }, { from: "15:00", to: "18:00" }] },
      { wday: "friday", intervals: [{ from: "10:00", to: "14:00" }] },
    ],
  },
  available_slots: [
    { start_time: "2026-10-12T14:00:00Z", scheduling_url: "https://calendly.com/x/1" },
    { start_time: "2026-10-12T14:30:00Z", scheduling_url: "https://calendly.com/x/2" },
    { start_time: "2026-10-14T03:30:00Z", scheduling_url: "https://calendly.com/x/3" },
  ],
};

let respuestas;
function respuestasPorDefecto() {
  return {
    "/backoffice/usuarios-internos": { ok: true, usuarios: [CARINA, NICOLE] },
    "/backoffice/agenda/slots": { ok: true, slots: SLOTS },
    "/backoffice/agenda/reservas": { ok: true, reservas: RESERVAS },
    "/backoffice/calendly/events": { events: EVENTOS, booking_url: "https://calendly.com/inspira/asesoria" },
    "/backoffice/calendly/availability": DISPONIBILIDAD,
  };
}

/** HTML exacto, con un salto entre etiquetas para que el diff se lea. */
const html = (c) => c.innerHTML.replace(/></g, ">\n<");
/** Deja que terminen las promesas de los fetch simulados. */
const esperar = async () => { for (let i = 0; i < 3; i++) await act(() => new Promise((r) => setTimeout(r, 0))); };

function comoRol(rol) {
  localStorage.setItem("bo_user", JSON.stringify({ rol }));
}

async function montar() {
  const r = render(<Agenda />);
  await esperar();
  return r;
}

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ["Date"] });
  respuestas = respuestasPorDefecto();
  boGET.mockImplementation((ruta) => Promise.resolve(respuestas[ruta.split("?")[0]]));
  comoRol("admin");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  if (zonaOriginal === undefined) delete globalThis.process.env.TZ;
  else globalThis.process.env.TZ = zonaOriginal;
});

describe("Agenda — Mi calendario", () => {
  it("admin, todo el equipo", async () => {
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("admin, filtrado por una asesora", async () => {
    const { container } = await montar();
    fireEvent.change(container.querySelector("select"), { target: { value: "1" } });
    await esperar();
    expect(boGET).toHaveBeenCalledWith(expect.stringContaining("id_usuario=1"));
    expect(html(container)).toMatchSnapshot();
  });

  it("asesora: su calendario, con el panel de generar horarios abierto", async () => {
    comoRol("asesor");
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot("propio");
    fireEvent.click(screen.getByText("+ Generar horarios"));
    expect(html(container)).toMatchSnapshot("generar horarios");
  });

  it("vista de día, semana siguiente y cita desplegada", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("Día"));
    expect(html(container)).toMatchSnapshot("día");
    fireEvent.click(screen.getByText("Semana"));
    fireEvent.click(screen.getByText("›"));
    await esperar();
    expect(html(container)).toMatchSnapshot("semana siguiente");
    fireEvent.click(screen.getByText("Hoy"));
    await esperar();
    // Las tres citas activas del panel lateral, desplegadas.
    const filas = container.querySelectorAll("aside article > button");
    expect(filas).toHaveLength(3);
    filas.forEach((b) => fireEvent.click(b));
    expect(html(container)).toMatchSnapshot("citas desplegadas");
  });

  it("sin datos", async () => {
    respuestas["/backoffice/agenda/slots"] = { ok: true, slots: [] };
    respuestas["/backoffice/agenda/reservas"] = { ok: true, reservas: [] };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("error al cargar", async () => {
    respuestas["/backoffice/agenda/slots"] = { ok: false, msg: "La base de datos no responde" };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });
});

describe("Agenda — Mi calendario: acciones", () => {
  it("la asesora crea un horario con un clic en una celda vacía y se recarga", async () => {
    comoRol("asesor");
    boPOST.mockResolvedValue({ ok: true, creados: 1 });
    const { container } = await montar();
    const llamadasAntes = boGET.mock.calls.length;
    fireEvent.click(container.querySelector('button[title="Crear horario 12:00"]'));
    await esperar();
    expect(boPOST).toHaveBeenCalledWith("/backoffice/agenda/slots", { fecha: "2026-10-09", horas: ["12:00"] });
    expect(boGET.mock.calls.length).toBeGreaterThan(llamadasAntes);
  });

  it("con todo el equipo a la vista no se crean horarios", async () => {
    const { container } = await montar();
    const vacias = container.querySelectorAll('div.relative.grid > button[style*="grid-column"]');
    expect([...vacias].every((b) => b.disabled)).toBe(true);
  });

  it("borrar un horario libre pide confirmación y llama al DELETE", async () => {
    comoRol("asesor");
    dialog.confirm.mockResolvedValue(true);
    boDELETE.mockResolvedValue({ ok: true });
    const { container } = await montar();
    fireEvent.click(container.querySelector('button[title^="Libre — clic para borrar"]'));
    await esperar();
    expect(dialog.confirm).toHaveBeenCalledWith("¿Borrar el horario libre de las 16:00?", "Borrar horario");
    expect(boDELETE).toHaveBeenCalledWith("/backoffice/agenda/slots/6");
  });

  it("generar horarios en bloque manda fecha, desde y hasta", async () => {
    comoRol("asesor");
    boPOST.mockResolvedValue({ ok: true, creados: 18 });
    const { container } = await montar();
    fireEvent.click(screen.getByText("+ Generar horarios"));
    fireEvent.submit(container.querySelector("form"));
    await esperar();
    expect(boPOST).toHaveBeenCalledWith("/backoffice/agenda/slots", { fecha: "2026-10-09", desde: "09:00", hasta: "18:00" });
    expect(dialog.toast).toHaveBeenCalledWith("18 horario(s) de 30 min creados para 2026-10-09.", "success");
  });
});

describe("Agenda — Reuniones (Calendly): cancelar", () => {
  it("la doble confirmación manda el motivo a Calendly y recarga", async () => {
    boPOST.mockResolvedValue({ ok: true });
    const { container } = await montar();
    fireEvent.click(screen.getByText("Reuniones (Calendly)"));
    await esperar();
    fireEvent.click(screen.getAllByText("Cancelar")[0]);
    fireEvent.change(container.querySelector("textarea"), { target: { value: "  Imprevisto  " } });
    fireEvent.click(screen.getByText("Continuar →"));
    fireEvent.click(screen.getByText("Sí, cancelar definitivamente"));
    await esperar();
    expect(boPOST).toHaveBeenCalledWith("/backoffice/calendly/events/e1/cancel", { reason: "Imprevisto" });
    expect(container.querySelector("textarea")).toBeNull();
    expect(boGET.mock.calls.filter(([r]) => r.startsWith("/backoffice/calendly/events")).length).toBe(2);
  });
});

describe("Agenda — Reuniones (Calendly)", () => {
  it("con reuniones y el modal de cancelación en sus dos pasos", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("Reuniones (Calendly)"));
    await esperar();
    expect(html(container)).toMatchSnapshot("lista");
    fireEvent.click(screen.getByText("14 días"));
    await esperar();
    expect(boGET).toHaveBeenCalledWith("/backoffice/calendly/events?days=14");
    fireEvent.click(screen.getAllByText("Cancelar")[0]);
    fireEvent.change(container.querySelector("textarea"), { target: { value: "La asesora está enferma" } });
    expect(html(container)).toMatchSnapshot("cancelar paso 1");
    fireEvent.click(screen.getByText("Continuar →"));
    expect(html(container)).toMatchSnapshot("cancelar paso 2");
  });

  it("asesora sin reuniones", async () => {
    comoRol("asesor");
    respuestas["/backoffice/calendly/events"] = { events: [], booking_url: "https://calendly.com/inspira/asesoria" };
    const { container } = await montar();
    fireEvent.click(screen.getByText("Reuniones (Calendly)"));
    await esperar();
    expect(html(container)).toMatchSnapshot();
  });

  it("error de Calendly", async () => {
    respuestas["/backoffice/calendly/events"] = { error: "Token de Calendly caducado" };
    const { container } = await montar();
    fireEvent.click(screen.getByText("Reuniones (Calendly)"));
    await esperar();
    expect(html(container)).toMatchSnapshot();
  });
});

describe("Agenda — Disponibilidad (Calendly)", () => {
  it("horario semanal y huecos libres", async () => {
    const { container } = await montar();
    fireEvent.click(screen.getByText("Disponibilidad (Calendly)"));
    await esperar();
    expect(html(container)).toMatchSnapshot();
  });

  it("sin huecos", async () => {
    respuestas["/backoffice/calendly/availability"] = { ...DISPONIBILIDAD, available_slots: [] };
    const { container } = await montar();
    fireEvent.click(screen.getByText("Disponibilidad (Calendly)"));
    await esperar();
    expect(html(container)).toMatchSnapshot();
  });

  it("error", async () => {
    respuestas["/backoffice/calendly/availability"] = { error: "Sin permiso" };
    const { container } = await montar();
    fireEvent.click(screen.getByText("Disponibilidad (Calendly)"));
    await esperar();
    expect(html(container)).toMatchSnapshot();
  });
});
