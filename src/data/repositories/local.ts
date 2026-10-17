import { toLocalDate, type LocalDate } from '@/domain/dates';
import type {
  Checkin,
  Craving,
  EveningChoice,
  PlanItem,
  GameSession,
  JournalEntry,
  ThoughtRecord,
  RoutineMark,
  Practice,
  Repositories,
  SettingKey,
  UseEvent,
} from './types';

/**
 * Implementação local dos repositórios: tudo fica no armazenamento do navegador, no próprio
 * celular. Nada sai do aparelho. Os dados cabem folgados (são textos curtos), e cada mudança é
 * gravada na hora.
 *
 * Todo registro tem id, createdAt, updatedAt e deletedAt (exclusão lógica), para uma futura
 * sincronização saber o que mudou, inclusive o que foi apagado.
 */

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface RepoDeps {
  storage: KeyValueStorage;
  newId: () => string;
  now: () => Date;
}

type Stored<T> = T & { deletedAt: string | null };

interface Snapshot {
  version: 1;
  settings: Record<string, unknown>;
  checkins: Stored<Checkin>[];
  cravings: Stored<Craving>[];
  useEvents: Stored<UseEvent>[];
  planItems: Stored<PlanItem>[];
  eveningChoices: Stored<EveningChoice>[];
  practices: Stored<Practice>[];
  games: Stored<GameSession>[];
  routine: Stored<RoutineMark>[];
  journal: Stored<JournalEntry>[];
  thoughts: Stored<ThoughtRecord>[];
}

export const STORAGE_KEY = 'rumo:dados:v1';

function empty(): Snapshot {
  return { version: 1, settings: {}, checkins: [], cravings: [], useEvents: [], planItems: [], eveningChoices: [], practices: [], games: [], routine: [], journal: [], thoughts: [] };
}

function load(storage: KeyValueStorage): Snapshot {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return empty();
  try {
    return { ...empty(), ...(JSON.parse(raw) as Partial<Snapshot>) };
  } catch {
    // Dado corrompido não pode travar o app (o SOS precisa abrir). Guardamos uma cópia e recomeçamos.
    storage.setItem(`${STORAGE_KEY}:corrompido:${Date.now()}`, raw);
    return empty();
  }
}

/** Cópia de todos os dados, para a pessoa guardar fora do navegador (o Chrome pode apagar se faltar espaço). */
export function exportData(storage: KeyValueStorage, now: Date): string {
  return JSON.stringify({ app: 'rumo', exportedAt: now.toISOString(), data: load(storage) });
}

/** Restaura um backup. Valida o formato antes de substituir; em erro, nada muda. */
export function importData(storage: KeyValueStorage, json: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Arquivo não é um backup do Rumo');
  }
  const p = parsed as { app?: unknown; data?: Partial<Snapshot> };
  if (p.app !== 'rumo' || !p.data || p.data.version !== 1 || typeof p.data.settings !== 'object') {
    throw new Error('Arquivo não é um backup do Rumo');
  }
  const current = storage.getItem(STORAGE_KEY);
  if (current) storage.setItem(`${STORAGE_KEY}:antes-de-restaurar`, current);
  // O PIN não volta com o backup: quem esqueceu o PIN apaga tudo e restaura sem ficar trancado de novo.
  const { pinHash: _h, pinSalt: _s, ...settings } = p.data.settings as Record<string, unknown>;
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...empty(), ...p.data, settings }));
}

const alive = <T extends { deletedAt: string | null }>(r: T) => r.deletedAt === null;
const strip = <T extends { deletedAt: string | null }>({ deletedAt: _d, ...rest }: T) => rest;

