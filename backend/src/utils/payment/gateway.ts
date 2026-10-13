import { randomInt } from 'node:crypto';

export interface ResultadoCobro {
  aprobado: boolean;
  referencia: string | null;
  motivo?: string;
}

export interface PasarelaPago {
  cobrar(monto: number, token?: string): Promise<ResultadoCobro>;
}

class PasarelaSimulada implements PasarelaPago {
  async cobrar(monto: number, token?: string): Promise<ResultadoCobro> {
    if (monto <= 0) {
      return { aprobado: false, referencia: null, motivo: 'Monto inválido' };
    }
    if (token && token.trim().toLowerCase().startsWith('rech')) {
      return { aprobado: false, referencia: null, motivo: 'Pago rechazado por la pasarela' };
    }
    const sufijo = randomInt(100, 1000);
    const referencia = `SIM-${Date.now().toString(36).toUpperCase()}${sufijo}`;
    return { aprobado: true, referencia };
  }
}

export const pasarela: PasarelaPago = new PasarelaSimulada();
