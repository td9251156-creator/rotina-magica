import { act, render, screen } from '@testing-library/react';
import { Component, Suspense, type ReactNode } from 'react';
import { lazyScreen } from './lazy';

class Catch extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <button onClick={() => this.setState({ failed: false })}>De novo</button> : this.props.children; }
}

it('tenta baixar de novo depois de uma falha de rede', async () => {
  let offline = true;
  const Screen = lazyScreen(async () => {
    if (offline) throw new TypeError('Failed to fetch dynamically imported module');
    return { Hello: () => <p>Olá</p> };
  }, 'Hello');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<Catch><Suspense fallback="…"><Screen /></Suspense></Catch>);
  const again = await screen.findByRole('button', { name: 'De novo' });
  offline = false;
  act(() => again.click());
  expect(await screen.findByText('Olá')).toBeInTheDocument();
});
