// src/pages/panel/GuiaApostilla.jsx

const GOLD       = "#C9963A";
const GOLD_LIGHT = "#E8B95A";

function StepCard({ medal, num, title, children }) {
  return (
    <div className="bg-white border border-amber-200/60 rounded-2xl mb-5 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3.5 px-5 py-4 border-b border-amber-200/40"
        style={{ background: "linear-gradient(90deg, rgba(201,150,58,.06) 0%, transparent 100%)" }}>
        <span className="text-2xl shrink-0 leading-none">{medal}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] font-mono" style={{ color: GOLD }}>{num}</p>
          <h3 className="font-serif text-base font-bold text-[#1A1410] leading-tight">{title}</h3>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function InfoBox({ pin, children }) {
  return (
    <div className="border-l-[3px] border-amber-400 rounded-r-xl px-4 py-3.5 mb-3"
      style={{ background: "rgba(201,150,58,.07)" }}>
      <p className="text-xs font-bold flex items-center gap-1.5 mb-2" style={{ color: GOLD }}>📌 {pin}</p>
      {children}
    </div>
  );
}

function WarnBox({ title, children }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3.5 mb-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">{title}</p>
      {children}
    </div>
  );
}

function LinkBlock({ href, icon, label, url }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-3 border border-amber-200/60 hover:bg-amber-50/50 transition-colors"
      style={{ background: "rgba(201,150,58,.05)", textDecoration: "none" }}>
      <span className="text-lg shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: GOLD_LIGHT }}>{label}</p>
        <p className="text-xs font-medium text-[#1A1410] break-all">{url}</p>
      </div>
    </a>
  );
}

