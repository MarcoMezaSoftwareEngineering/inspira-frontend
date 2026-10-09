// @vitest-environment jsdom
//
// Instantáneas del HTML del formulario académico (09/10/2026). Se tomaron
// ANTES de partir FormularioDatosAcademicos.jsx en piezas y sirven para eso: si
// un refactor cambia una clase, un texto o el orden de algo, falla. Si el
// cambio es a propósito, se regeneran con `npx vitest run -u` y se revisa el
// diff del .snap.
//
// Los dos sitios que lo usan (DetalleSolicitud y FormularioDatosAcademicosAdmin)
// lo montan dentro de SeccionSiempreAbiertoCtx = true: la lista de secciones
// plegables. Sin el contexto queda el modo modal (el asistente de nueve pasos),
// que también se cubre.
//
// Reloj y zona fijos (viernes 09/10/2026 10:20 en Lima): las fechas de inicio
// que se ofrecen («Ene 2027», «Sep 2027»…) salen de new Date().
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

vi.mock("../../../../../services/api", () => ({ apiGET: vi.fn() }));

import { useState } from "react";
import { render, fireEvent, act, cleanup, screen, within } from "@testing-library/react";
import { apiGET } from "../../../../../services/api";
import { SeccionSiempreAbiertoCtx } from "./SeccionPanel";
import FormularioDatosAcademicos from "./FormularioDatosAcademicos";

const AHORA = new Date("2026-10-09T10:20:00-05:00");

const RAMAS = [
  { valor: "CIENCIAS_SOCIALES_JURIDICAS", etiqueta: "Ciencias Sociales y Jurídicas" },
  { valor: "INGENIERIA_ARQUITECTURA", etiqueta: "Ingeniería y Arquitectura" },
  { valor: "CIENCIAS_SALUD", etiqueta: "Ciencias de la Salud" },
];
const SUBAREAS = [
  { rama: "CIENCIAS_SOCIALES_JURIDICAS", valor: "DERECHO", etiqueta: "Derecho" },
  { rama: "CIENCIAS_SOCIALES_JURIDICAS", valor: "ECONOMIA", etiqueta: "Economía y empresa" },
  { rama: "INGENIERIA_ARQUITECTURA", valor: "INFORMATICA", etiqueta: "Informática" },
];
const COMUNIDADES = ["Andalucía", "Cataluña", "Comunidad de Madrid", "Comunidad Valenciana", "Galicia"];

// Todo contestado, con un valor antiguo de cada tipo: el objetivo «laboral»
// (se lee como «Quedarme a trabajar en España») y un inicio que ya pasó
// (sep_2026), que se conserva como opción para no perder lo contestado.
const COMPLETO = {
  carrera_titulo: "Derecho",
  area_carrera: "Derecho",
  universidad_origen: "Pontificia Universidad Católica del Perú",
  es_auip: "si",
  promedio_peru: "15.75",
  promedio_escala: "20",
  ubicacion_grupo: "tercio",
  otra_maestria_tiene: "si",
  otra_maestria_detalle: "Máster en Derecho Ambiental – U. de Alicante",
  experiencia_anios: "3-5",
  experiencia_vinculada: "parcial",
  experiencia_vinculada_detalle: "Estudio Rodríguez & Asociados, asociada senior",
  experiencia_detalle: [
    { entidad: "Estudio Rodríguez & Asociados", cargo: "Asociada senior", sector: "privado", desde: "2021-03", hasta: "", actual: true, funciones: "Litigio civil y arbitraje", vinculada: true },
    { entidad: "Defensoría del Pueblo", cargo: "Practicante", sector: "publico", desde: "2019-01", hasta: "2020-12", actual: false, funciones: "", vinculada: false },
  ],
  investigacion_experiencia: "si",
  investigacion_detalle: "Grupo de investigación en derecho ambiental",
  formacion_diplomados: true,
  formacion_otros: true,
  formacion_otros_detalle: "Curso de arbitraje de la Cámara de Comercio de Lima",
  ingles_situacion: "intl",
  ingles_intl_tipo: "IELTS",
  ingles_intl_puntaje: "6.5",
  idioma_master_bilingue: true,
  beca_desea: "si",
  beca_completa: true,
  beca_auip: true,
  masteres_deseados: ["Máster en Derecho Internacional", "Máster en Compliance", ""],
  masteres_enlaces: ["https://www.uc3m.es/master/derecho-internacional"],
  especializaciones: ["Arbitraje internacional", "Compliance"],
  area_interes_master: "CIENCIAS_SOCIALES_JURIDICAS",
  sub_area_interes: "DERECHO",
  objetivo_master: "laboral",
  descartes: ["semipresencial", "en_ingles"],
  descartes_nota: "Nada en Canarias",
  duracion_preferida: "1",
  practicas_preferencia: "imprescindible",
  presupuesto_hasta: "8500",
  modalidad_preferida: "presencial",
  comunidades_preferidas: ["Comunidad de Madrid", "Cataluña", "Andalucía", "Comunidad Valenciana"],
  inicio_previsto: "sep_2026",
  comentario_especial: "Viajo con mi hija de 5 años.",
};

