import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PwaUpdate } from './PwaUpdate';

it('só ativa a atualização depois de confirmar o encerramento de atividades', async () => {
  vi.stubEnv('PROD', true);
  const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  const postMessage = vi.fn();
  const registration = Object.assign(new EventTarget(), { waiting: { postMessage }, installing: null });
  const worker = Object.assign(new EventTarget(), { controller: {}, register: vi.fn().mockResolvedValue(registration) });
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: worker });
  const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
  const view = render(<PwaUpdate />);
  window.dispatchEvent(new Event('load'));
  try {
    const button = await screen.findByRole('button', { name: 'Atualizar agora' });
    const user = userEvent.setup();
    await user.click(button);
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('textos que ainda não foram guardados'));
    expect(postMessage).not.toHaveBeenCalled();
    expect(button).not.toBeDisabled();
    await user.click(button);
    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(screen.getByRole('button', { name: 'Atualizando…' })).toBeDisabled();
  } finally {
    view.unmount();
    confirm.mockRestore();
    vi.unstubAllEnvs();
    if (original) Object.defineProperty(navigator, 'serviceWorker', original);
    else Reflect.deleteProperty(navigator, 'serviceWorker');
  }
});
