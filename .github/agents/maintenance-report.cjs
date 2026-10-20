const HOURS = 60 * 60 * 1000;

const inPeriod = (value, start, end) => value && new Date(value) >= start && new Date(value) < end;
const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const hours = (value) => value == null ? 'n/d' : `${Math.round(value)} h`;
const isBot = (login = '') => login.endsWith('[bot]') || login === 'dependabot';

function periodFor(input, now = new Date()) {
  if (input && !/^\d{4}-(0[1-9]|1[0-2])$/.test(input)) throw new Error('Mês inválido; use YYYY-MM.');
  const reference = input ? new Date(`${input}-01T00:00:00Z`) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1));
  return { key: start.toISOString().slice(0, 7), start, end };
}

module.exports = async ({ github, context, core, month = '' }) => {
  const { owner, repo } = context.repo;
  const { key, start, end } = periodFor(month);
  const since = start.toISOString();

  const issueRows = await github.paginate(github.rest.issues.listForRepo, { owner, repo, state: 'all', since, per_page: 100 });
  const issues = issueRows.filter((item) => !item.pull_request);
  const openIssueRows = await github.paginate(github.rest.issues.listForRepo, { owner, repo, state: 'open', per_page: 100 });
  const openIssues = openIssueRows.filter((item) => !item.pull_request);
  const pulls = await github.paginate(github.rest.pulls.list, { owner, repo, state: 'all', sort: 'updated', direction: 'desc', per_page: 100 });
  const runs = await github.paginate(github.rest.actions.listWorkflowRunsForRepo, {
    owner, repo, per_page: 100, created: `${start.toISOString().slice(0, 10)}..${new Date(end - 1).toISOString().slice(0, 10)}`,
  });
  const releases = await github.paginate(github.rest.repos.listReleases, { owner, repo, per_page: 100 });

  const openedIssues = issues.filter((item) => inPeriod(item.created_at, start, end));
  const closedIssues = issues.filter((item) => inPeriod(item.closed_at, start, end));
  const staleIssues = openIssues.filter((item) => new Date(item.created_at) < new Date(end.getTime() - 30 * 24 * HOURS));
  const openedPulls = pulls.filter((item) => inPeriod(item.created_at, start, end));
  const mergedPulls = pulls.filter((item) => inPeriod(item.merged_at, start, end));
  const closedUnmerged = pulls.filter((item) => inPeriod(item.closed_at, start, end) && !item.merged_at);
  const externalMerged = mergedPulls.filter((item) => item.user?.login !== owner && !isBot(item.user?.login));
  const agentOpened = openedPulls.filter((item) => item.head?.ref?.startsWith('agent/'));
  const agentMerged = mergedPulls.filter((item) => item.head?.ref?.startsWith('agent/'));
  const ciRuns = runs.filter((run) => run.name === 'CI');
  const ciSuccess = ciRuns.filter((run) => run.conclusion === 'success').length;
  const ciFailed = ciRuns.filter((run) => run.conclusion === 'failure').length;
  const ciCancelled = ciRuns.filter((run) => run.conclusion === 'cancelled').length;
  const ciDenominator = ciSuccess + ciFailed;
  const ciRate = ciDenominator ? `${Math.round(ciSuccess / ciDenominator * 100)}% (${ciSuccess}/${ciDenominator})` : 'n/d';
  const mergeTimes = mergedPulls.map((item) => (new Date(item.merged_at) - new Date(item.created_at)) / HOURS);
  const closeTimes = closedIssues.map((item) => (new Date(item.closed_at) - new Date(item.created_at)) / HOURS);
  const publishedReleases = releases.filter((item) => inPeriod(item.published_at, start, end));

  const next = [];
  if (ciDenominator && ciSuccess / ciDenominator < 0.95) next.push('Investigar falhas do CI antes de ampliar recursos.');
  if (staleIssues.length) next.push(`Revisar ${staleIssues.length} issue(s) aberta(s) há mais de 30 dias.`);
  if (closedUnmerged.length > mergedPulls.length) next.push('Revisar por que mais PRs foram fechados do que mesclados.');
  if (!next.length) next.push('Manter a cadência e priorizar feedback reproduzível, acessibilidade e confiabilidade.');

  const body = [
    `<!-- maintenance-report:${key} -->`,
    `# Relatório de manutenção — ${key}`,
    '',
    `Período UTC: ${start.toISOString().slice(0, 10)} a ${new Date(end - 1).toISOString().slice(0, 10)}. Coleta em \`${context.sha.slice(0, 7)}\`.`,
    '',
    '## Confiabilidade',
    '',
    `- CI: ${ciRuns.length} execuções; ${ciSuccess} aprovadas, ${ciFailed} falhas e ${ciCancelled} canceladas.`,
    `- Taxa entre execuções concluídas: ${ciRate}.`,
    '',
    '## Manutenção e entrega',
    '',
    `- Issues: ${openedIssues.length} abertas e ${closedIssues.length} fechadas; mediana até fechamento: ${hours(median(closeTimes))}.`,
    `- Backlog: ${staleIssues.length} issue(s) aberta(s) há mais de 30 dias.`,
    `- Pull requests: ${openedPulls.length} abertos, ${mergedPulls.length} mesclados e ${closedUnmerged.length} fechados sem merge.`,
    `- Mediana da abertura ao merge: ${hours(median(mergeTimes))}.`,
    `- Releases publicadas: ${publishedReleases.length}.`,
    '',
    '## Comunidade e agentes',
    '',
    `- PRs externos mesclados: ${externalMerged.length}. Bots e Dependabot não entram nesse número.`,
    `- PRs de agente: ${agentOpened.length} abertos e ${agentMerged.length} mesclados.`,
    '',
    '## Próximos cuidados',
    '',
    ...next.map((item) => `- ${item}`),
    '',
    '> Este relatório mede manutenção pública do repositório; não mede uso do aplicativo nem resultado de saúde.',
  ].join('\n');

  try {
    await github.rest.issues.createLabel({ owner, repo, name: 'maintenance-report', color: 'BFDADC', description: 'Relatório mensal com métricas públicas de manutenção' });
  } catch (error) {
    if (error.status !== 422) throw error;
  }

  const title = `Relatório de manutenção — ${key}`;
  const existing = issueRows.find((item) => !item.pull_request && item.title === title);
  if (existing) {
    await github.rest.issues.update({ owner, repo, issue_number: existing.number, body, labels: ['maintenance-report'], state: 'closed' });
    core.info(`Relatório #${existing.number} atualizado.`);
  } else {
    const created = await github.rest.issues.create({ owner, repo, title, body, labels: ['maintenance-report'] });
    await github.rest.issues.update({ owner, repo, issue_number: created.data.number, state: 'closed' });
    core.info(`Relatório #${created.data.number} criado.`);
  }
};

module.exports.periodFor = periodFor;
module.exports.median = median;
