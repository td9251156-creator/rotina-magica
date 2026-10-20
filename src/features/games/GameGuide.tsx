import type { GameId } from '@/domain/progression';
import { Icon } from '@/ui/icons';
import type { IconId } from '@/ui/app-icons';

export const GAME_GUIDES: Record<GameId, { time: string; goal: string; steps: { icon: IconId; title: string; text: string }[] }> = {
  blocos: {
    time: 'No seu ritmo', goal: 'Complete linhas, uma peça de cada vez.',
    steps: [
      { icon: 'jogo_blocos', title: 'Mova', text: 'Arraste a peça ou use as setas.' },
      { icon: 'backup', title: 'Gire', text: 'Toque no tabuleiro ou em Girar.' },
      { icon: 'instalar', title: 'Encaixe', text: 'A sombra mostra onde a peça vai cair.' },
    ],
  },
  pares: {
    time: '3 a 8 minutos', goal: 'Encontre duas peças iguais e livres.',
    steps: [
      { icon: 'jogo_pares', title: 'Observe', text: 'As peças iluminadas estão livres.' },
      { icon: 'feito', title: 'Combine', text: 'Toque em duas peças com o mesmo desenho.' },
      { icon: 'dica', title: 'Peça uma dica', text: 'Travou? Uma dica mostra um par.' },
    ],
  },
  arcanos: {
    time: '2 a 4 minutos', goal: 'Vire as cartas e descubra os pares.',
    steps: [
      { icon: 'jogo_arcanos', title: 'Vire', text: 'Escolha uma carta para ver o desenho.' },
      { icon: 'aba_diario', title: 'Lembre', text: 'Procure onde está a outra igual.' },
      { icon: 'feito', title: 'Encontre', text: 'Cada par encontrado fica marcado.' },
    ],
  },
  onda: {
    time: 'Cerca de 2 minutos', goal: 'Acompanhe o círculo e respire sem pressa.',
    steps: [
      { icon: 'passo_respirar', title: 'Puxe · 4 s', text: 'Segure o dedo enquanto o círculo cresce.' },
      { icon: 'sos_triangulo', title: 'Segure · 2 s', text: 'Mantenha o dedo até aparecer Solte.' },
      { icon: 'jogo_onda', title: 'Solte · 6 s', text: 'Tire o dedo e solte o ar devagar.' },
    ],
  },
  noite: {
    time: 'Cerca de 3 minutos', goal: 'Ensaie escolhas para a sua noite.',
    steps: [
      { icon: 'jogo_noite', title: 'Imagine', text: 'Cada cena é um momento da noite.' },
      { icon: 'seta', title: 'Escolha', text: 'Veja como sua decisão muda a vontade.' },
      { icon: 'sos_carta', title: 'Leve um plano', text: 'No fim, guarde uma ideia no seu SOS.' },
    ],
  },
};

export function GameGuide({ id }: { id: GameId }) {
  return (
    <ol className="game-guide" aria-label="Como jogar em três passos">
      {GAME_GUIDES[id].steps.map((step) => (
        <li key={step.title}>
          <span className="game-guide__icon"><Icon id={step.icon} /></span>
          <div><strong>{step.title}</strong><span>{step.text}</span></div>
        </li>
      ))}
    </ol>
  );
}

export function GameProgress({ label, value, max }: { label: string; value: number; max: number }) {
  const safeValue = Math.max(0, Math.min(max, value));
  return (
    <div className="game-progress">
      <div className="game-progress__label"><span>{label}</span><strong>{safeValue} de {max}</strong></div>
      <div className="game-progress__track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={safeValue}>
        <span style={{ width: `${max ? safeValue / max * 100 : 0}%` }} />
      </div>
    </div>
  );
}
