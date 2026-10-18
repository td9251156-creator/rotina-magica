import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Espaço livre para o tabuleiro: a largura do elemento e a altura da tela que sobra abaixo dele,
 * descontado `reserve` (botões e textos que vêm depois). Assim cada jogo usa a tela toda, em qualquer celular.
 */
export function useFitArea<T extends HTMLElement>(reserve: number) {
  const ref = useRef<T>(null);
  const [area, setArea] = useState({ width: 350, height: 460 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const width = el.clientWidth || Math.min(window.innerWidth, 560) - 32;
      // Na Ajuda agora a barra de abas fica embaixo: desconta a altura dela.
      const tabBar = el.closest('.sos-screen') ? 90 : 0;
      const height = Math.max(220, window.innerHeight - top - reserve - tabBar);
      setArea((a) => (a.width === width && a.height === height ? a : { width, height }));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reserve]);
  return [ref, area] as const;
}
