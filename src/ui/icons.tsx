import { APP_ICONS, type IconId } from './app-icons';

/** Traço fino, no estilo do app; o desenho de cada ícone está em `app-icons.ts`. */
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export function Icon({ id }: { id: IconId }) {
  // Os desenhos vêm do próprio repositório e passam pelo teste de formato (só formas, sem script).
  return <svg {...base} dangerouslySetInnerHTML={{ __html: APP_ICONS[id] }} />;
}

export const Chevron = () => <Icon id="seta" />;
