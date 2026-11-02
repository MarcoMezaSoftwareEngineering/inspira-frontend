// Constantes, helpers y componentes UI compartidos entre PerfilCliente y WizardPerfilCliente.
import { useEffect, useRef, useState } from "react";
import IconoPaso from "../../../components/common/IconoPaso";

export const PAISES = [
  { codigo: "PE", nombre: "Perú",            prefijo: "+51",  emoji: "🇵🇪" },
  { codigo: "ES", nombre: "España",          prefijo: "+34",  emoji: "🇪🇸" },
  { codigo: "CO", nombre: "Colombia",        prefijo: "+57",  emoji: "🇨🇴" },
  { codigo: "MX", nombre: "México",          prefijo: "+52",  emoji: "🇲🇽" },
  { codigo: "AR", nombre: "Argentina",       prefijo: "+54",  emoji: "🇦🇷" },
  { codigo: "CL", nombre: "Chile",           prefijo: "+56",  emoji: "🇨🇱" },
  { codigo: "EC", nombre: "Ecuador",         prefijo: "+593", emoji: "🇪🇨" },
  { codigo: "BO", nombre: "Bolivia",         prefijo: "+591", emoji: "🇧🇴" },
  { codigo: "VE", nombre: "Venezuela",       prefijo: "+58",  emoji: "🇻🇪" },
  { codigo: "UY", nombre: "Uruguay",         prefijo: "+598", emoji: "🇺🇾" },
  { codigo: "PY", nombre: "Paraguay",        prefijo: "+595", emoji: "🇵🇾" },
  { codigo: "CR", nombre: "Costa Rica",      prefijo: "+506", emoji: "🇨🇷" },
  { codigo: "PA", nombre: "Panamá",          prefijo: "+507", emoji: "🇵🇦" },
  { codigo: "GT", nombre: "Guatemala",       prefijo: "+502", emoji: "🇬🇹" },
  { codigo: "HN", nombre: "Honduras",        prefijo: "+504", emoji: "🇭🇳" },
  { codigo: "SV", nombre: "El Salvador",     prefijo: "+503", emoji: "🇸🇻" },
  { codigo: "NI", nombre: "Nicaragua",       prefijo: "+505", emoji: "🇳🇮" },
  { codigo: "DO", nombre: "Rep. Dominicana", prefijo: "+1",   emoji: "🇩🇴" },
  { codigo: "CU", nombre: "Cuba",            prefijo: "+53",  emoji: "🇨🇺" },
  { codigo: "US", nombre: "Estados Unidos",  prefijo: "+1",   emoji: "🇺🇸" },
  { codigo: "BR", nombre: "Brasil",          prefijo: "+55",  emoji: "🇧🇷" },
  { codigo: "PT", nombre: "Portugal",        prefijo: "+351", emoji: "🇵🇹" },
  { codigo: "FR", nombre: "Francia",         prefijo: "+33",  emoji: "🇫🇷" },
  { codigo: "DE", nombre: "Alemania",        prefijo: "+49",  emoji: "🇩🇪" },
  { codigo: "IT", nombre: "Italia",          prefijo: "+39",  emoji: "🇮🇹" },
  { codigo: "GB", nombre: "Reino Unido",     prefijo: "+44",  emoji: "🇬🇧" },
];

export const AREAS = [
  "Administración y Negocios", "Derecho", "Ingeniería y Tecnología",
  "Ciencias Sociales", "Educación", "Salud", "Humanidades",
  "Medio Ambiente", "Arte y Diseño", "Otra",
];

export const UNIS = [
  "Universidad Nacional Mayor de San Marcos", "Pontificia Universidad Católica del Perú",
  "Universidad de Lima", "Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia", "Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico", "Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas", "Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal", "Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  "Universidad Nacional de Colombia", "Universidad de los Andes",
  "Universidad de Antioquia", "Pontificia Universidad Javeriana",
  "Universidad del Rosario", "Universidad del Valle",
  "Universidad Industrial de Santander",
  "Universidad Nacional Autónoma de México", "Instituto Politécnico Nacional",
  "Universidad de Guadalajara", "Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla", "Tecnológico de Monterrey",
  "Universidad de Buenos Aires", "Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata", "Universidad Nacional de Rosario",
  "Universidad de Chile", "Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidade de São Paulo", "Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  "Universidad Central del Ecuador", "ESPOL – Escuela Politécnica del Litoral",
  "Universidad San Francisco de Quito",
  "Universidad Central de Venezuela", "Universidad del Zulia",
  "Universidad Mayor de San Andrés", "Universidad Nacional de Asunción",
  "Universidad de la República", "Universidad de Costa Rica",
  "Universidad de San Carlos de Guatemala",
  "Universidad Autónoma de Santo Domingo",
  "Universidade de Lisboa", "Universidade do Porto",
];

