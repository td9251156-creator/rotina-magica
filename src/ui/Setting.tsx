import type { ReactNode } from 'react';
import { Chevron } from './icons';

/** Um ajuste que abre e fecha: a lista fica curta e cada item mostra o essencial no título. */
export function Setting({ title, hint, icon, children }: { title: string; hint?: ReactNode; icon?: ReactNode; children: ReactNode }) {
  return (
    <details className="card setting">
      <summary>
        {icon && <span className="item__icon">{icon}</span>}
        <span className="setting__title">
          <h2>{title}</h2>
          {hint && <span className="muted small">{hint}</span>}
        </span>
        <Chevron />
      </summary>
      <div className="setting__body">{children}</div>
    </details>
  );
}
