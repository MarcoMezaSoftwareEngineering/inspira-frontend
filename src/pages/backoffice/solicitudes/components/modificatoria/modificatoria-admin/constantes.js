// Constantes del panel de la modificatoria. Salieron de ModificatoriaAdmin.jsx
// al partirlo en piezas (09/10/2026); los valores son los mismos.

export const TONOS = {
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-300",
  azul:    "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/25",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35",
};

export const input = "text-[12px] border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white " +
  "focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]";

export const ESTADO_DOC = {
  SIN_SUBIR: { icono: "○", label: "sin subir",   clase: "text-neutral-300" },
  PENDIENTE: { icono: "◐", label: "por revisar", clase: "text-amber-500" },
  APROBADO:  { icono: "✓", label: "aprobado",    clase: "text-[#1D6A4A]" },
  OBSERVADO: { icono: "✕", label: "observado",   clase: "text-red-600" },
};

// Los apartados de la ficha (los pinta Datos.jsx). Antes se creaban dentro del
// componente en cada render; como no dependen de nada, viven aquí.
// [etiqueta, campo, nombre con el que el servidor lo llama al faltar, extra]
export const SECCIONES = [
  ["La persona", [
    ["1er apellido", "apellido1", "Primer apellido"],
    ["2º apellido", "apellido2", null],
    ["Nombres", "nombres", "Nombres"],
    ["Sexo", "sexo", "Sexo", { opciones: ["Hombre", "Mujer", "X"] }],
    ["Pasaporte", "pasaporte_numero", "Nº de pasaporte"],
    ["NIE", "nie", "NIE"],
    ["Fecha de nacimiento", "fecha_nacimiento", "Fecha de nacimiento", { tipo: "date" }],
    ["Lugar de nacimiento", "lugar_nacimiento", "Lugar de nacimiento"],
    ["País de nacimiento", "pais_nacimiento", "País de nacimiento"],
    ["Nacionalidad", "nacionalidad", "Nacionalidad"],
    ["Estado civil", "estado_civil", "Estado civil",
      { opciones: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Separado/a"] }],
    ["Padre", "nombre_padre", "Nombre del padre"],
    ["Madre", "nombre_madre", "Nombre de la madre"],
    ["Teléfono", "telefono", "Teléfono", { tipo: "tel" }],
    ["Correo", "correo", "Correo electrónico", { tipo: "email" }],
  ]],
  ["Su domicilio", [
    ["Calle", "dom_direccion", "Domicilio en España"],
    ["Número", "dom_numero", null],
    ["Piso", "dom_piso", null],
    ["Localidad", "dom_localidad", "Localidad"],
    ["C.P.", "dom_cp", "Código postal"],
    ["Provincia", "dom_provincia", "Provincia"],
  ]],
  ["La empresa", [
    ["Razón social", "emp_razon_social", "Razón social de la empresa"],
    ["NIF", "emp_nif", "NIF de la empresa"],
    ["Actividad", "emp_actividad", "Actividad de la empresa"],
    ["CNAE", "emp_cnae", null],
    ["Domicilio social", "emp_direccion", "Domicilio social"],
    ["Localidad", "emp_localidad", "Localidad de la empresa"],
    ["C.P.", "emp_cp", "C.P. de la empresa"],
    ["Provincia", "emp_provincia", "Provincia de la empresa"],
    ["Teléfono", "emp_telefono", null, { tipo: "tel" }],
    ["Correo", "emp_correo", null, { tipo: "email" }],
  ]],
  ["El contrato", [
    ["Puesto", "con_puesto", "Puesto de trabajo"],
    ["Retribución bruta anual", "con_retribucion", "Retribución bruta anual"],
    ["Jornada (horas)", "con_jornada_horas", "Horas de jornada"],
    ["Duración", "con_duracion", "Duración del contrato",
      { opciones: ["1 año", "Indefinido"] }],
    ["Grupo cotización", "con_grupo_cotizacion", null],
    ["CNO SEPE", "con_cno_sepe", null],
    ["Cód. convenio", "con_codigo_convenio", null],
    ["Convenio", "con_denom_convenio", null],
    ["Cód. contrato", "con_codigo_contrato", null],
    ["Denom. contrato", "con_denom_contrato", null],
    ["Cuenta cotización", "con_cuenta_cotizacion", null],
  ]],
  ["Centro de trabajo", [
    ["Dirección", "con_centro_direccion", "Dirección del centro de trabajo"],
    ["Número", "con_centro_numero", null],
    ["Piso", "con_centro_piso", null],
    ["Localidad", "con_centro_localidad", "Localidad del centro de trabajo"],
    ["C.P.", "con_centro_cp", null],
    ["Provincia", "con_centro_provincia", "Provincia del centro de trabajo"],
  ]],
];
