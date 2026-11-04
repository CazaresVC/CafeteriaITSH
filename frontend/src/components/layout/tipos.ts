import type { ReactNode } from 'react';

export interface EnlaceNavegacion {
  to: string;
  etiqueta: string;
  icono?: ReactNode;
  contador?: number;
  end?: boolean;
  query?: Record<string, string>;
}