export const LONG_TEL = {
  "+51": [9, 9], "+34": [9, 9], "+57": [10, 10], "+52": [10, 10],
  "+54": [10, 10], "+56": [9, 9], "+593": [9, 9], "+591": [8, 8],
  "+58": [10, 10], "+598": [8, 9], "+595": [9, 9], "+506": [8, 8],
  "+507": [8, 8], "+502": [8, 8], "+504": [8, 8], "+503": [8, 8],
  "+505": [8, 8], "+1": [10, 10], "+53": [8, 8], "+55": [10, 11],
  "+351": [9, 9], "+33": [9, 9], "+49": [10, 11], "+39": [9, 10],
  "+44": [10, 10],
};

export const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export const PRES_MIN  = 500;
export const PRES_MAX  = 15000;
export const PRES_STEP = 250;

export function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function parseTelefono(tel) {
  if (!tel) return { prefijo: "+51", numero: "" };
  const prefijos = [...PAISES.map(p => p.prefijo)].sort((a, b) => b.length - a.length);
  for (const p of prefijos) {
    if (tel.startsWith(p + " ")) return { prefijo: p, numero: tel.slice(p.length + 1) };
    if (tel.startsWith(p))       return { prefijo: p, numero: tel.slice(p.length) };
  }
  return { prefijo: "+51", numero: tel };
}

export function parseInicioPrevisto(str) {
  if (!str) return { mes: "", anio: "" };
  const parts = String(str).trim().split(" ");
  const mes = MESES.includes(parts[0]) ? parts[0] : "";
  const anio = parts[1] || "";
  return { mes, anio };
}

