/** Navegação por hash: funciona no GitHub Pages sem configuração de servidor e offline. */
export type RouteName = 'home' | 'sos' | 'primeiro-uso' | 'treino' | 'usei' | 'lab' | 'ajustes' | 'jogos' | 'diario' | 'rotina' | 'pensamento' | 'sons';
export type Route = { name: RouteName; param?: string };

const NAMES: readonly string[] = ['sos', 'primeiro-uso', 'treino', 'usei', 'lab', 'ajustes', 'jogos', 'diario', 'rotina', 'pensamento', 'sons'];

export function readRoute(hash = window.location.hash): Route {
  const [name, param] = hash.replace(/^#\/?/, '').split('/');
  return NAMES.includes(name) ? { name: name as RouteName, param } : { name: 'home' };
}

export function navigate(name: RouteName, param?: string) {
  const hash = name === 'home' ? '' : param ? `${name}/${param}` : name;
  if (window.location.hash.replace('#', '') === hash) return;
  window.location.hash = hash;
  window.scrollTo?.(0, 0);
}
