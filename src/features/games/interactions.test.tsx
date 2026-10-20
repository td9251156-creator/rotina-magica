import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlocksGame } from './BlocksGame';
import { PairsGame } from './PairsGame';
import { WaveGame } from './WaveGame';
import * as recording from './record';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('controles e retorno dos jogos', () => {
  it('Espaço no botão Soltar faz uma jogada, como um clique', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
    const user = userEvent.setup();
    const first = render(<BlocksGame onFinish={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Soltar' }));
    const clickScore = document.querySelector('.game__hud strong')!.textContent;
    expect(Number(clickScore)).toBeGreaterThan(0);
    first.unmount();

    render(<BlocksGame onFinish={vi.fn()} />);
    screen.getByRole('button', { name: 'Soltar' }).focus();
    await user.keyboard(' ');
    expect(document.querySelector('.game__hud strong')!.textContent).toBe(clickScore);
    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    for (const name of ['Guardar', 'Esquerda', 'Girar', 'Direita', 'Soltar']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it('Pares explica uma dica, permite desfazer e registra todos os 17 pares ao concluir', () => {
    const onFinish = vi.fn();
    render(<PairsGame seed={12345} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole('button', { name: /Partida curta/ }));
    fireEvent.click(screen.getByRole('button', { name: /Dica/ }));
    let hinted = [...document.querySelectorAll('.mj__tile--hint')];
    expect(hinted).toHaveLength(2);
    hinted.forEach((tile) => fireEvent.click(tile));
    expect(screen.getByRole('status')).toHaveTextContent('Par encontrado');
    expect(screen.getByRole('progressbar', { name: 'Pares encontrados' })).toHaveAttribute('aria-valuenow', '1');
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(document.querySelectorAll('.mj__tile')).toHaveLength(34);
    expect(document.querySelectorAll('.mj__tile--hint')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('restaurados');

    for (let turn = 0; turn < 100 && !onFinish.mock.calls.length; turn++) {
      const hint = screen.getByRole('button', { name: /Dica/ });
      if ((hint as HTMLButtonElement).disabled) {
        fireEvent.click(screen.getByRole('button', { name: 'Embaralhar' }));
      }
      fireEvent.click(screen.getByRole('button', { name: /Dica/ }));
      hinted = [...document.querySelectorAll('.mj__tile--hint')];
      expect(hinted).toHaveLength(2);
      hinted.forEach((tile) => fireEvent.click(tile));
    }
    expect(onFinish).toHaveBeenCalledOnce();
    expect(onFinish.mock.calls[0][0].extra).toMatchObject({ cleared: true, pairs: 17 });
  });
});

describe('respiração guiada', () => {
  function setup() {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T18:00:00Z'));
    const vibrate = vi.spyOn(recording, 'vibrate').mockImplementation(() => {});
    const onFinish = vi.fn();
    const view = render(<WaveGame onFinish={onFinish} />);
    const pad = screen.getByRole('button', { name: /no teclado, ative uma vez/ });
    const activate = () => fireEvent.click(pad, { detail: 0 });
    const breatheIn = () => {
      act(() => { vi.advanceTimersByTime(4000); });
      act(() => { vi.advanceTimersByTime(2000); });
    };
    return { ...view, vibrate, onFinish, pad, activate, breatheIn };
  }

  it('avisa para soltar uma vez, mesmo se a pessoa continuar segurando', () => {
    const { vibrate, activate, breatheIn } = setup();
    activate();
    breatheIn();
    expect(screen.getByRole('status')).toHaveTextContent('Agora solte');
    const count = vibrate.mock.calls.length;
    act(() => { vi.advanceTimersByTime(1500); });
    expect(vibrate).toHaveBeenCalledTimes(count);
  });

  it('conclui seis ciclos uma vez, sem precisar iniciar um sétimo', () => {
    const { onFinish, activate, breatheIn } = setup();
    for (let cycle = 0; cycle < 6; cycle++) {
      activate();
      breatheIn();
      activate();
      act(() => { vi.advanceTimersByTime(6000); });
    }
    expect(onFinish).toHaveBeenCalledOnce();
    expect(onFinish.mock.calls[0][0].extra).toEqual({ cycles: 6 });
    act(() => { vi.advanceTimersByTime(12000); });
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('um gesto cancelado não registra um ciclo e permite recomeçar', () => {
    const { onFinish, pad, activate, breatheIn } = setup();
    activate();
    breatheIn();
    fireEvent.pointerCancel(pad);
    act(() => { vi.advanceTimersByTime(12000); });
    expect(screen.getByRole('progressbar', { name: 'Ciclos concluídos' })).toHaveAttribute('aria-valuenow', '0');
    expect(onFinish).not.toHaveBeenCalled();
    activate();
    expect(screen.getByRole('status')).toHaveTextContent('Puxe o ar');
  });
});