export function createLocalRepositories({ storage, newId, now }: RepoDeps): Repositories {
  const db = load(storage);
  const save = () => storage.setItem(STORAGE_KEY, JSON.stringify(db));
  const stamp = () => now().toISOString();
  const created = () => {
    const at = stamp();
    return { id: newId(), createdAt: at, updatedAt: at, deletedAt: null };
  };
  const notFound = (what: string, id: string) => new Error(`${what} ${id} não encontrado`);
  const softDelete = (rows: { id: string; deletedAt: string | null; updatedAt: string }[], id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    row.deletedAt = row.updatedAt = stamp();
    save();
  };
  const between = (d: LocalDate, from: LocalDate, to: LocalDate) => d >= from && d <= to;

  return {
    checkins: {
      upsertForDate(input) {
        const existing = db.checkins.find((c) => alive(c) && c.date === input.date);
        if (existing) Object.assign(existing, input, { updatedAt: stamp() });
        else db.checkins.push({ ...input, ...created() });
        save();
        return this.getByDate(input.date)!;
      },
      getByDate(date) {
        const row = db.checkins.find((c) => alive(c) && c.date === date);
        return row ? strip(row) : null;
      },
      listBetween(from, to) {
        return db.checkins
          .filter((c) => alive(c) && between(c.date, from, to))
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(strip);
      },
    },

    cravings: {
      add(input) {
        const row = { ...input, date: toLocalDate(new Date(input.occurredAt)), ...created() };
        db.cravings.push(row);
        save();
        return strip(row);
      },
      update(id, patch) {
        const row = db.cravings.find((c) => alive(c) && c.id === id);
        if (!row) throw notFound('Fissura', id);
        Object.assign(row, patch, { updatedAt: stamp() });
        if (patch.occurredAt) row.date = toLocalDate(new Date(patch.occurredAt));
        save();
        return strip(row);
      },
      listBetween(from, to) {
        return db.cravings
          .filter((c) => alive(c) && between(c.date, from, to))
          .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
          .map(strip);
      },
      remove: (id) => softDelete(db.cravings, id),
    },

    useEvents: {
      add(input) {
        const row = { ...input, date: toLocalDate(new Date(input.occurredAt)), ...created() };
        db.useEvents.push(row);
        save();
        return strip(row);
      },
      remove: (id) => softDelete(db.useEvents, id),
      useDatesBetween(from, to) {
        const dates = new Set<LocalDate>();
        db.useEvents.filter((e) => alive(e) && between(e.date, from, to)).forEach((e) => dates.add(e.date));
        db.checkins
          .filter((c) => alive(c) && c.used === true && between(c.date, from, to))
          .forEach((c) => dates.add(c.date));
        return [...dates].sort();
      },
      lastOccurredAt() {
        const last = db.useEvents.filter(alive).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
        return last ? last.occurredAt : null;
      },
    },

    plan: {
      list(kind) {
        return db.planItems
          .filter((i) => alive(i) && (!kind || i.kind === kind))
          .sort((a, b) => a.kind.localeCompare(b.kind) || a.position - b.position || a.createdAt.localeCompare(b.createdAt))
          .map(strip);
      },
      add({ kind, text, extra }) {
        const row = { kind, text, extra: extra ?? null, position: this.list(kind).length, ...created() };
        db.planItems.push(row);
        save();
        return strip(row);
      },
      update(id, patch) {
        const row = db.planItems.find((i) => alive(i) && i.id === id);
        if (!row) throw notFound('Item do plano', id);
        Object.assign(row, patch, { updatedAt: stamp() });
        save();
        return strip(row);
      },
      remove: (id) => softDelete(db.planItems, id),
      reorder(kind, ids) {
        const at = stamp();
        ids.forEach((id, position) => {
          const row = db.planItems.find((i) => i.id === id && i.kind === kind);
          if (row) Object.assign(row, { position, updatedAt: at });
        });
        save();
      },
    },

    evenings: {
      choose(date, planItemId) {
        const existing = db.eveningChoices.find((e) => alive(e) && e.date === date);
        if (existing) Object.assign(existing, { planItemId, updatedAt: stamp() });
        else db.eveningChoices.push({ date, planItemId, outcome: null, note: null, ...created() });
        save();
        return this.getForDate(date)!;
      },
      getForDate(date) {
        const row = db.eveningChoices.find((e) => alive(e) && e.date === date);
        return row ? strip(row) : null;
      },
      setOutcome(date, outcome, note = null) {
        const row = db.eveningChoices.find((e) => alive(e) && e.date === date);
        if (!row) throw notFound('Noite', date);
        Object.assign(row, { outcome, note, updatedAt: stamp() });
        save();
        return strip(row);
      },
      listBetween(from, to) {
        return db.eveningChoices
          .filter((e) => alive(e) && between(e.date, from, to))
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(strip);
      },
    },

    practices: {
      add(techniqueId, date, scores) {
        const row = { techniqueId, date, ...(scores && Object.keys(scores).length ? { scores } : {}), ...created() };
        db.practices.push(row);
        save();
        return strip(row);
      },
      list() {
        return db.practices.filter(alive).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(strip);
      },
    },

    games: {
      add(input) {
        const row = { ...input, ...created() };
        db.games.push(row);
        save();
        return strip(row);
      },
      list() {
        return db.games.filter(alive).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(strip);
      },
    },

    routine: {
      toggle(date, stepId, done) {
        const row = db.routine.find((r) => alive(r) && r.date === date && r.stepId === stepId);
        const want = done ?? !row;
        if (want && !row) db.routine.push({ date, stepId, ...created() });
        if (!want && row) row.deletedAt = row.updatedAt = stamp();
        save();
      },
      doneOn(date) {
        return db.routine.filter((r) => alive(r) && r.date === date).map((r) => r.stepId);
      },
      activeDates() {
        return [...new Set(db.routine.filter(alive).map((r) => r.date))].sort();
      },
    },

    journal: {
      upsert(input) {
        const existing = db.journal.find((j) => alive(j) && j.date === input.date);
        if (existing) Object.assign(existing, input, { updatedAt: stamp() });
        else db.journal.push({ ...input, ...created() });
        save();
        return this.getByDate(input.date)!;
      },
      getByDate(date) {
        const row = db.journal.find((j) => alive(j) && j.date === date);
        return row ? strip(row) : null;
      },
      listBetween(from, to) {
        return db.journal
          .filter((j) => alive(j) && between(j.date, from, to))
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(strip);
      },
    },

    thoughts: {
      add(input) {
        const row = { ...input, date: toLocalDate(now()), ...created() };
        db.thoughts.push(row);
        save();
        return strip(row);
      },
      list() {
        return db.thoughts.filter(alive).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(strip);
      },
    },

    settings: {
      get<T>(key: SettingKey, fallback: T): T {
        return key in db.settings ? (db.settings[key] as T) : fallback;
      },
      set<T>(key: SettingKey, value: T) {
        db.settings[key] = value;
        save();
      },
    },
  };
}
