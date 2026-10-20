const test = require('node:test');
const assert = require('node:assert/strict');
const { median, periodFor } = require('./maintenance-report.cjs');

test('seleciona o mês civil anterior em UTC', () => {
  const period = periodFor('', new Date('2026-01-15T12:00:00Z'));
  assert.equal(period.key, '2025-12');
  assert.equal(period.start.toISOString(), '2025-12-01T00:00:00.000Z');
  assert.equal(period.end.toISOString(), '2026-01-01T00:00:00.000Z');
});

test('aceita um mês explícito e rejeita formato inválido', () => {
  assert.equal(periodFor('2026-09').key, '2026-09');
  assert.throws(() => periodFor('setembro'));
});

test('calcula mediana sem distorção por extremos', () => {
  assert.equal(median([]), null);
  assert.equal(median([1, 20, 3]), 3);
  assert.equal(median([1, 3, 5, 9]), 4);
});
