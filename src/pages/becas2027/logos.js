// src/pages/becas2027/logos.js
// Logotipos de las entidades, solo para identificar cada beca o universidad.
// Son marcas de cada institución; se tomaron de sus webs oficiales y de
// Wikimedia Commons el 05/10/2026. La que no tiene logo aquí se pinta con su
// sigla (León, Córdoba).
import aecid from "../../assets/images/becas/aecid.webp";
import auip from "../../assets/images/becas/auip.webp";
import carolina from "../../assets/images/becas/carolina.webp";
import uah from "../../assets/images/becas/uah.webp";
import uc3m from "../../assets/images/becas/uc3m.webp";
import ucm from "../../assets/images/becas/ucm.webp";
import ue from "../../assets/images/becas/ue.webp";
import ugr from "../../assets/images/becas/ugr.webp";
import uja from "../../assets/images/becas/uja.webp";
import uma from "../../assets/images/becas/uma.webp";
import upna from "../../assets/images/becas/upna.webp";
import upv from "../../assets/images/becas/upv.webp";
import urjc from "../../assets/images/becas/urjc.webp";
import usal from "../../assets/images/becas/usal.webp";
import usc from "../../assets/images/becas/usc.webp";
import uv from "../../assets/images/becas/uv.webp";
import uvigo from "../../assets/images/becas/uvigo.webp";

export const LOGOS = { aecid, auip, carolina, uah, uc3m, ucm, ue, ugr, uja, uma, upna, upv, urjc, usal, usc, uv, uvigo };

// Ancho y alto reales de cada archivo, para que el <img> reserve su hueco
// antes de cargar (09/10/2026). Si se cambia un logo, se cambian aquí.
export const MEDIDAS_LOGOS = {
  aecid: [160, 160], auip: [160, 59], carolina: [160, 160], uah: [142, 160],
  uc3m: [160, 160], ucm: [160, 160], ue: [128, 128], ugr: [160, 160],
  uja: [160, 128], uma: [160, 160], upna: [160, 160], upv: [160, 160],
  urjc: [160, 61], usal: [160, 160], usc: [160, 104], uv: [152, 152],
  uvigo: [160, 160],
};
