// Los pasos para instalar el panel como app, por sistema.
//
// iPhone: los del instructivo de Carina (core/email/instructivosApp.js), que
// solo funcionan en Safari. Android: Chrome, menú ⋮ → «Instalar aplicación» o
// «Añadir a pantalla de inicio» (en Samsung Internet, el menú ☰ de abajo).
// Escritorio: el icono de instalar de la barra de direcciones de Chrome o Edge.
//
// Los usan la tarjeta de Inicio (AvisoInstalarApp) y la ventana del menú
// (InstalarAppModal). Antes vivían dentro de la tarjeta y solo había iPhone.

function Svg({ children, grosor = 2 }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={grosor}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconoCompartir = () => (
  <Svg><path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" /></Svg>
);
export const IconoAnadir = () => (
  <Svg><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8v8M8 12h8" /></Svg>
);
export const IconoListo = () => (
  <Svg grosor={2.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
);
export const IconoTelefono = () => (
  <Svg><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></Svg>
);
export const IconoMenuPuntos = () => (
  <Svg><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></Svg>
);
export const IconoMenuLineas = () => (
  <Svg><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
);
export const IconoPantalla = () => (
  <Svg><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /><path d="M12 7.5v6M9.5 11l2.5 2.5 2.5-2.5" /></Svg>
);

function Lista({ pasos }) {
  return (
    <ol className="ex-app-pasos">
      {pasos.map((p, i) => (
        <li key={i}>
          <span className="ex-app-paso-icono text-primary">{p.icono}</span>
          <span className="ex-app-paso-num text-accent">{i + 1}</span>
          <span>{p.texto}</span>
        </li>
      ))}
    </ol>
  );
}

export function PasosIphone() {
  return (
    <Lista pasos={[
      { icono: <IconoCompartir />, texto: <>Pulsa <b>Compartir</b>, el cuadrado con la flecha hacia arriba de la barra de Safari.</> },
      { icono: <IconoAnadir />, texto: <>Baja en las opciones y elige <b>«Añadir a pantalla de inicio»</b>.</> },
      { icono: <IconoListo />, texto: <>Pulsa <b>«Añadir»</b>. El icono de Inspira aparecerá en tu pantalla de inicio.</> },
    ]} />
  );
}

/** @param {{ samsung?: boolean }} props  Samsung Internet tiene el menú abajo. */
export function PasosAndroid({ samsung = false }) {
  if (samsung) {
    return (
      <Lista pasos={[
        { icono: <IconoMenuLineas />, texto: <>Pulsa el menú <b>☰</b> de la barra de abajo.</> },
        { icono: <IconoAnadir />, texto: <>Elige <b>«Añadir página a»</b> y después <b>«Pantalla de inicio»</b>.</> },
        { icono: <IconoListo />, texto: <>Confirma con <b>«Añadir»</b>. El icono de Inspira aparecerá con tus apps.</> },
      ]} />
    );
  }
  return (
    <Lista pasos={[
      { icono: <IconoMenuPuntos />, texto: <>En <b>Chrome</b>, pulsa el menú <b>⋮</b>, arriba a la derecha.</> },
      { icono: <IconoAnadir />, texto: <>Elige <b>«Instalar aplicación»</b> o, si no aparece, <b>«Añadir a pantalla de inicio»</b>.</> },
      { icono: <IconoListo />, texto: <>Confirma con <b>«Instalar»</b>. El icono de Inspira aparecerá con tus apps.</> },
    ]} />
  );
}

export function PasosEscritorio() {
  return (
    <Lista pasos={[
      { icono: <IconoPantalla />, texto: <>En <b>Chrome</b> o <b>Edge</b>, busca el icono de instalar a la derecha de la barra de direcciones.</> },
      { icono: <IconoMenuPuntos />, texto: <>Si no lo ves, abre el menú <b>⋮</b> (o <b>…</b> en Edge) y elige <b>«Instalar Inspira»</b> o <b>«Instalar esta página como aplicación»</b>.</> },
      { icono: <IconoListo />, texto: <>Confirma con <b>«Instalar»</b>. Se abrirá en su propia ventana.</> },
    ]} />
  );
}
