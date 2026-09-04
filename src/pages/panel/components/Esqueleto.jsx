// Lo que se ve mientras llega el contenido: la forma de lo que viene.
//
// Un «Cargando…» a pelo deja la pantalla vacía y luego la llena de golpe;
// un esqueleto con la silueta de las tarjetas evita el salto y se nota que
// la aplicación está haciendo algo.

export function EsqueletoTarjetas({ n = 2 }) {
  return (
    <div className="pnl-grid" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="pnl-esq-tarjeta">
          <div className="flex gap-2">
            <span className="pnl-esq pnl-esq-linea" style={{ width: 90 }} />
            <span className="pnl-esq pnl-esq-linea" style={{ width: 70 }} />
          </div>
          <span className="pnl-esq pnl-esq-titulo" />
          <span className="pnl-esq pnl-esq-linea" style={{ width: "85%" }} />
          <span className="pnl-esq pnl-esq-linea" style={{ width: "55%" }} />
          <div className="flex justify-between items-center pt-2">
            <span className="pnl-esq pnl-esq-linea" style={{ width: 120 }} />
            <span className="pnl-esq" style={{ width: 118, height: 40, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Un expediente: cabecera, barra de secciones y cuerpo. */
export function EsqueletoExpediente() {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3" aria-busy="true" aria-label="Cargando tu expediente">
      <div className="flex items-center gap-3">
        <span className="pnl-esq" style={{ width: 44, height: 40, borderRadius: 12 }} />
        <span className="pnl-esq" style={{ flex: 1, height: 52, borderRadius: 16 }} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
        <div className="hidden md:flex w-52 shrink-0 flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="pnl-esq" style={{ height: 44, borderRadius: 12 }} />
          ))}
        </div>
        <div className="md:hidden flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="pnl-esq" style={{ width: 96, height: 38, borderRadius: 12 }} />
          ))}
        </div>
        <div className="flex-1 pnl-esq-tarjeta">
          <span className="pnl-esq pnl-esq-titulo" />
          <span className="pnl-esq pnl-esq-linea" style={{ width: "90%" }} />
          <span className="pnl-esq pnl-esq-linea" style={{ width: "70%" }} />
          <span className="pnl-esq pnl-esq-linea" style={{ width: "80%" }} />
        </div>
      </div>
    </div>
  );
}