// Las otras ramas: sin experiencia, inglés de la universidad, sin beca, una
// universidad que no está en AUIP y un promedio fuera de la escala.
const VARIANTE = {
  carrera_titulo: "Enfermería",
  area_carrera: "Salud",
  universidad_origen: "Universidad Inventada del Sur",
  promedio_peru: "25",
  promedio_escala: "20",
  ubicacion_grupo: "ninguno",
  otra_maestria_tiene: "no",
  experiencia_anios: "sin",
  experiencia_vinculada: "no",
  investigacion_experiencia: "no",
  formacion_ninguna: true,
  ingles_situacion: "uni",
  ingles_uni_nivel: "B2",
  idioma_master_es: true,
  beca_desea: "no",
  masteres_deseados: ["Máster en Salud Pública"],
  objetivo_master: "doctorado",
  duracion_preferida: "indiferente",
  practicas_preferencia: "deseable",
  modalidad_preferida: "indiferente",
  comunidades_preferidas: ["Comunidad de Madrid"],
  inicio_previsto: "ene_2027",
};

const PLAN = { bloqueado: true, opciones: ["Comunidad de Madrid", "Cataluña"] };

const enviar = vi.fn(async (e) => { e?.preventDefault?.(); });
const guardar = vi.fn(async () => {});

let respuestas;
function respuestasPorDefecto() {
  return {
    "/api/catalogo/ramas": { ok: true, ramas: RAMAS },
    "/api/catalogo/subareas": { ok: true, subareas: SUBAREAS },
    "/api/catalogo/comunidades": { ok: true, comunidades: COMUNIDADES },
    "/api/catalogo/titulaciones": { ok: true, titulaciones: [{ titulacion: "Grado en Derecho" }, { titulacion: "Grado en Derecho y ADE" }] },
  };
}

/** HTML exacto, con un salto entre etiquetas para que el diff se lea. */
const html = (c) => c.innerHTML.replace(/></g, ">\n<");
/** Deja que terminen las promesas de los fetch simulados. */
const esperar = async () => { for (let i = 0; i < 3; i++) await act(() => new Promise((r) => setTimeout(r, 0))); };

/** Como en la vida real: el padre guarda formData y se lo devuelve. */
function Envoltorio({ inicial, abierto, ...props }) {
  const [formData, setFormData] = useState(inicial);
  const formulario = <FormularioDatosAcademicos formData={formData} setFormData={setFormData} {...props} />;
  return abierto
    ? <SeccionSiempreAbiertoCtx.Provider value={true}>{formulario}</SeccionSiempreAbiertoCtx.Provider>
    : formulario;
}

async function montar({ inicial = {}, abierto = true, ...props } = {}) {
  const r = render(
    <Envoltorio inicial={inicial} abierto={abierto} handleSubmitFormulario={enviar}
      onGuardarProgreso={guardar} savingForm={false} hasData={false} {...props} />,
  );
  await esperar();
  return r;
}

