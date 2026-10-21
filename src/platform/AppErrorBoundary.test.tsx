import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { AppErrorBoundary } from './AppErrorBoundary';

function Broken(): ReactNode { throw new Error('texto pessoal que não deve aparecer'); }

it('mantém uma pausa estática disponível quando a aplicação falha', async () => {
  const user = userEvent.setup();
  render(<AppErrorBoundary><Broken /></AppErrorBoundary>);
  expect(screen.getByRole('heading', { name: 'O app encontrou um problema' })).toBeInTheDocument();
  expect(screen.queryByText(/texto pessoal/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Abrir Pausa agora' }));
  expect(screen.getByRole('heading', { name: 'Pausa agora' })).toBeInTheDocument();
  expect(screen.getByText(/três coisas que consegue ver/)).toBeInTheDocument();
  expect(window.location.hash).toBe('#sos');
});
