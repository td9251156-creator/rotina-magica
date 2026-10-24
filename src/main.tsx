import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createDemoRepositories, isDemo } from './data/demo';
import { DataProvider } from './data/provider';
import { PwaUpdate } from './platform/PwaUpdate';
import { AppErrorBoundary } from './platform/AppErrorBoundary';
import { StorageSession } from './platform/StorageSession';
import './ui/styles.css';

// Sem HTTPS o navegador desliga o que o app precisa (modo offline, PIN, backup, proteção entre janelas).
// Um domínio que redireciona para http:// cai aqui: troca para https:// antes de abrir qualquer dado.
const local = /^(localhost|127\.|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);
const toHttps = window.location.protocol === 'http:' && !local;
if (toHttps) window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);

// `?demo`: dados de exemplo só na memória. Os dados reais do celular nem são lidos.
const demo = isDemo(window.location.search);

if (!toHttps) createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><PwaUpdate /><StorageSession bypass={demo}><DataProvider repos={demo ? createDemoRepositories() : undefined}>
      {demo && (
        <div className="demo-bar" role="status">
          <span>Demonstração com dados de exemplo. Nada é salvo.</span>
          <a href={window.location.pathname}>Sair</a>
        </div>
      )}
      <App />
    </DataProvider></StorageSession></AppErrorBoundary>
  </StrictMode>,
);

// Pede ao navegador para não apagar os dados quando faltar espaço.
navigator.storage?.persist?.().catch(() => {});
