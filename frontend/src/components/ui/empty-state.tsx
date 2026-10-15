import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

function Ilustracion() {
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-24 text-primary" aria-hidden="true">
      <circle cx="60" cy="52" r="34" className="fill-primary-container/60" />
      <path
        d="M18 78c8-6 18-9 28-9M74 69c10 0 20 3 28 9"
        className="stroke-tertiary/30"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M44 48h26v8a10 10 0 0 1-10 10h-6a10 10 0 0 1-10-10v-8Z"
        className="fill-none stroke-primary"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M70 50h4a5 5 0 0 1 0 10h-4"
        className="fill-none stroke-primary"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M50 38c-1.6 1.8-1.6 3.6 0 5.4M60 36c-1.6 1.8-1.6 3.6 0 5.4"
        className="stroke-tertiary/70"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M34 30c3-3 8-3 11 0-3 3-8 3-11 0Z"
        className="fill-secondary/20 stroke-secondary/50"
        strokeWidth="1.6"
      />
    </svg>
  );
}

interface Props {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ titulo, descripcion, children, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 px-6 py-10 text-center',
        className,
      )}
    >
      <Ilustracion />
      <div className="space-y-1">
        <p className="font-heading text-base font-bold text-on-surface">{titulo}</p>
        {descripcion && (
          <p className="mx-auto max-w-sm text-sm text-on-surface-variant">{descripcion}</p>
        )}
      </div>
      {children}
    </div>
  );
}
