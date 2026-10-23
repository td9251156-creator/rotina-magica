import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createDemoRepositories, isDemo } from './data/demo';
import { DataProvider } from './data/provider';
import { PwaUpdate } from './platform/PwaUpdate';
import { AppErrorBoundary } from './platform/AppErrorBoundary';
import { StorageSession } from './platform/StorageSession';
import './ui/styles.css';

// `?demo`: dados de exemplo só na memória. Os dados reais do celular nem são lidos.
const demo = isDemo(window.location.search);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><StorageSession bypass={demo}><DataProvider repos={demo ? createDemoRepositories() : undefined}>
      {demo && (
        <div className="demo-bar" role="status">
          <span>Demonstração com dados de exemplo. Nada é salvo.</span>
          <a href={window.location.pathname}>Sair</a>
        </div>
      )}
      <PwaUpdate />
      <App />
    </DataProvider></StorageSession></AppErrorBoundary>
  </StrictMode>,
);

// Pede ao navegador para não apagar os dados quando faltar espaço.
navigator.storage?.persist?.().catch(() => {});
