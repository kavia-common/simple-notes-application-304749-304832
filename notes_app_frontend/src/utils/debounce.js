// PUBLIC_INTERFACE
export function debounce(fn, waitMs) {
  /** Debounce a function, calling only after waitMs of inactivity. Returns a debounced wrapper with .cancel(). */
  let t = null;

  function debounced(...args) {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => {
      t = null;
      fn(...args);
    }, waitMs);
  }

  debounced.cancel = () => {
    if (t) window.clearTimeout(t);
    t = null;
  };

  return debounced;
}
