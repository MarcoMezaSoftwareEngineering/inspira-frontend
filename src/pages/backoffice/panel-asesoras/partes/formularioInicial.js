// src/pages/backoffice/panel-asesoras/partes/formularioInicial.js
// Valores iniciales de ClienteForm (salieron de PanelAsesoras.jsx el 09/10/2026).

// Los campos que el expediente puede deducir tienen tres estados en el modal:
// "auto" (derivado), "si" y "no" (override manual de la asesora).
function triInicial(item, campo, valor) {
  return item?.origen?.[campo] === "manual" ? (valor ? "si" : "no") : "auto";
}
// Los campos de texto quedan vacios cuando estan en automatico.
function textoInicial(item, campo, valor) {
  return item?.origen?.[campo] === "manual" ? (valor || "") : "";
}

export function buildInitialForm(item) {
  return {
    name:         item?.name         || "",
    email:        "",
    estado:       item?.estado       || "ACTIVO",
    paquete:      item?.paquete      || "",
    carpeta:      item?.carpeta      || "",
    driveUrl:     item?.driveUrl     || "",
    portalUrl:    item?.portalUrl    || "",
    promedio:     textoInicial(item, "promedio", item?.promedio),
    interes:      textoInicial(item, "interes", item?.interes),
    uni_origen:   textoInicial(item, "uni_origen", item?.uni_origen),
    masterElegido:textoInicial(item, "masterElegido", item?.masterElegido),
    portalLinked: item?.portalLinked || false,
    beca_aprobable: item?.beca?.aprobable || false,
    beca_detalle:   item?.beca?.detalle   || "",
    notaMedia:    triInicial(item, "notaMedia", item?.notaMedia),
    cvEuropass:   triInicial(item, "cvEuropass", item?.cvEuropass),
    docCompletos: triInicial(item, "docCompletos", item?.docCompletos),
    fichero:      triInicial(item, "fichero", item?.pasos?.fichero),
    informe:      triInicial(item, "informe", item?.pasos?.informe),
    escogio:      triInicial(item, "escogio", item?.pasos?.escogio),
    postulacion:  triInicial(item, "postulacion", item?.pasos?.postulacion),
    fechaCita:  item?.fechaCita  || "",
    pasaporte:  item?.pasaporte  || "",
    fNac:       item?.fNac       || "",
    nie:        item?.nie        || "",
    expediente: item?.expediente || "",
    llegada:    item?.llegada    || "",
    plazoMax:   item?.plazoMax   || "",
    plazoIdeal: item?.plazoIdeal || "",
    detalle:    item?.detalle    || "",
    fPresentacion: item?.fPresentacion || "",
    centro:     item?.centro     || "",
    estadoAdm:  item?.estadoAdm  || "",
    resultado:  item?.resultado  || "",
    tipo:       item?.tipo       || "",
    asesor:     item?.asesor     || "",
    resolucion: item?.resolucion || "",
  };
}
