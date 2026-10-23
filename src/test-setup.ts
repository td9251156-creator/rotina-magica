import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { preloadScreens } from './ui/lazy';

// Telas carregadas sob demanda já prontas: os testes renderizam sem esperar o Suspense.
beforeAll(() => preloadScreens());

afterEach(() => {
  cleanup();
  localStorage.clear();
});
