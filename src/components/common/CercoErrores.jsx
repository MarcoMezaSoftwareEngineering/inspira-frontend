// Cerco de errores: si un paso falla al pintarse, se ve el aviso y el resto
// del panel sigue en pie. Antes un error en una tarjeta dejaba toda la
// pantalla en blanco y nadie sabía por qué (informe, 08/09/2026).
//
// El error se manda al servidor para poder leerlo en los registros, sin
// datos personales: mensaje, pila, URL y versión del bundle.
import { Component } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function avisarServidor(error, info, donde) {
  try {
    const cuerpo = JSON.stringify({
      donde,
      mensaje: String(error?.message || error),
      pila: String(error?.stack || "").slice(0, 4000),
      componente: String(info?.componentStack || "").slice(0, 2000),
      url: window.location.href,
      agente: navigator.userAgent,
      version: document.querySelector('script[type="module"][src*="/assets/"]')?.getAttribute("src") || null,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_URL}/api/errores-web`, new Blob([cuerpo], { type: "application/json" }));
    } else {
      fetch(`${API_URL}/api/errores-web`, { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo, keepalive: true }).catch(() => {});
    }
  } catch { /* nada: avisar no puede fallar más que el error */ }
}

export default class CercoErrores extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[cerco]", this.props.donde || "", error, info?.componentStack);
    avisarServidor(error, info, this.props.donde || "");
  }

  componentDidUpdate(prev) {
    // Al cambiar de paso (la clave) se vuelve a intentar.
    if (this.state.error && prev.clave !== this.props.clave) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const { titulo = "Este paso no se pudo mostrar", onVolver } = this.props;
    return (
      <div className="ex-sec" style={{ padding: "22px 20px" }}>
        <p style={{ fontSize: 14.5, fontWeight: 800, margin: 0 }}>{titulo}</p>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "6px 0 14px", lineHeight: 1.5 }}>
          Ya quedó registrado para revisarlo. Prueba a recargar; si sigue igual, dilo en Mensajes.
        </p>
        <details style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 14 }}>
          <summary>Detalle técnico</summary>
          <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0" }}>{String(this.state.error?.message || this.state.error)}</pre>
        </details>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="ex-btn" onClick={() => window.location.reload()}>Recargar</button>
          {onVolver && <button type="button" className="ex-btn sec" onClick={onVolver}>Volver</button>}
        </div>
      </div>
    );
  }
}