const cabeceras = (c) => c.querySelectorAll(".ex-secc-h");
const abrirSeccion = (c, i) => fireEvent.click(cabeceras(c)[i]);

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ["Date"] });
  respuestas = respuestasPorDefecto();
  apiGET.mockImplementation((ruta) => Promise.resolve(respuestas[ruta.split("?")[0]]));
  // jsdom no implementa scrollIntoView y «Continuar» lo usa para ir al error.
  Element.prototype.scrollIntoView = vi.fn();
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

describe("FormularioDatosAcademicos — secciones del expediente", () => {
  it("asesorado sin datos: primera sección, errores, presupuesto por defecto y resumen vacío", async () => {
    const { container } = await montar();
    expect(apiGET).toHaveBeenCalledWith("/api/catalogo/ramas");
    expect(html(container)).toMatchSnapshot("inicio");
    fireEvent.click(screen.getByText("Guardar y seguir"));
    expect(guardar).not.toHaveBeenCalled();
    expect(html(container)).toMatchSnapshot("errores");
    abrirSeccion(container, 4);
    await esperar();
    expect(html(container)).toMatchSnapshot("presupuesto por defecto");
    abrirSeccion(container, 6);
    expect(html(container)).toMatchSnapshot("resumen vacío");
    fireEvent.click(screen.getByText("Enviar a mi asesor"));
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it("asesor con todo contestado: cada sección abierta y el envío", async () => {
    const { container } = await montar({ inicial: COMPLETO, lado: "asesor", hasData: true });
    expect(html(container)).toMatchSnapshot("sección 1");
    for (let i = 1; i < 7; i++) {
      abrirSeccion(container, i);
      await esperar();
      expect(html(container)).toMatchSnapshot(`sección ${i + 1}`);
    }
    fireEvent.click(screen.getByText("Guardar el formulario"));
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it("asesorado con datos: guardar y seguir, cerrar todas y guardando", async () => {
    const { container, rerender } = await montar({ inicial: COMPLETO, hasData: true });
    fireEvent.click(screen.getByText("Guardar y seguir"));
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(html(container)).toMatchSnapshot("segunda sección");
    abrirSeccion(container, 1);
    expect(html(container)).toMatchSnapshot("todas cerradas");
    abrirSeccion(container, 6);
    expect(html(container)).toMatchSnapshot("resumen con datos");
    rerender(
      <Envoltorio inicial={COMPLETO} abierto handleSubmitFormulario={enviar}
        onGuardarProgreso={guardar} savingForm hasData />,
    );
    expect(html(container)).toMatchSnapshot("resumen guardando");
  });

  it("variantes: sin experiencia, inglés universitario, sin beca, fuera de AUIP y plan con comunidades", async () => {
    const { container } = await montar({ inicial: VARIANTE, planCCAAs: PLAN });
    expect(html(container)).toMatchSnapshot("formación");
    // El paso 1 está completo; el 2 no (promedio 25 sobre 20): salta ahí.
    fireEvent.click(screen.getByText("Guardar y seguir"));
    expect(html(container)).toMatchSnapshot("promedio fuera de rango");
    const avisoAuip = () => within(container.querySelector(".bg-amber-50"));
    fireEvent.click(avisoAuip().getByText("No"));
    expect(html(container)).toMatchSnapshot("no afiliada");
    fireEvent.click(screen.getByText("Cambiar"));
    fireEvent.click(avisoAuip().getByText("Sí"));
    expect(html(container)).toMatchSnapshot("afiliada a mano");
    for (const i of [1, 2, 3, 5, 6]) {
      abrirSeccion(container, i);
      expect(html(container)).toMatchSnapshot(`sección ${i + 1}`);
    }
  });

  it("interacciones: universidad, carrera, temas, puestos, formación, idioma y comunidades", async () => {
    const { container } = await montar({ inicial: { experiencia_anios: "2-3" } });
    const uni = screen.getByPlaceholderText("Empieza a escribir… PUCP, UNMSM, UBA, UNAM…");
    fireEvent.change(uni, { target: { value: "universidad de" } });
    expect(html(container)).toMatchSnapshot("sugerencias de universidad");
    fireEvent.mouseDown(screen.getByText("Universidad de Lima"));
    expect(html(container)).toMatchSnapshot("universidad elegida");
    fireEvent.change(uni, { target: { value: "Universidad Inventada del Sur" } });
    fireEvent.mouseDown(document.body);
    expect(html(container)).toMatchSnapshot("universidad no detectada");

    fireEvent.change(screen.getByPlaceholderText("Ej: Ingeniería Industrial, Derecho, Psicología…"), { target: { value: "Derec" } });
    await act(() => new Promise((r) => setTimeout(r, 300)));
    await esperar();
    expect(apiGET).toHaveBeenCalledWith("/api/catalogo/titulaciones?q=Derec");
    fireEvent.click(screen.getByText("Adm. y Negocios"));
    fireEvent.click(screen.getByText("Tercio superior"));
    expect(html(container)).toMatchSnapshot("carrera con sugerencias del catálogo");

    abrirSeccion(container, 1);
    fireEvent.click(screen.getByText("+ Añadir un puesto de trabajo"));
    fireEvent.change(screen.getByPlaceholderText("Entidad o empresa"), { target: { value: "Ministerio de Trabajo" } });
    fireEvent.click(screen.getByText("Sector público"));
    fireEvent.click(screen.getByText("Trabajo aquí actualmente"));
    fireEvent.click(screen.getByText("Sí, directamente relacionada"));
    fireEvent.click(screen.getByText("Diplomados, cursos o seminarios relacionados"));
    fireEvent.click(screen.getByText("Otras certificaciones o formaciones"));
    expect(html(container)).toMatchSnapshot("experiencia con un puesto");
    fireEvent.click(screen.getByText("Ninguna de las anteriores"));
    expect(html(container)).toMatchSnapshot("formación ninguna");

    abrirSeccion(container, 2);
    fireEvent.click(screen.getByText("Tengo certificación internacional (IELTS, TOEFL, Cambridge…)"));
    fireEvent.click(screen.getByText("Solo en español"));
    fireEvent.click(screen.getByText("Totalmente en inglés"));
    fireEvent.click(screen.getByText("Sí, me interesa"));
    fireEvent.click(screen.getByText("💸 Becas parciales / descuentos"));
    expect(html(container)).toMatchSnapshot("idiomas y becas");

    abrirSeccion(container, 3);
    const tema = screen.getByPlaceholderText("Ej.: cooperación internacional");
    fireEvent.change(tema, { target: { value: "Arbitraje;internacional" } });
    fireEvent.click(screen.getByText("Añadir"));
    fireEvent.click(screen.getByText("+ Finanzas corporativas"));
    fireEvent.change(screen.getByPlaceholderText("Primera opción"), { target: { value: "Máster en Finanzas" } });
    fireEvent.click(screen.getByText("Ciencias Sociales y Jurídicas"));
    fireEvent.click(screen.getByText("Economía y empresa"));
    fireEvent.click(screen.getByText("Seguir con investigación o doctorado"));
    expect(html(container)).toMatchSnapshot("qué quieres estudiar");
    fireEvent.click(screen.getByLabelText("Quitar Arbitraje internacional"));
    expect(html(container)).toMatchSnapshot("tema quitado");

    abrirSeccion(container, 4);
    fireEvent.change(container.querySelector("input[type=range]"), { target: { value: "12000" } });
    fireEvent.click(screen.getByText("Nada sin prácticas"));
    expect(html(container)).toMatchSnapshot("presupuesto movido");

    abrirSeccion(container, 5);
    fireEvent.click(screen.getByText("Cataluña"));
    fireEvent.click(screen.getByText("Galicia"));
    expect(html(container)).toMatchSnapshot("dos comunidades");
    fireEvent.click(screen.getByText("Me da igual / No tengo preferencia"));
    fireEvent.click(screen.getByText("Flexible / No sé"));
    expect(html(container)).toMatchSnapshot("indiferente y flexible");
  });

  it("sin catálogo: comunidades de respaldo y ramas cargando", async () => {
    respuestas["/api/catalogo/ramas"] = { ok: false };
    respuestas["/api/catalogo/comunidades"] = { ok: true, comunidades: [] };
    const { container } = await montar();
    abrirSeccion(container, 3);
    expect(html(container)).toMatchSnapshot("ramas cargando");
    abrirSeccion(container, 5);
    expect(html(container)).toMatchSnapshot("comunidades de respaldo");
  });
});

describe("FormularioDatosAcademicos — modo modal (sin el contexto)", () => {
  const modal = (c) => c.querySelector(".fixed");
  const botonX = (c) => c.querySelector(".fixed .border-b > button");

  it("cerrado, abierto en el primer paso, errores y Escape", async () => {
    const { container } = await montar({ abierto: false });
    expect(html(container)).toMatchSnapshot("cerrado");
    fireEvent.click(screen.getByText("Formulario de datos académicos"));
    expect(html(container)).toMatchSnapshot("paso 1");
    fireEvent.click(screen.getByText("Continuar →"));
    expect(html(container)).toMatchSnapshot("errores del paso 1");
    // Los círculos no saltan hacia delante sin datos guardados.
    fireEvent.click(screen.getByTitle("Región y fechas"));
    expect(modal(container).textContent).toContain("Paso 1 / 9");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(modal(container)).toBeNull();
  });

  it("con datos: los nueve pasos con Continuar, Anterior y guardar", async () => {
    const { container } = await montar({ abierto: false, inicial: COMPLETO, hasData: true });
    expect(html(container)).toMatchSnapshot("cerrado con datos");
    fireEvent.click(screen.getByText("Formulario de datos académicos"));
    for (let n = 1; n <= 9; n++) {
      expect(html(container)).toMatchSnapshot(`paso ${n}`);
      if (n < 9) fireEvent.click(screen.getByText("Continuar →"));
    }
    fireEvent.click(screen.getByText("← Anterior"));
    expect(modal(container).textContent).toContain("Paso 8 / 9");
    fireEvent.click(screen.getByTitle("Tu carrera universitaria"));
    expect(modal(container).textContent).toContain("Paso 1 / 9");
    fireEvent.click(screen.getByTitle("Región y fechas"));
    fireEvent.click(screen.getByText("✓ Guardar formulario"));
    await esperar();
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(modal(container)).toBeNull();
  });

  it("variante en el modal: pasos con las otras ramas y guardando", async () => {
    const { container } = await montar({ abierto: false, inicial: VARIANTE, hasData: true, planCCAAs: PLAN, savingForm: true });
    fireEvent.click(screen.getByText("Formulario de datos académicos"));
    fireEvent.click(screen.getByText("Continuar →"));
    fireEvent.click(screen.getByText("Continuar →"));
    expect(html(container)).toMatchSnapshot("paso 2 con el promedio fuera de rango");
    for (const titulo of ["Experiencia profesional", "Certificación de inglés", "Idioma del máster y becas", "Región y fechas"]) {
      fireEvent.click(screen.getByTitle(titulo));
      expect(html(container)).toMatchSnapshot(titulo);
    }
  });

  it("cerrar con la X: guarda el progreso y avisa si falta algo", async () => {
    const { container } = await montar({ abierto: false });
    fireEvent.click(screen.getByText("Formulario de datos académicos"));
    let soltar;
    guardar.mockImplementationOnce(() => new Promise((r) => { soltar = r; }));
    fireEvent.click(botonX(container));
    expect(html(container)).toMatchSnapshot("guardando al cerrar");
    await act(async () => { soltar(); });
    await esperar();
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(html(container)).toMatchSnapshot("aviso de incompleto");
    fireEvent.click(screen.getByText("Cerrar"));
    expect(modal(container)).toBeNull();
  });

  it("cerrar con la X con todo contestado cierra sin aviso", async () => {
    const { container } = await montar({ abierto: false, inicial: COMPLETO, hasData: true });
    fireEvent.click(screen.getByText("Formulario de datos académicos"));
    fireEvent.click(botonX(container));
    await esperar();
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(modal(container)).toBeNull();
  });
});
