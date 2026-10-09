// @vitest-environment jsdom
//
// Instantáneas del HTML de InformeAdmin (09/10/2026). Se tomaron ANTES de
// partir InformeAdmin.jsx en piezas y sirven para eso: si un refactor cambia
// una clase, un texto o el orden de algo, falla. Si el cambio es a propósito,
// se regeneran con `npx vitest run -u` y se revisa el diff del .snap.
//
// Reloj y zona fijos (viernes 09/10/2026 10:20 en Lima): la fecha del PDF y
// los plazos de las tarjetas se pintan con la zona del navegador.
//
// vitest.config.js no carga el plugin de React, así que aquí el JSX se compila
// en modo clásico (React.createElement) y los componentes no importan React:
// se expone como global antes de cargar nada.
//
// ModalMaster se sustituye por un esqueleto: es un formulario entero del
// catálogo, con sus propias peticiones, y aquí solo interesa que se abra con
// los datos del catálogo que InformeAdmin le pasa.
import { vi, describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";

const zonaOriginal = await vi.hoisted(async () => {
  const antes = globalThis.process.env.TZ;
  globalThis.process.env.TZ = "America/Lima";
  globalThis.React = (await import("react")).default;
  return antes;
});

vi.mock("../../../../services/backofficeApi", () => ({
  boGET: vi.fn(), boPOST: vi.fn(), boPATCH: vi.fn(), boUpload: vi.fn(),
}));
vi.mock("../../../../services/dialogService", () => ({
  dialog: { toast: vi.fn(), confirm: vi.fn(), prompt: vi.fn() },
}));
vi.mock("../../catalogo/ModalMaster", () => ({
  default: ({ item, universidades, comunidades, ramas }) => (
    <div data-stub="ModalMaster">
      {item ? "editar" : "crear"} · {universidades.length} universidades · {comunidades.length} comunidades · {ramas.length} ramas
    </div>
  ),
}));

import { render, fireEvent, act, cleanup, screen } from "@testing-library/react";
import { boGET, boPATCH, boPOST, boUpload } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import InformeAdmin, { MasterRowAdmin } from "./InformeAdmin";

const AHORA = new Date("2026-10-09T10:20:00-05:00");
const RUTA_COMPAT = "/backoffice/solicitudes/77/compatibilidad";

// ── Catálogo falso ──────────────────────────────────────────────────────────

const UGR = { nombre_completo: "Universidad de Granada", sigla: "UGR", ciudad: "Granada", comunidad: { nombre: "Andalucía" }, url: "https://www.ugr.es" };
const UCM = { nombre_completo: "Universidad Complutense de Madrid", sigla: "UCM", ciudad: "Madrid", comunidad: "Comunidad de Madrid" };
const UV = { nombre_completo: "Universitat de València", sigla: "UV", ciudad: null, comunidad: { nombre: "Comunitat Valenciana" } };

const BAREMO = [
  { criterio: "Expediente académico", categoria: "EXPEDIENTE_ACADEMICO", peso: 60 },
  { criterio: "", categoria: "CURRICULUM_VITAE", peso: 20 },
  { criterio: "Entrevista", categoria: "ENTREVISTA", peso: 10 },
  { criterio: "Idiomas", categoria: "IDIOMAS", peso: 10 },
];

const M1 = {
  id_master: 101, nombre_limpio: "Máster en Derecho Digital", universidad: UGR,
  precio_final: 12500.4, precio_total_estimado: 12000, duracion_anios: 1, ects: 60, modalidad: "Presencial",
  de_que_va: "protección de datos · ciberseguridad · contratos",
  afinidad_deseada: "fuerte", coincide_con: "Derecho Digital", es_ancla: true,
  becas: [
    { entidad: "Fundación Carolina", nombre: "Beca Carolina", curso: "2027-28", nota_minima: 14, confianza: "segura" },
    { entidad: "AUIP", nombre: "Beca AUIP", curso: "2027-28", confianza: "probable" },
  ],
  motivo_descarte: "Supera su presupuesto",
  acceso_titulo: "directo", url_ficha: "https://www.ugr.es/master-derecho-digital", baremo: BAREMO,
  sub_area: { valor: 3, etiqueta: "Derecho" },
};
const M2 = {
  id_master: 102, nombre_limpio: "Máster en Protección de Datos", universidad: UCM,
  precio_total_estimado: 5044, duracion_anios: 1.5, afinidad_deseada: "parcial", coincide_con: "protección de datos",
  acceso_titulo: "afin", es_titulo_oficial: false, url_ficha: null,
};
const M3 = {
  id_master: 103, nombre_limpio: "Máster en Ciberseguridad", universidad: UV,
  duracion_anios: 2, afinidad_deseada: "fuerte", acceso_titulo: "fuera", estado_ficha: "no_hallado",
};
const M4 = { id_master: 104, nombre_limpio: "Máster en Abogacía", universidad: UGR, precio_total_estimado: 3200, acceso_titulo: "sin_lista" };
const M5 = { id_master: 105, nombre_limpio: "Máster en Derecho Ambiental", universidad: UCM, precio_final: 980, duracion_anios: 1, afinidad_deseada: "parcial" };
const M6 = { id_master: 106, nombre_limpio: "Máster en Derecho Tecnológico", universidad: UV, precio_total_estimado: 7400, afinidad_deseada: "fuerte", coincide_con: "Derecho Digital" };

const E1 = {
  id_master: 201, nombre_limpio: "Máster en Derecho de Empresa", universidad: UGR,
  precio_total_estimado: 4100, afinidad_deseada: "fuerte", coincide_con: "Derecho Digital",
  becas: [{ entidad: "AUIP" }], url_ficha: "https://www.ugr.es/master-empresa",
};
const E2 = {
  id_master: 202, nombre_limpio: "Máster en Gestión Pública", universidad: UCM,
  afinidad_deseada: "parcial", de_que_va: "administración · contratación pública",
};
const B1 = {
  id_master: 301, nombre_limpio: "Máster en Derechos Humanos", universidad: { sigla: null, nombre_completo: "Universidad de Deusto", comunidad: "País Vasco" },
  precio_total_estimado: 18250.6, becas: [{ entidad: "Fundación Carolina" }, { entidad: "Fundación Carolina" }],
};

const RESULTADOS = [
  { master: M1, score: 92, ventana: { inicio: "2026-11-02", fin: "2027-01-15", estado: "abierta" } },
  { master: M2, score: 74, ventana: { postulacion_inicio: "2027-02-01", fase: "segunda fase" } },
  { master: M3, score: 55 },
  { master: M4, score: null },
  { master: M5, score: 81, ventana: { estado: "cerrada" } },
];

const COMPAT = {
  ok: true, total: 37, finalistas: 3,
  resultados: RESULTADOS,
  extras: [{ master: E1, score: 70 }, { master: E2, score: 66 }],
  solo_con_beca: [{ master: B1, score: 88 }],
  fuera_del_plan: [],
  perfil: {
    anclas: [{ nombre_limpio: "Máster en Derecho Digital", universidad: "UGR" }],
    enlaces_sin_resolver: ["https://ejemplo.edu/master-x"],
    rama_label: "Ciencias Sociales y Jurídicas", sub_area_label: null,
    ccaa: ["Andalucía", "Comunidad de Madrid"],
  },
};

// Lo que devuelve el motor al recalcular: M1 cambia de puntuación, entra M6 y
// M3 deja de salir.
const COMPAT_RECALCULADO = {
  ...COMPAT, total: 39,
  resultados: [
    { master: { ...M1, afinidad_deseada: "parcial", coincide_con: "datos" }, score: 90 },
    { master: M6, score: 77 },
    { master: M2, score: 74 },
    { master: M5, score: 81 },
    { master: M4, score: null },
  ],
};

const DATOS_FORMULARIO = {
  masteres_deseados: ["Máster en Derecho Digital", ""],
  especializaciones: ["protección de datos"],
  comunidades_preferidas: ["Andalucía", "Madrid"],
  presupuesto_hasta: "15000",
  area_interes_master: "Derecho", area_carrera: "Derecho",
  promedio_peru: 15.2, promedio_escala: 20, ubicacion_grupo: "Tercio superior",
  experiencia_anios: "3", experiencia_vinculada: "Sí", ingles_situacion: "B2 certificado",
  objetivo_master: "Especializarme", investigacion_experiencia: null, modalidad_preferida: "Presencial",
  duracion_preferida: "1 año", practicas_preferencia: "Indiferente",
};

const DETALLE = {
  id_solicitud: 77, titulo: "Paquete Full Económico",
  informe_publicado: false, informe_revision_estado: null, informe_revision_nota: null,
  informe_compat_curado: null,
  informe_fecha_subida: "2026-09-30T15:20:00Z", informe_nombre_original: "informe-ana-torres.pdf",
  datos_formulario: DATOS_FORMULARIO,
};

const CURADO = [
  { master: M2, score: 74, nota_asesor: "Encaja con su experiencia en datos." },
  { master: M1, score: 92 },
];

const PARECIDOS = {
  ok: true, total: 3,
  resultados: [
    { master: M1, score: 92 },
    { master: E1, score: 70 },
    { master: M6, score: 77 },
  ],
};

const CATALOGO_BUSQUEDA = {
  ok: true,
  masters: [M1, M6, E2],
};

let respuestas;
function respuestasPorDefecto() {
  return {
    [RUTA_COMPAT]: COMPAT,
    [`${RUTA_COMPAT}/parecidos`]: PARECIDOS,
    "/backoffice/catalogo/masters": CATALOGO_BUSQUEDA,
    "/backoffice/catalogo/ramas": { ok: true, ramas: [{ valor: "CSJ" }, { valor: "ING" }] },
    "/backoffice/catalogo/comunidades": { ok: true, comunidades: [{ id_comunidad: 1 }] },
    "/backoffice/catalogo/universidades": { ok: true, universidades: [{ id_universidad: 1 }, { id_universidad: 2 }, { id_universidad: 3 }] },
  };
}

/** HTML exacto, con un salto entre etiquetas para que el diff se lea. */
const html = (c) => c.innerHTML.replace(/></g, ">\n<");
/** Deja que terminen las promesas de los fetch simulados. */
const esperar = async () => { for (let i = 0; i < 3; i++) await act(() => new Promise((r) => setTimeout(r, 0))); };
/** Espera a que venza el debounce de 300 ms del buscador. */
const esperarBuscador = async () => { await act(() => new Promise((r) => setTimeout(r, 350))); await esperar(); };
/** El botón cuyo texto empieza por `texto` (el n-ésimo si hay varios). */
const boton = (c, texto, n = 0) =>
  [...c.querySelectorAll("button")].filter((b) => b.textContent.trim().startsWith(texto))[n];

let recargar;
let onRegenerado;

async function montar(detalle = DETALLE) {
  const r = render(<InformeAdmin detalle={detalle} recargar={recargar} onRegenerado={onRegenerado} />);
  await esperar();
  return r;
}

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ["Date"] });
  respuestas = respuestasPorDefecto();
  boGET.mockImplementation((ruta) => {
    const clave = ruta.split("?")[0];
    return Promise.resolve(respuestas[clave] ?? { ok: false });
  });
  boPATCH.mockResolvedValue({ ok: true });
  boPOST.mockResolvedValue({ ok: true, avisado_a: "Carina Meza" });
  boUpload.mockResolvedValue({ ok: true });
  dialog.confirm.mockResolvedValue(true);
  recargar = vi.fn(() => Promise.resolve());
  onRegenerado = vi.fn();
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

