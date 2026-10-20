import { navigate, type RouteName } from '@/router';
import type { IconId } from './app-icons';
import { Icon } from './icons';
import { useData } from '@/data/provider';
import { supportFocus } from '@/domain/support';

const TABS: { route: RouteName; label: string; icon: IconId }[] = [
  { route: 'home', label: 'Hoje', icon: 'aba_hoje' },
  { route: 'sos', label: 'Ajuda agora', icon: 'aba_ajuda' },
  { route: 'diario', label: 'Diário', icon: 'aba_diario' },
  { route: 'ajustes', label: 'Ajustes', icon: 'aba_ajustes' },
];

/** Barra de baixo: as quatro áreas do app, sempre a um toque. */
export function TabBar({ current }: { current: RouteName }) {
  const { repos } = useData();
  const helpLabel = supportFocus(repos) === 'general' ? 'Pausa agora' : 'Ajuda agora';
  return (
    <nav className="tabbar" aria-label="Navegação principal">
      {TABS.map(({ route, label, icon }) => (
        <button
          key={route}
          type="button"
          className={`tabbar__item${current === route ? ' on' : ''}${route === 'sos' ? ' tabbar__item--sos' : ''}`}
          aria-current={current === route ? 'page' : undefined}
          onClick={() => navigate(route)}
        >
          <span className="tabbar__icon">
            <Icon id={icon} />
          </span>
          <span>{route === 'sos' ? helpLabel : label}</span>
        </button>
      ))}
    </nav>
  );
}
