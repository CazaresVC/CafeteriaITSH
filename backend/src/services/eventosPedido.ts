export interface PedidoListoEvento {
  pedidoId: number;
  usuarioId: number | null;
  numero: string;
  fecha: string;
}

type Suscriptor = (evento: PedidoListoEvento) => void | Promise<void>;

const suscriptoresPedidoListo = new Set<Suscriptor>();

export function onPedidoListo(suscriptor: Suscriptor): void {
  suscriptoresPedidoListo.add(suscriptor);
}

export async function emitirPedidoListo(evento: PedidoListoEvento): Promise<void> {
  await Promise.all(
    [...suscriptoresPedidoListo].map((suscriptor) => Promise.resolve(suscriptor(evento))),
  );
}