describe("InformeAdmin — vista", () => {
  it("cargando, sin PDF y sin formulario", async () => {
    boGET.mockImplementation(() => new Promise(() => {}));
    const { container } = render(
      <InformeAdmin detalle={{ ...DETALLE, titulo: null, informe_fecha_subida: null, datos_formulario: null }} recargar={recargar} />,
    );
    expect(html(container)).toMatchSnapshot();
  });

  it("lista automática en borrador, con los parámetros desplegados", async () => {
    const { container } = await montar();
    expect(boGET).toHaveBeenCalledWith(RUTA_COMPAT);
    expect(container.textContent).toContain("Máster en Derecho Digital");
    expect(html(container)).toMatchSnapshot("cargada");
    fireEvent.click(boton(container, "Parámetros usados en el cálculo"));
    expect(html(container)).toMatchSnapshot("parámetros");
  });

  it.each([
    ["en revisión, con lista curada", { informe_revision_estado: "EN_REVISION", informe_compat_curado: CURADO }],
    ["aprobado", { informe_revision_estado: "APROBADO" }],
    ["devuelto", { informe_revision_estado: "DEVUELTO", informe_revision_nota: "Falta un máster en Madrid" }],
    ["publicado", { informe_publicado: true, informe_revision_estado: "APROBADO", informe_compat_curado: CURADO }],
  ])("estado de revisión: %s", async (_nombre, cambios) => {
    const { container } = await montar({ ...DETALLE, ...cambios });
    expect(html(container)).toMatchSnapshot();
  });

  it("no se pudo calcular", async () => {
    respuestas[RUTA_COMPAT] = { ok: false, msg: "Sin formulario" };
    const { container } = await montar();
    expect(html(container)).toMatchSnapshot();
  });

  it("sin programas compatibles", async () => {
    respuestas[RUTA_COMPAT] = { ok: true, total: 0, resultados: [], perfil: {} };
    const { container } = await montar({ ...DETALLE, datos_formulario: {} });
    expect(html(container)).toMatchSnapshot();
  });

  it("los que no entraron: pestañas y filtro", async () => {
    const { container } = await montar();
    fireEvent.click(boton(container, "Sólo con beca"));
    expect(html(container)).toMatchSnapshot("sólo con beca");
    fireEvent.click(boton(container, "En su plan"));
    const filtro = screen.getByPlaceholderText("Filtrar por nombre, universidad o comunidad…");
    fireEvent.change(filtro, { target: { value: "granada" } });
    expect(html(container)).toMatchSnapshot("filtro con resultados");
    fireEvent.change(filtro, { target: { value: "andalucia" } });
    expect(html(container)).toMatchSnapshot("filtro sin acentos");
    fireEvent.change(filtro, { target: { value: "zzz" } });
    expect(html(container)).toMatchSnapshot("filtro sin resultados");
  });

  it("nuevo máster: carga el catálogo y abre el modal", async () => {
    const { container } = await montar();
    fireEvent.click(boton(container, "Nuevo máster"));
    await esperar();
    expect(boGET).toHaveBeenCalledWith("/backoffice/catalogo/ramas");
    expect(html(container)).toMatchSnapshot();
  });

  it("recalcular sin lista curada: solo cuenta qué pasó", async () => {
    const { container } = await montar();
    respuestas[RUTA_COMPAT] = COMPAT_RECALCULADO;
    fireEvent.click(boton(container, "Recalcular con el formulario actual"));
    expect(html(container)).toMatchSnapshot("calculando");
    await esperar();
    expect(onRegenerado).toHaveBeenCalledTimes(1);
    expect(html(container)).toMatchSnapshot("recalculado");
    fireEvent.click(boton(container, "Entendido"));
    expect(container.textContent).not.toContain("Recalculado con el formulario actual");
  });

  it("acciones: mandar a revisión, publicar, subir PDF", async () => {
    const { container } = await montar();
    fireEvent.click(boton(container, "Mandar a revisión"));
    await esperar();
    expect(boPOST).toHaveBeenCalledWith(
      "/backoffice/solicitudes/77/informe/revision",
      { filtros: "Andalucía, Madrid · Máx. 15.000 €" },
    );
    expect(dialog.toast).toHaveBeenCalledWith("Avisado a Carina Meza", "success");
    expect(recargar).toHaveBeenCalledTimes(1);

    fireEvent.click(boton(container, "Publicar al cliente"));
    await esperar();
    expect(boPATCH).toHaveBeenNthCalledWith(1, "/backoffice/solicitudes/77/informe-compat", { lista: RESULTADOS });
    expect(boPATCH).toHaveBeenNthCalledWith(2, "/backoffice/solicitudes/77/publicar-informe", {});
    expect(dialog.toast).toHaveBeenLastCalledWith("Informe publicado · Cliente notificado por email", "success");

    const archivo = new File(["%PDF"], "informe.pdf", { type: "application/pdf" });
    fireEvent.change(container.querySelector("input[type=file]"), { target: { files: [archivo] } });
    await esperar();
    expect(boUpload).toHaveBeenCalledWith("/api/admin/solicitudes/77/informe", archivo);
  });

  it("aprobar y volver al automático", async () => {
    const { container } = await montar({ ...DETALLE, informe_revision_estado: "EN_REVISION", informe_compat_curado: CURADO });
    fireEvent.click(boton(container, "Aprobar"));
    await esperar();
    expect(boPATCH).toHaveBeenCalledWith("/backoffice/solicitudes/77/informe/revision", { estado: "APROBADO", nota: null });
    expect(dialog.toast).toHaveBeenCalledWith("Informe aprobado", "success");

    fireEvent.click(boton(container, "Volver al automático"));
    await esperar();
    expect(dialog.confirm).toHaveBeenCalledWith(
      "Se descarta la lista curada y el informe vuelve al cálculo automático. ¿Continuar?", "Volver al automático",
    );
    expect(boPATCH).toHaveBeenLastCalledWith("/backoffice/solicitudes/77/informe-compat", { lista: null });
    expect(onRegenerado).toHaveBeenCalledTimes(1);
  });
});

