// src/pages/bicentenario/compartirResultado.jsx
//
// Tarjeta del resultado para historias (1080×1920): se dibuja en el navegador
// con canvas, sin enviar nada. En móvil abre el menú de compartir con la
// imagen; donde no se puede, la descarga para subirla a mano.
import { useState } from "react";
import { CIFRAS } from "../../config/bicentenario2026";

const W = 1080;
const H = 1920;
const FUENTE = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const ENLACE = "inspira-legal.cloud/beca";

function rectRedondo(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function crearImagen({ total, max, nivel }) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");

  const fondo = g.createLinearGradient(0, 0, W, H);
  fondo.addColorStop(0, "#013446");
  fondo.addColorStop(1, "#0A5873");
  g.fillStyle = fondo;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#0F4F66";
  g.beginPath(); g.arc(W - 60, 240, 260, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(90, H - 200, 210, 0, Math.PI * 2); g.fill();

  g.textAlign = "center";
  g.fillStyle = "#FFC940";
  g.font = `800 40px ${FUENTE}`;
  g.fillText("🎓 PRONABEC · CONVOCATORIA 2026", W / 2, 250);
  g.fillStyle = "#FFFFFF";
  g.font = `800 78px ${FUENTE}`;
  g.fillText("Beca Generación", W / 2, 370);
  g.fillText("del Bicentenario", W / 2, 462);

  const cx = W / 2;
  const cy = 880;
  const radio = 290;
  const p = Math.max(0, Math.min(1, max ? total / max : 0));
  g.lineCap = "round";
  g.lineWidth = 58;
  g.strokeStyle = "#2A6B82";
  g.beginPath(); g.arc(cx, cy, radio, Math.PI * 0.75, Math.PI * 2.25); g.stroke();
  if (p > 0) {
    g.strokeStyle = "#FF9F43";
    g.beginPath(); g.arc(cx, cy, radio, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * p)); g.stroke();
  }
  g.fillStyle = "#FFC940";
  g.font = `900 200px ${FUENTE}`;
  g.fillText(String(total), cx, cy + 50);
  g.fillStyle = "#FFFFFF";
  g.font = `700 54px ${FUENTE}`;
  g.fillText(`de ${max} puntos`, cx, cy + 140);

  g.fillStyle = "#CFE6FD";
  g.font = `600 46px ${FUENTE}`;
  g.fillText(`Mi puntaje orientativo · ${nivel}`, W / 2, 1265);
  g.fillStyle = "#FFFFFF";
  g.font = `700 42px ${FUENTE}`;
  g.fillText(`🔥 Solo ${CIFRAS.total} becas · postula del 30/10 al 13/11`, W / 2, 1345);

  g.fillStyle = "#FFFFFF";
  rectRedondo(g, 110, 1430, W - 220, 250, 44);
  g.fill();
  g.fillStyle = "#013446";
  g.font = `800 52px ${FUENTE}`;
  g.fillText("¿Y tú cuánto sacarías? 👇", W / 2, 1525);
  g.fillStyle = "#0A5873";
  g.font = `800 60px ${FUENTE}`;
  g.fillText(ENLACE, W / 2, 1617);

  g.fillStyle = "#CFE6FD";
  g.font = `500 30px ${FUENTE}`;
  g.fillText("Simulador orientativo de Inspira Legal · no es PRONABEC", W / 2, 1800);

  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error("sin imagen"))), "image/png"));
}

async function compartir(datos) {
  const blob = await crearImagen(datos);
  const archivo = new File([blob], "mi-puntaje-beca-bicentenario.png", { type: "image/png" });
  const texto = `Mi puntaje orientativo para la Beca Generación del Bicentenario 2026: ${datos.total}/${datos.max}. Calcula el tuyo en https://www.${ENLACE}`;
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], text: texto });
      return "compartido";
    } catch (e) {
      if (e?.name === "AbortError") return "cancelado";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = archivo.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "descargado";
}

export function BotonCompartir({ total, max, nivel }) {
  const [estado, setEstado] = useState("");
  async function alPulsar() {
    setEstado("preparando");
    try {
      const r = await compartir({ total, max, nivel });
      setEstado(r === "descargado" ? "descargado" : "");
    } catch {
      setEstado("error");
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={alPulsar}
        disabled={estado === "preparando"}
        className="bic-press bic-cta inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-primary-dark shadow-lg shadow-accent/30 transition hover:bg-sun disabled:opacity-70"
      >
        <span aria-hidden="true">📲</span> {estado === "preparando" ? "Preparando tu imagen…" : "Compartir mi puntaje"}
      </button>
      {estado === "descargado" && (
        <span role="status" className="text-xs font-bold text-primary">✅ Imagen descargada: súbela a tus historias.</span>
      )}
      {estado === "error" && (
        <span role="status" className="text-xs font-bold text-red-700">No se pudo crear la imagen.</span>
      )}
    </>
  );
}
