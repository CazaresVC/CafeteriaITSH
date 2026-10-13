import { env } from '../config/env';

function aMinutos(hhmm: string): number | null {
  const coincidencia = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!coincidencia) {
    return null;
  }
  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    return null;
  }
  return horas * 60 + minutos;
}

export function dentroDeVentana(ahora: Date = new Date()): boolean {
  const inicio = aMinutos(env.pedidoVentanaInicio);
  const fin = aMinutos(env.pedidoVentanaFin);
  if (inicio === null || fin === null) {
    return true;
  }
  const actual = ahora.getHours() * 60 + ahora.getMinutes();
  const limite = fin - Math.max(0, env.pedidoAnticipacionMin);
  return actual >= inicio && actual <= limite;
}

export function fechaRecoleccion(ahora: Date = new Date()): Date {
  const fin = aMinutos(env.pedidoVentanaFin);
  const recoleccion = new Date(ahora);
  if (fin !== null) {
    recoleccion.setHours(Math.floor(fin / 60), fin % 60, 0, 0);
  } else {
    recoleccion.setMinutes(recoleccion.getMinutes() + env.pedidoAnticipacionMin);
  }
  if (recoleccion.getTime() <= ahora.getTime()) {
    recoleccion.setMinutes(recoleccion.getMinutes() + env.pedidoAnticipacionMin);
  }
  return recoleccion;
}