describe("InformeAdmin — edición", () => {
  it("modificar lista, reordenar, puntuar, añadir y quitar", async () => {
    const { container } = await montar();
    fireEvent.click(boton(container, "Modificar lista"));
    expect(html(container)).toMatchSnapshot("modo edición");

    // Bajar el primero con la flecha.
    const flechas = container.querySelectorAll("div.flex-col.gap-0\\.5 > button");
    fireEvent.click(flechas[1]);
    // Llevar el último al puesto 1 escribiendo en su número.
    const puestos = container.querySelectorAll('input[title="Escribe en qué puesto lo quieres y pulsa Enter"]');
    fireEvent.change(puestos[4], { target: { value: "1" } });
    fireEvent.blur(puestos[4]);
    // Puntuar a mano el que queda tercero.
    const notas = container.querySelectorAll('input[placeholder="—"]');
    fireEvent.change(notas[2], { target: { value: "130" } });
    expect(html(container)).toMatchSnapshot("reordenada y puntuada");

    // Añadir uno de los que no entraron y quitar otro de la lista.
    fireEvent.click(boton(container, "+ añadir"));
    fireEvent.click(screen.getAllByLabelText("Quitar de la lista")[0]);
    expect(html(container)).toMatchSnapshot("con añadido y quitado");

    fireEvent.click(boton(container, "Guardar curaduría"));
    await esperar();
    const lista = boPATCH.mock.calls[0][1].lista;
    expect(boPATCH.mock.calls[0][0]).toBe("/backoffice/solicitudes/77/informe-compat");
    // [M1 M2 M3 M4 M5] → baja M1 → M5 al 1 → M1 a 100 → entra E1 → sale M5.
    expect(lista.map((r) => [r.master.id_master, r.score])).toEqual([
      [102, 74], [101, 100], [103, 55], [104, null], [201, 70],
    ]);
    expect(recargar).toHaveBeenCalledTimes(1);
    expect(html(container)).toMatchSnapshot("guardada");
  });

  it("buscador del catálogo: con resultados, sin resultados y cancelar", async () => {
    const { container } = await montar();
    fireEvent.click(boton(container, "Modificar lista"));
    const buscador = screen.getByPlaceholderText("Buscar cualquier máster del catálogo…");
    fireEvent.change(buscador, { target: { value: "derecho" } });
    expect(html(container)).toMatchSnapshot("buscando");
    await esperarBuscador();
    expect(boGET).toHaveBeenCalledWith("/backoffice/catalogo/masters?search=derecho&limit=10&activo=true");
    expect(html(container)).toMatchSnapshot("con resultados");

    fireEvent.click(boton(container, "Máster en Gestión Pública"));
    // Al añadir desde el buscador el foco vuelve al campo para seguir escribiendo.
    expect(document.activeElement).toBe(buscador);
    expect(html(container)).toMatchSnapshot("añadido desde el buscador");

    respuestas["/backoffice/catalogo/masters"] = { ok: true, masters: [] };
    fireEvent.change(buscador, { target: { value: "zzz" } });
    await esperarBuscador();
    expect(html(container)).toMatchSnapshot("sin resultados");

    fireEvent.click(boton(container, "Cancelar"));
    expect(html(container)).toMatchSnapshot("cancelada");
  });

  it("buscar parecidos desde la cabecera entra a editar", async () => {
    const { container } = await montar();
    fireEvent.click(boton(container, "≈ Buscar parecidos a lo que pidió"));
    await esperar();
    expect(boGET).toHaveBeenCalledWith("/backoffice/solicitudes/77/compatibilidad/parecidos");
    expect(html(container)).toMatchSnapshot("parecidos");
    fireEvent.click(boton(container, "Máster en Derecho de Empresa"));
    expect(html(container)).toMatchSnapshot("parecido añadido");
  });

  it("parecidos sin nada nuevo avisan", async () => {
    respuestas[`${RUTA_COMPAT}/parecidos`] = { ok: true, total: 1, resultados: [{ master: M1, score: 92 }] };
    const { container } = await montar();
    fireEvent.click(boton(container, "Modificar lista"));
    fireEvent.click(boton(container, "≈ Buscar parecidos a lo que pidió", 1));
    await esperar();
    expect(dialog.toast).toHaveBeenCalledWith("Todos los parecidos ya están en la lista.", "info");
    expect(html(container)).toMatchSnapshot();
  });

  it("lista vacía en edición, sin lo que pidió", async () => {
    respuestas[RUTA_COMPAT] = { ok: true, total: 0, resultados: [], perfil: {} };
    const { container } = await montar({ ...DETALLE, datos_formulario: { presupuesto_hasta: 9000 } });
    fireEvent.click(boton(container, "Modificar lista"));
    expect(html(container)).toMatchSnapshot();
  });

  it("recalcular con lista curada y revisarlo en la lista", async () => {
    const { container } = await montar({ ...DETALLE, informe_compat_curado: CURADO });
    respuestas[RUTA_COMPAT] = COMPAT_RECALCULADO;
    fireEvent.click(boton(container, "Recalcular con el formulario actual"));
    await esperar();
    expect(html(container)).toMatchSnapshot("aviso");
    fireEvent.click(boton(container, "Revisar en la lista curada"));
    expect(html(container)).toMatchSnapshot("en la lista curada");
  });
});

describe("MasterRowAdmin suelto", () => {
  it("en vista y en edición sin número editable", () => {
    const { container } = render(
      <div>
        {RESULTADOS.map((r, i) => (
          <MasterRowAdmin key={r.master.id_master} posicion={i + 1} resultado={r} editMode={false}
            esFirst={i === 0} esLast={i === RESULTADOS.length - 1} />
        ))}
        <MasterRowAdmin posicion={4} resultado={{ master: M6, score: 77 }} editMode={true} esFirst={false} esLast={true} />
      </div>,
    );
    expect(html(container)).toMatchSnapshot();
    fireEvent.click(boton(container, "Ver los 4 criterios"));
    expect(html(container)).toMatchSnapshot("baremo entero");
  });
});
