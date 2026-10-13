import { randomInt } from 'node:crypto';

export function generarFolio(ahora: Date = new Date()): string {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const aleatorio = randomInt(0, 10000).toString().padStart(4, '0');
  return `ITS-${anio}${mes}${dia}-${aleatorio}`;
}
