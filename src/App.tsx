import { lazy, Suspense, useEffect, useState } from 'react';
import { useData } from './data/provider';
import { GamesHub, PlayGame } from './features/games/Games';
import { Journal } from './features/journal/Journal';
import { LockScreen } from './features/lock/LockScreen';
import { Routine } from './features/routine/Routine';
import { StepScreen } from './features/routine/StepScreen';
import { Untangle } from './features/thinking/Untangle';
import { Onboarding } from './features/onboarding/Onboarding';
import { SosScreen } from './features/sos/SosScreen';
import { TrainingList, TrainingSession } from './features/training/Training';
import { UsedFlow } from './features/used/UsedFlow';
import { GAME_IDS, type GameId } from './domain/progression';
import { navigate, readRoute, type Route } from './router';
import { TabBar } from './ui/TabBar';
import { supportFocus } from './domain/support';
import { WellbeingHome, WellbeingJournal, WellbeingProgress, WellbeingSupport } from './features/wellbeing/Wellbeing';

const RELOCK_AFTER_MS = 2 * 60 * 1000;
const Lab = lazy(async () => ({ default: (await import('./features/lab/Lab')).Lab }));
const Settings = lazy(async () => ({ default: (await import('./features/settings/Settings')).Settings }));
const Sounds = lazy(async () => ({ default: (await import('./features/sounds/Sounds')).Sounds }));

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
  return (
    <Suspense fallback={<main className="screen" role="status">Abrindo…</main>}>
      <AppContent />
    </Suspense>
  );
}

function AppContent() {
  const { repos, version } = useData();
  const [route, setRoute] = useState<Route>(() => readRoute());
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
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
  if (route.name === 'sos')
    return (
      <>
        {general ? <WellbeingSupport locked={locked.on} /> : <SosScreen locked={locked.on} onClose={home} onUsed={() => navigate('usei')} />}
        {!locked.on && <TabBar current="sos" />}
      </>
    );
  if (route.name === 'usei') return <UsedFlow locked={locked.on} onDone={home} />;
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
