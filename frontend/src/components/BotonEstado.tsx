import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  children: ReactNode;
  onClick: () => void;
  variante?: Variante;
  disabled?: boolean;
}

export function BotonEstado({
  children,
  onClick,
  variante = 'primary',
  disabled = false,
}: Props) {
  return (
    <Button
      variante={variante}
      onClick={onClick}
      disabled={disabled}
      className={cn('min-h-11 flex-1')}
    >
      {children}
    </Button>
  );
}
