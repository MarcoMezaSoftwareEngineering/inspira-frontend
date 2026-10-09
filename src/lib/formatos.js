// Formateadores de fecha, hora y número compartidos (09/10/2026).
//
// Por qué existen: `fecha.toLocaleDateString("es-ES", {...})` crea por dentro
// un Intl.DateTimeFormat nuevo en cada llamada, y crearlo es lo caro (resolver
// el idioma, el calendario y las opciones). En la Agenda o en los paneles del
// expediente se llama decenas o cientos de veces por render. Aquí cada formato
// se crea una sola vez, al cargar el módulo, y se reutiliza.
//
// La salida es idéntica a la de la llamada que sustituyen; formatos.test.js lo
// comprueba formato por formato contra el toLocale*String original. Si se
// añade uno nuevo, cuidado con tres diferencias del estándar:
//   - toLocaleDateString con solo opciones de hora añade día, mes y año;
//     Intl.DateTimeFormat no.
//   - Date#toLocaleString sin opciones incluye la hora; Intl.DateTimeFormat
//     sin opciones, no.
//   - Con una fecha inválida toLocale*String devuelve "Invalid Date" e Intl
//     lanza RangeError. `formatear` conserva lo primero: un dato malo no debe
//     tumbar el render.
//
// Los formatos sin `timeZone` usan la zona del navegador en el momento de
// cargar el módulo, igual que toLocale*String en la práctica (la zona no cambia
// con la página abierta).

const LIMA = "America/Lima";

const FECHA_NUMERICA = new Intl.DateTimeFormat("es-ES");
const FECHA_LARGA = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" });
const FECHA_HORA_LARGA = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
const FECHA_CORTA_CON_HORA = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const FECHA_CON_DIA_SEMANA = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
const DIA_SEMANA_Y_MES = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const DIA_SEMANA_Y_MES_LIMA = new Intl.DateTimeFormat("es-ES", { timeZone: LIMA, weekday: "long", day: "numeric", month: "long" });
const MES_CORTO = new Intl.DateTimeFormat("es-ES", { month: "short" });
const HORA = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
const HORA_LIMA = new Intl.DateTimeFormat("es-ES", { timeZone: LIMA, hour: "2-digit", minute: "2-digit" });
// es-PE usa reloj de 12 horas: "02:05 p. m.".
const HORA_LIMA_PE = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: LIMA });

const NUMERO = new Intl.NumberFormat("es-ES");
const NUMERO_UN_DECIMAL_PE = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });

/** Acepta lo mismo que `new Date(valor)` (Date, texto ISO o milisegundos). */
function formatear(formato, valor) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "Invalid Date" : formato.format(fecha);
}

/** "9/10/2026" — toLocaleDateString("es-ES"). */
export const fechaNumerica = (valor) => formatear(FECHA_NUMERICA, valor);
/** "09 de octubre de 2026" — { day: "2-digit", month: "long", year: "numeric" }. */
export const fechaLarga = (valor) => formatear(FECHA_LARGA, valor);
/** "09 de octubre, 14:05" — { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }. */
export const fechaHoraLarga = (valor) => formatear(FECHA_HORA_LARGA, valor);
/** "9 oct 2026, 14:05" — { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }. */
export const fechaCortaConHora = (valor) => formatear(FECHA_CORTA_CON_HORA, valor);
/** "viernes, 9 de oct de 2026" — { weekday: "long", day: "numeric", month: "short", year: "numeric" }. */
export const fechaConDiaSemana = (valor) => formatear(FECHA_CON_DIA_SEMANA, valor);
/** "viernes, 9 de octubre" en la zona del navegador. */
export const diaSemanaYMes = (valor) => formatear(DIA_SEMANA_Y_MES, valor);
/** "viernes, 9 de octubre" en hora de Lima. */
export const diaSemanaYMesLima = (valor) => formatear(DIA_SEMANA_Y_MES_LIMA, valor);
/** "oct" — { month: "short" }. */
export const mesCorto = (valor) => formatear(MES_CORTO, valor);
/** "14:05" en la zona del navegador — toLocaleTimeString("es-ES", { hour, minute }). */
export const hora = (valor) => formatear(HORA, valor);
/** "14:05" en hora de Lima. */
export const horaLima = (valor) => formatear(HORA_LIMA, valor);
/** "02:05 p. m." en hora de Lima, con el formato peruano de 12 horas. */
export const horaLimaPE = (valor) => formatear(HORA_LIMA_PE, valor);

// Los de número sustituyen a `valor.toLocaleString(...)`. Si `valor` no es un
// número (un texto que llegó de la API, por ejemplo) se delega en su propio
// toLocaleString, que es lo que hacía la llamada original: "15000" seguiría
// saliendo "15000" y no "15.000".
const formatearNumero = (formato, valor, ...original) =>
  typeof valor === "number" ? formato.format(valor) : valor.toLocaleString(...original);

/** "12.345" — toLocaleString("es-ES"). Ojo: es-ES no agrupa los de 4 cifras ("1234"). */
export const numero = (valor) => formatearNumero(NUMERO, valor, "es-ES");
/** "12.345 €" — el importe en euros tal como lo escribe la web (sin decimales forzados). */
export const euros = (valor) => `${numero(valor)} €`;
/** "2,5" — toLocaleString("es-PE", { maximumFractionDigits: 1 }). */
export const numeroUnDecimalPE = (valor) =>
  formatearNumero(NUMERO_UN_DECIMAL_PE, valor, "es-PE", { maximumFractionDigits: 1 });
