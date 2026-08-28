import { useState } from "react";
import { fotoTamano } from "./usuario";

/**
 * Foto de Google con reserva de iniciales.
 *
 * El `onError` no es un adorno: las URLs de `lh3.googleusercontent.com`
 * caducan, y una cuenta sin foto o con la imagen retirada dejaba un cuadro roto
 * en mitad del nav. Si la imagen no carga, se cae a las iniciales sin que se
 * note.
 *
 * Se guarda la URL que falló y no un simple booleano: así, cuando llega otra
 * foto (otra cuenta, o la que trae `/auth/me` después del primer pintado), se
 * vuelve a intentar sola, sin un efecto que resetee el estado.
 */
export default function Avatar({ foto, iniciales, nombre, size = 32, className = "" }) {
  const [fallida, setFallida] = useState(null);

  const url = fotoTamano(foto, size);
  const src = url && url !== fallida ? url : null;
  const estilo = { width: size, height: size, fontSize: Math.round(size * 0.4) };

  if (src) {
    return (
      <img
        src={src}
        alt={nombre || "Foto de perfil"}
        width={size}
        height={size}
        // Google devuelve 403 a las peticiones que llegan con Referer de otro
        // dominio en algunas cuentas.
        referrerPolicy="no-referrer"
        onError={() => setFallida(url)}
        className={`v4-avatar ${className}`}
        style={estilo}
      />
    );
  }

  return (
    <span className={`v4-avatar v4-avatar-ini ${className}`} style={estilo} aria-hidden="true">
      {iniciales}
    </span>
  );
}
