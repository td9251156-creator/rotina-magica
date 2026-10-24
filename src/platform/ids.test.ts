import { newId } from './ids';

it('gera UUID v4 mesmo sem crypto.randomUUID (página sem HTTPS)', () => {
  const original = crypto.randomUUID;
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined });
  try {
    const ids = new Set(Array.from({ length: 50 }, newId));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  } finally {
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: original });
  }
});