function UploadList({ items }) {
  return (
    <ul className="space-y-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-[#3D2F22] py-2 border-b border-amber-100 last:border-0 leading-snug">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeeRow({ label, children }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-amber-100/60 last:border-0 text-sm">
      <span className="text-[#3D2F22]">{label}</span>
      {children}
    </div>
  );
}

function SuccessBanner({ icon, children }) {
  return (
    <div className="rounded-xl px-4 py-4 text-center mt-2"
      style={{ background: "linear-gradient(135deg, #1A2E1A, #223322)", border: "1px solid rgba(80,200,80,.2)" }}>
      <p className="text-2xl mb-1.5">{icon}</p>
      <p className="text-sm text-white/85 leading-relaxed">{children}</p>
    </div>
  );
}

export default function GuiaApostilla() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF6F0" }}>
      {/* Header */}
      <div className="px-6 py-10 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1410 0%, #3D2F22 60%, #2E1F0A 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,150,58,.18) 0%, transparent 70%)" }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-block text-[11px] font-bold uppercase tracking-[.2em] px-4 py-1.5 rounded-full mb-4 font-mono"
            style={{ background: "rgba(201,150,58,.15)", border: "1px solid rgba(201,150,58,.4)", color: GOLD_LIGHT }}>
            📌 Trámite 100% Digital
          </div>
          <h1 className="font-serif text-3xl font-bold text-white leading-tight mb-2">
            Guía Completa para{" "}
            <span style={{ color: GOLD_LIGHT }}>Apostilla Digital</span>
          </h1>
          <p className="text-white/55 text-sm font-light tracking-wide">Documentos académicos — Perú</p>
          <div className="w-14 h-0.5 mx-auto mt-5"
            style={{ background: "linear-gradient(90deg, transparent, #C9963A, transparent)" }} />
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Paso 1 */}
        <StepCard medal="🥇" num="Paso 1" title="Verifica tu documento">
          <p className="text-sm text-[#3D2F22] leading-relaxed mb-3">
            Antes de iniciar el trámite, asegúrate de que tu documento cumpla con lo siguiente:
          </p>
          <ul className="space-y-1.5 mb-4">
            {[
              "Tenga firma y sello de Secretaría General de la universidad.",
              "Esté correctamente emitido (sin enmendaduras).",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#3D2F22]">
                <span className="shrink-0">✔️</span>{item}
              </li>
            ))}
          </ul>
          <InfoBox pin="Importante">
            <p className="text-sm text-[#3D2F22] leading-relaxed">
              El documento <strong>NO se apostilla directamente.</strong>
            </p>
            <p className="text-sm text-[#3D2F22] leading-relaxed mt-1.5">
              Primero debe pasar por <strong>SUNEDU</strong>, quien emitirá la:
            </p>
            <p className="text-sm font-medium text-[#1A1410] mt-2">
              👉 <strong>Constancia de Verificación de Firmas (CVF)</strong>
            </p>
            <p className="text-xs text-[#5a4020] mt-2">
              🔎 Lo que se apostilla es la <strong>CVF</strong>, no el documento original.
            </p>
          </InfoBox>
        </StepCard>

        {/* Paso 2 */}
        <StepCard medal="🥈" num="Paso 2" title="Pago de tasas">
          <p className="text-sm text-[#3D2F22] leading-relaxed mb-3">Todos los pagos se realizan en:</p>
          <LinkBlock href="https://pagalo.pe/home" icon="🔗" label="Portal de pagos" url="pagalo.pe/home" />

          <InfoBox pin="Tasa SUNEDU">
            <FeeRow label="Código">
              <code className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded font-mono">00008</code>
            </FeeRow>
            <FeeRow label="Concepto">
              <span className="text-sm font-medium text-[#1A1410]">Constancia de Verificación de Firma</span>
            </FeeRow>
            <FeeRow label="Costo">
              <span className="font-bold text-[#1A1410] text-base">S/ 13.10</span>
            </FeeRow>
            <p className="text-xs font-medium mt-2" style={{ color: GOLD }}>
              💡 Se paga por cada documento que desees verificar.
            </p>
          </InfoBox>

          <InfoBox pin="Tasa Ministerio de Relaciones Exteriores (Apostilla)">
            <FeeRow label="Código">
              <code className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded font-mono">04517</code>
            </FeeRow>
            <FeeRow label="Entidad">
              <span className="text-sm font-medium text-[#1A1410]">Ministerio de Relaciones Exteriores</span>
            </FeeRow>
            <FeeRow label="Costo">
              <span className="font-bold text-[#1A1410] text-base">S/ 18.00</span>
            </FeeRow>
          </InfoBox>

          <WarnBox title="⚠️ Excepción importante">
            <p className="text-sm text-amber-900">
              Si en la verificación de firmas aparece alguno de estos documentos:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Constancia de Estudios", "Bachiller", "Título"].map((t) => (
                <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(201,150,58,.15)", border: "1px solid rgba(201,150,58,.35)", color: "#B07800" }}>
                  {t}
                </span>
              ))}
            </div>
            <p className="text-sm text-amber-900 mt-2.5">
              👉 Estos documentos quedan <strong>exonerados del pago en RREE.</strong>
            </p>
          </WarnBox>
        </StepCard>

        {/* Paso 3 */}
        <StepCard medal="🥉" num="Paso 3" title="Ingreso en SUNEDU">
          <p className="text-sm text-[#3D2F22] leading-relaxed mb-3">
            Con la tasa SUNEDU pagada, ingresa al portal:
          </p>
          <LinkBlock href="https://enlinea.sunedu.gob.pe/" icon="🔗" label="Portal SUNEDU en línea" url="enlinea.sunedu.gob.pe" />
          <InfoBox pin="Debes subir">
            <UploadList items={[
              "Documento académico escaneado",
              "Voucher de pago",
              "Datos personales solicitados",
            ]} />
          </InfoBox>
          <SuccessBanner icon="📩">
            SUNEDU enviará la{" "}
            <strong className="text-green-300">Constancia de Verificación de Firmas (CVF)</strong>{" "}
            a tu correo electrónico.
          </SuccessBanner>
        </StepCard>

        {/* Paso 4 */}
        <StepCard medal="🏛️" num="Paso 4" title="Apostilla Digital (RREE)">
          <p className="text-sm text-[#3D2F22] leading-relaxed mb-3">
            Una vez recibas la CVF en tu correo, ingresa al portal:
          </p>
          <LinkBlock
            href="https://serviciosalciudadano.rree.gob.pe/psc_webapp/"
            icon="🔗"
            label="Apostilla Digital – RREE"
            url="serviciosalciudadano.rree.gob.pe/psc_webapp"
          />
          <InfoBox pin="Subes">
            <UploadList items={[
              "La CVF emitida por SUNEDU",
              "Voucher de pago (si corresponde)",
            ]} />
          </InfoBox>
          <SuccessBanner icon="✅">
            Todo el trámite es <strong className="text-green-300">100% digital 🤗</strong>
            <br />No necesitas acudir presencialmente.
          </SuccessBanner>
        </StepCard>

        {/* Portal Inspira */}
        <div className="rounded-2xl px-5 py-6 mt-1"
          style={{ background: "linear-gradient(135deg, #1A1410 0%, #3D2F22 100%)" }}>
          <p className="font-serif text-base font-bold mb-1 flex items-center gap-2" style={{ color: GOLD_LIGHT }}>
            🎓 Carga en tu Expediente Digital Inspira
          </p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,.6)" }}>
            Una vez tengas la apostilla, sube los documentos al portal.{" "}
            <strong className="text-amber-300">Cada documento se sube de la siguiente forma:</strong>
          </p>
          {[
            { n: "1", icon: "📄", label: "Diploma o Certificado", desc: "documento académico original" },
            { n: "2", icon: "🏫", label: "SUNEDU",               desc: "Constancia de Verificación de Firmas (CVF)" },
            { n: "3", icon: "📝", label: "Apostilla",            desc: "documento apostillado emitido por RREE" },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3 py-2.5 text-sm leading-snug"
              style={{ borderBottom: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.8)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "rgba(201,150,58,.25)", border: "1px solid rgba(201,150,58,.4)", color: GOLD_LIGHT }}>
                {s.n}
              </div>
              <span>{s.icon} <strong className="text-white">{s.label}</strong> — {s.desc}</span>
            </div>
          ))}
          <p className="text-center text-xs mt-3.5" style={{ color: "rgba(255,255,255,.35)" }}>
            ↑ Repite este proceso por cada documento que necesites registrar.
          </p>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "#8a7060" }}>
          Guía orientativa – Verifica siempre en los portales oficiales las condiciones vigentes.
        </p>
      </div>
    </div>
  );
}
