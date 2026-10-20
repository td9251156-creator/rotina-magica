import { addDays } from './dates';
import { computeProgress } from './progress';

const days = (from: string, count: number) => Array.from({ length: count }, (_, index) => addDays(from, index));

describe('computeProgress', () => {
  it('um dia sem resposta permanece sem registro, inclusive em dados antigos', () => {
    const p = computeProgress({ startDate: '2026-10-16', today: '2026-10-16', useDates: [], noUseDates: [] });
    expect(p).toMatchObject({ trackedDays: 1, cleanDays: 0, unknownDays: 1, todayStatus: 'sem_registro' });
  });

  it('conta hoje somente depois da confirmação', () => {
    const p = computeProgress({ startDate: '2026-10-16', today: '2026-10-16', useDates: [], noUseDates: ['2026-10-16'] });
    expect(p).toMatchObject({ cleanDays: 1, currentStreak: 1, bestStreak: 1, todayStatus: 'sem_uso' });
  });

  it('não zera os dias acumulados depois de um lapso', () => {
    const p = computeProgress({
      startDate: '2026-10-01',
      today: '2026-10-10',
      useDates: ['2026-10-08'],
      noUseDates: days('2026-10-01', 10),
    });
    expect(p.trackedDays).toBe(10);
    expect(p.cleanDays).toBe(9);
    expect(p.currentStreak).toBe(2);
    expect(p.bestStreak).toBe(7);
    expect(p.cleanRatio).toBeCloseTo(0.9);
  });

  it('zera só a sequência atual quando o uso foi hoje', () => {
    const p = computeProgress({
      startDate: '2026-10-01',
      today: '2026-10-05',
      useDates: ['2026-10-05'],
      noUseDates: days('2026-10-01', 4),
    });
    expect(p.currentStreak).toBe(0);
    expect(p.cleanDays).toBe(4);
  });

  it('ignora duplicatas e datas fora do período', () => {
    const p = computeProgress({
      startDate: '2026-10-01',
      today: '2026-10-03',
      useDates: ['2026-09-30', '2026-10-02', '2026-10-02', '2026-10-04'],
      noUseDates: ['2026-10-01', '2026-10-02', '2026-10-03'],
    });
    expect(p.cleanDays).toBe(2);
  });

  it('calcula os últimos 30 dias numa janela móvel', () => {
    const p = computeProgress({
      startDate: '2026-08-01',
      today: '2026-10-10',
      useDates: ['2026-08-15', '2026-10-01', '2026-10-05', '2026-10-09'],
      noUseDates: days('2026-08-01', 71),
    });
    expect(p.last30CleanRatio).toBeCloseTo(27 / 30);
  });

  it('atravessa a virada de mês e o fim do horário de verão', () => {
    const p = computeProgress({ startDate: '2026-02-20', today: '2026-03-05', useDates: [], noUseDates: [] });
    expect(p.trackedDays).toBe(14);
  });

  it('retorna vazio quando o início é no futuro', () => {
    const p = computeProgress({ startDate: '2026-10-20', today: '2026-10-16', useDates: [], noUseDates: [] });
    expect(p.trackedDays).toBe(0);
    expect(p.cleanRatio).toBe(0);
  });
});
