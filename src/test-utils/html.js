// Vuelca el HTML de un contenedor para las instantáneas (toMatchSnapshot).
//
// Normaliza lo que cambia según la versión de ICU de Node y no según nuestro
// código, para que las instantáneas den lo mismo en el portátil y en la VPS
// (Node 20 con ICU 78 en producción, otras versiones en local):
//   - el espacio de «a. m.» / «p. m.» y de algunos formatos: espacio duro
//     (U+00A0), estrecho (U+202F) o normal según la versión;
//   - fecha con hora: «08 de octubre, 16:15» o «08 de octubre a las 16:15».
export const html = (c) =>
  c.innerHTML
    .replace(/></g, ">\n<")
    .replace(/&nbsp;| | /g, " ")
    .replace(/ a las (\d)/g, ", $1");
