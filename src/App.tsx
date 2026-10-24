import { Suspense, useEffect, useRef, useState } from 'react';
import { useData } from './data/provider';
import { LockScreen } from './features/lock/LockScreen';
import { GAME_IDS, type GameId } from './domain/progression';
import { navigate, readRoute, type Route } from './router';
import { TabBar } from './ui/TabBar';
import { lazyScreen, preloadScreens } from './ui/lazy';
import { supportFocus } from './domain/support';
import { WellbeingHome, WellbeingJournal, WellbeingProgress, WellbeingSupport } from './features/wellbeing/Wellbeing';

const RELOCK_AFTER_MS = 2 * 60 * 1000;
const Lab = lazyScreen(() => import('./features/lab/Lab'), 'Lab');
const Settings = lazyScreen(() => import('./features/settings/Settings'), 'Settings');
const Sounds = lazyScreen(() => import('./features/sounds/Sounds'), 'Sounds');
const Journal = lazyScreen(() => import('./features/journal/Journal'), 'Journal');
const Routine = lazyScreen(() => import('./features/routine/Routine'), 'Routine');
const StepScreen = lazyScreen(() => import('./features/routine/StepScreen'), 'StepScreen');
const Untangle = lazyScreen(() => import('./features/thinking/Untangle'), 'Untangle');
const GamesHub = lazyScreen(() => import('./features/games/Games'), 'GamesHub');
const PlayGame = lazyScreen(() => import('./features/games/Games'), 'PlayGame');
const Onboarding = lazyScreen(() => import('./features/onboarding/Onboarding'), 'Onboarding');
const SosScreen = lazyScreen(() => import('./features/sos/SosScreen'), 'SosScreen');
const TrainingList = lazyScreen(() => import('./features/training/Training'), 'TrainingList');
const TrainingSession = lazyScreen(() => import('./features/training/Training'), 'TrainingSession');
const UsedFlow = lazyScreen(() => import('./features/used/UsedFlow'), 'UsedFlow');

/** Trancado ao abrir e de novo depois de 2 minutos fora do app. */
function useLock(hasPin: boolean) {
  // Quem ativa o PIN agora já está dentro; tranca na próxima abertura.
  const [unlocked, setUnlocked] = useState(() => !hasPin);
  useEffect(() => {
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > RELOCK_AFTER_MS) setUnlocked(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  return { on: hasPin && !unlocked, unlock: () => setUnlocked(true) };
}

export function App() {
  useEffect(() => {
    // Primeiro mostra a tela; depois, com o navegador livre, adianta as outras para abrirem na hora.
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => { void preloadScreens(); });
    return () => cancel(handle);
  }, []);
  return (
    <Suspense fallback={<main className="screen" role="status">Abrindo…</main>}>
      <AppContent />
    </Suspense>
  );
}

function AppContent() {
  const { repos, version } = useData();
  const [route, setRoute] = useState<Route>(() => readRoute());
  const firstRoute = useRef(true);
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    const heading = document.querySelector<HTMLElement>('main h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [route.name, route.param]);
  const home = () => navigate('home');
  const theme = repos.settings.get<'auto' | 'claro' | 'noite'>('theme', 'auto');
  useEffect(() => {
    if (theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme === 'claro' ? 'light' : 'dark';
  }, [theme]);
  const locked = useLock(!!repos.settings.get<string | null>('pinHash', null));
  const general = supportFocus(repos) === 'general';

  // O SOS e o registro de uso abrem sempre, mesmo antes do primeiro uso: crise não espera cadastro.
  // Com PIN, o SOS abre sem pedir o PIN (só esconde o que a pessoa escreveu); o resto pede.
  // Ao rebloquear, descarta o estado da sessão privada nas telas que continuam acessíveis sem PIN.
  if (route.name === 'sos')
    return (
      <>
        {general ? <WellbeingSupport key={String(locked.on)} locked={locked.on} onReturnToLock={home} /> : <SosScreen key={String(locked.on)} locked={locked.on} onClose={home} onUsed={() => navigate('usei')} />}
        {!locked.on && <TabBar current="sos" />}
      </>
    );
  // O registro de uso é do foco em hábitos e substâncias; no foco geral um link antigo cai na tela inicial.
  if (route.name === 'usei' && !general) return <UsedFlow key={String(locked.on)} locked={locked.on} onDone={home} />;
  if (locked.on) return <LockScreen onUnlock={locked.unlock} />;
  void version;
  const done = repos.settings.get('onboardingDone', false);
  if (!done || route.name === 'primeiro-uso') return <Onboarding onDone={home} />;
  if (route.name === 'treino')
    return route.param ? (
      <TrainingSession key={route.param} id={route.param} onDone={home} onMore={() => navigate('treino')} onBack={() => navigate('treino')} />
    ) : (
      <TrainingList onOpen={(id) => navigate('treino', id)} onBack={home} />
    );
  if (route.name === 'jogos')
    return route.param && (GAME_IDS as readonly string[]).includes(route.param) ? (
      <PlayGame key={route.param} id={route.param as GameId} onBack={() => navigate('jogos')} />
    ) : (
      <GamesHub onOpen={(id) => navigate('jogos', id)} onBack={home} />
    );
  if (route.name === 'lab') return general ? <WellbeingProgress onBack={home} /> : <Lab onBack={home} />;
  if (route.name === 'sons') return <Sounds onBack={() => (history.length > 1 ? history.back() : home())} />;
  if (route.name === 'pensamento') return <Untangle onBack={() => (history.length > 1 ? history.back() : home())} />;
  if (route.name === 'rotina' && route.param) return <StepScreen id={route.param} onBack={home} />;
  const tab = route.name === 'ajustes' || route.name === 'diario' ? route.name : 'home';
  return (
    <>
      {tab === 'ajustes' ? <Settings onBack={home} onEditPlans={() => navigate('primeiro-uso')} /> : tab === 'diario' ? (general ? <WellbeingJournal /> : <Journal />) : (general ? <WellbeingHome /> : <Routine />)}
      <TabBar current={tab} />
    </>
  );
}
