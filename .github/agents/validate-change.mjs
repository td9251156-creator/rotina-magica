import { execFileSync } from 'node:child_process';
import { lstatSync, writeFileSync } from 'node:fs';

const outputPath = process.argv[2];
if (!outputPath) throw new Error('Informe o caminho do arquivo de saída.');

const runGit = (args, encoding = 'utf8') => execFileSync('git', args, { encoding, maxBuffer: 10_000_000 });
const names = runGit(['diff', 'HEAD', '--name-only', '-z', '--diff-filter=ACMRD'])
  .split('\0')
  .filter(Boolean);

if (!names.length) throw new Error('O agente não produziu mudanças.');
if (names.length > 20) throw new Error(`Limite de arquivos excedido: ${names.length}.`);

const allowed = /^(src\/|public\/|docs\/|README\.md$)/;
const outside = names.filter((name) => !allowed.test(name));
if (outside.length) throw new Error(`Caminhos fora da lista permitida:\n${outside.join('\n')}`);

for (const name of names) {
  if (name.includes('\n') || name.includes('\r')) throw new Error('Nome de arquivo com quebra de linha não é permitido.');
  try {
    if (lstatSync(name).isSymbolicLink()) throw new Error(`Link simbólico não permitido: ${name}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const numstat = runGit(['diff', 'HEAD', '--numstat']);
let lines = 0;
for (const row of numstat.split('\n').filter(Boolean)) {
  const [added, removed] = row.split('\t');
  if (added === '-' || removed === '-') throw new Error('Arquivos binários não podem ser alterados pelo agente.');
  lines += Number(added) + Number(removed);
}
if (lines > 1000) throw new Error(`Limite de linhas excedido: ${lines}.`);

const diffBytes = runGit(['diff', 'HEAD', '--binary'], null).byteLength;
if (diffBytes > 2_000_000) throw new Error(`Limite de bytes excedido: ${diffBytes}.`);

runGit(['diff', 'HEAD', '--check']);
const result = { files: names, fileCount: names.length, lines, diffBytes };
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result)}\n`);
