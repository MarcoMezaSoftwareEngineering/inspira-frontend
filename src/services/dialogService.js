let _handler = null;

// Avisos lanzados antes de que <InspiraDialog /> registre su manejador.
//
// InspiraDialog es hermano posterior de <App /> en main.jsx, y React ejecuta
// los efectos en orden de árbol: los avisos que App lanza al montar («Tu sesión
// caducó», «Esta cuenta no tiene acceso») llegaban con `_handler` a null y se
// perdían sin dejar rastro. Se guardan aquí y salen en cuanto hay quien los
// pinte. Solo los toasts: confirm y prompt esperan respuesta y no tiene
// sentido abrirlos más tarde.
const _pendientes = [];

export function _registerDialogHandler(fn) {
  _handler = fn;
  while (_handler && _pendientes.length) _handler(_pendientes.shift());
}

export const dialog = {
  toast(message, type = "info") {
    const item = { kind: "toast", message, toastType: type };
    if (_handler) _handler(item);
    else _pendientes.push(item);
  },
  confirm(message, title) {
    return new Promise((resolve) => {
      if (_handler) _handler({ kind: "confirm", message, title, resolve });
      else resolve(false);
    });
  },
  prompt(message, defaultValue = "", title) {
    return new Promise((resolve) => {
      if (_handler) _handler({ kind: "prompt", message, defaultValue, title, resolve });
      else resolve(null);
    });
  },
};
