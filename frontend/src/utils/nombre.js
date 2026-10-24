export function nombreAuto(marca = '', modelo = '') {
  const m = marca.trim();
  const n = modelo.trim();
  if (!m) return n;
  return n.toLowerCase().includes(m.toLowerCase()) ? n : `${m} ${n}`;
}

export const nombreHW = (hw) => nombreAuto(hw.marca_nombre, hw.modelo_nombre);