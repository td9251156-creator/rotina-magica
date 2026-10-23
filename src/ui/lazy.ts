import { createElement, lazy, type ComponentType } from 'react';

const loaders = new Set<() => Promise<unknown>>();

/**
 * Componente que só é baixado quando aparece (ou quando `preloadScreens` roda).
 * Depois de carregado, renderiza direto, sem passar pelo Suspense de novo.
 */
export function lazyScreen<M, K extends keyof M>(load: () => Promise<M>, name: K): M[K] {
  type C = ComponentType<object>;
  let loaded: C | undefined;
  const preload = () => load().then((m) => { loaded = m[name] as C; return loaded; });
  loaders.add(preload);
  // Se o download falhar (sem rede, versão nova publicada), a próxima tentativa baixa de novo.
  const make = () => lazy(async () => {
    try { return { default: await preload() }; } catch (error) { Lazy = make(); throw error; }
  });
  let Lazy = make();
  const Screen = (props: object) => createElement(loaded ?? Lazy, props);
  return Screen as M[K];
}

/** Baixa todas as telas registradas; usado quando o navegador fica ocioso e nos testes. */
export async function preloadScreens(): Promise<void> {
  // Telas carregadas registram outras (os jogos, por exemplo): repete até não aparecer nenhuma nova.
  const done = new Set<() => Promise<unknown>>();
  while (done.size < loaders.size) {
    const pending = [...loaders].filter((load) => !done.has(load));
    pending.forEach((load) => done.add(load));
    await Promise.all(pending.map((load) => load().catch(() => undefined)));
  }
}
