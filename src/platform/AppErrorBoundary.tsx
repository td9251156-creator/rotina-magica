import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { failed: boolean; pause: boolean }

/** Recuperação local e sem telemetria; nunca exibe nem transmite o conteúdo do erro. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, pause: false };

  static getDerivedStateFromError(): State {
    return { failed: true, pause: false };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // O erro pode conter texto pessoal. Não registrar nem enviar detalhes.
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.state.pause) return <main className="screen"><h1>Pausa agora</h1><p>Você ainda pode usar esta pausa mesmo com o restante do app indisponível.</p><ol className="ticks"><li>Apoie os pés ou o corpo de um jeito confortável.</li><li>Olhe ao redor e escolha três coisas que consegue ver.</li><li>Deixe o ar entrar e sair no seu ritmo, sem forçar.</li></ol><p className="muted">Fique aqui pelo tempo que precisar. Você não precisa resolver tudo agora.</p><button type="button" className="btn btn--ghost" onClick={() => this.setState({ failed: false, pause: false })}>Tentar abrir o app novamente</button></main>;
    return <main className="screen"><h1>O app encontrou um problema</h1><p>Se você precisa de um cuidado agora, a pausa abaixo funciona sem acessar seus registros.</p><button type="button" className="btn" onClick={() => { window.location.hash = 'sos'; this.setState({ pause: true }); }}>Abrir Pausa agora</button><button type="button" className="btn btn--ghost" onClick={() => this.setState({ failed: false, pause: false })}>Tentar novamente</button></main>;
  }
}