// ── Combobox ───────────────────────────────────────────────────────────────────
export function Combobox({ value, onChange, options, placeholder, renderOption, getLabel, allowCustom = false }) {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [display, setDisplay] = useState("");
  const wrapRef  = useRef(null);
  const queryRef = useRef("");

  useEffect(() => { queryRef.current = query; }, [query]);
  useEffect(() => { setDisplay(value ? (getLabel ? getLabel(value) : value) : ""); }, [value]); // eslint-disable-line

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        if (allowCustom && queryRef.current.trim()) {
          const c = queryRef.current.trim(); onChange(c); setDisplay(c);
        }
        setQuery(""); setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [allowCustom]); // eslint-disable-line

  const filtered = query.length >= 1
    ? options.filter(o => norm(getLabel ? getLabel(o) : String(o)).includes(norm(query))).slice(0, 8)
    : options.slice(0, 8);

  function select(opt) {
    onChange(opt);
    setDisplay(getLabel ? getLabel(opt) : String(opt));
    setQuery(""); setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input type="text"
        value={open ? query : display}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered.length > 0) select(filtered[0]);
            else if (allowCustom && query.trim()) { const c = query.trim(); onChange(c); setDisplay(c); setQuery(""); setOpen(false); }
          } else if (e.key === "Escape") { setQuery(""); setOpen(false); }
        }}
        placeholder={placeholder}
        className="pnl-campo-control"
      />
      {open && filtered.length > 0 && (
        <ul className="pnl-combo-lista absolute z-30 mt-1 w-full overflow-y-auto">
          {filtered.map((o, i) => (
            <li key={i}>
              <button type="button" onMouseDown={() => select(o)}
                className="pnl-combo-opcion">
                {renderOption ? renderOption(o) : String(o)}
              </button>
            </li>
          ))}
          {allowCustom && (
            <li className="pnl-combo-nota">
              Escribe si no aparece en la lista
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Primitivos ─────────────────────────────────────────────────────────────────
export function FL({ children, noEdit }) {
  return (
    <label className="pnl-campo-etiqueta block mb-1.5">
      {children}{noEdit && <small className="ml-1">(no editable)</small>}
    </label>
  );
}

export function TI({ name, value, onChange, placeholder, type = "text", disabled, className = "", err }) {
  return (
    <input type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      data-estado={err ? "error" : undefined}
      className={`pnl-campo-control ${className}`}
    />
  );
}

export function ErrMsg({ msg }) {
  if (!msg) return null;
  return <p className="pnl-campo-ayuda mt-1">{msg}</p>;
}

export function TelefonoInput({ prefijo, numero, onPrefijo, onNumero }) {
  const digits   = numero.replace(/\D/g, "");
  const rango    = LONG_TEL[prefijo];
  const invalido = digits.length > 0 && rango && (digits.length < rango[0] || digits.length > rango[1]);
  const valido   = digits.length > 0 && rango && digits.length >= rango[0] && digits.length <= rango[1];
  const hintLong = rango ? (rango[0] === rango[1] ? `${rango[0]} dígitos` : `${rango[0]}–${rango[1]} dígitos`) : null;
  return (
    <div>
      <div className="flex gap-2">
        <select value={prefijo} onChange={e => onPrefijo(e.target.value)}
          className="pnl-campo-control pnl-campo-prefijo shrink-0">
          {PAISES.map(p => <option key={p.codigo} value={p.prefijo}>{p.emoji} {p.prefijo}</option>)}
        </select>
        <input type="tel" value={numero} onChange={e => onNumero(e.target.value)}
          placeholder="999 999 999"
          data-estado={invalido ? "error" : undefined}
          className="pnl-campo-control flex-1 min-w-0"
        />
      </div>
      {hintLong && digits.length > 0 && (
        <p className={`pnl-campo-pista mt-1 ${invalido ? "text-alto-ink" : valido ? "text-verde-ink" : "text-muted"}`}>
          {invalido
            ? `Esperado: ${hintLong} (tienes ${digits.length})`
            : <><IconoPaso nombre="check" className="w-3.5 h-3.5" strokeWidth={2.6} />Longitud correcta</>}
        </p>
      )}
    </div>
  );
}

// ── Slider de presupuesto ──────────────────────────────────────────────────────
export function SliderPresupuesto({ value, onChange }) {
  const val = Number(value) || PRES_MIN;
  const pct = ((val - PRES_MIN) / (PRES_MAX - PRES_MIN)) * 100;
  return (
    <div>
      <p className="pnl-perfil-cifra mb-2">
        {val.toLocaleString("es-ES")} €
      </p>
      <input
        type="range"
        min={PRES_MIN} max={PRES_MAX} step={PRES_STEP}
        value={val}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          "--pista-rango": `linear-gradient(to right, var(--primary-2) ${pct}%, var(--pista) ${pct}%)`,
        }}
        className="w-full h-11 bg-transparent cursor-pointer appearance-none
          [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
          [&::-webkit-slider-runnable-track]:[background:var(--pista-rango)]
          [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full
          [&::-moz-range-track]:[background:var(--pista-rango)]
          [&::-webkit-slider-thumb]:-mt-[9px]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(1,52,70,.35)]
          [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
          [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white"
      />
      <div className="flex justify-between text-meta text-tinta-2 mt-2 tabular-nums">
        <span>500 €</span><span>7.500 €</span><span>15.000 €</span>
      </div>
      <p className="text-meta text-tinta-2 mt-1">Solo tasas universitarias. No incluye alojamiento ni manutención.</p>
    </div>
  );
}

// ── Selector mes / año ─────────────────────────────────────────────────────────
export function MesAnioSelect({ mes, anio, onMes, onAnio, err }) {
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 6 }, (_, i) => anioActual + i);
  const cls = "pnl-campo-control";
  return (
    <div className="flex gap-2">
      <select value={mes} onChange={e => onMes(e.target.value)} data-estado={err ? "error" : undefined} className={`flex-1 min-w-0 ${cls}`}>
        <option value="">— Mes —</option>
        {MESES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={anio} onChange={e => onAnio(e.target.value)} data-estado={err ? "error" : undefined} className={`pnl-campo-anio shrink-0 ${cls}`}>
        <option value="">— Año —</option>
        {anios.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
}
