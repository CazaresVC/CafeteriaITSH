import { useEffect, useMemo, useState } from 'react';
import { useMenu } from '../../lib/menu';
import { useCarrito } from '../../lib/carrito';
import { PlatilloCard } from '../../components/menu/PlatilloCard';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { Buscador } from '../../components/ui/buscador';
import { ChipsCategoria } from '../../components/ui/chips-categoria';
import { BotonFlotanteCobro } from '../../components/ui/boton-flotante-cobro';
import { Button } from '../../components/ui/button';
import { IconoCafe, IconoCaja } from '../../components/iconos';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function Menu() {
  const { data: items, isLoading, isError, refetch } = useMenu();
  const { cantidades, totalCantidad, cambiar, sincronizar } = useCarrito();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);

  useEffect(() => {
    if (items) {
      sincronizar(items);
    }
  }, [items, sincronizar]);

  const categorias = useMemo(() => {
    const unicas = new Set<string>();
    for (const item of items ?? []) {
      if (item.categoria) {
        unicas.add(item.categoria);
      }
    }
    return [...unicas].sort((a, b) => a.localeCompare(b, 'es'));
  }, [items]);

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return (items ?? []).filter((item) => {
      if (categoria !== null && item.categoria !== categoria) {
        return false;
      }
      if (!termino) {
        return true;
      }
      return (
        normalizar(item.nombre).includes(termino) ||
        normalizar(item.descripcion ?? '').includes(termino)
      );
    });
  }, [busqueda, categoria, items]);

  const total = (items ?? []).reduce(
    (suma, item) =>
      suma + (item.disponible ? item.precio * (cantidades[item.platilloId] ?? 0) : 0),
    0,
  );

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary-container/50 blur-2xl"
        />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <IconoCafe className="h-6 w-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold tracking-tight text-on-surface">
              ¡Buen día! Tu café, en buenas manos
            </p>
            <p className="text-sm text-on-surface-variant">
              Estos son los platillos publicados para hoy.
            </p>
          </div>
        </div>
      </section>

      <PageHeader
        titulo="Menú del día"
        descripcion="Consulta los platillos disponibles y arma tu pedido anticipado."
      />

      {isLoading && (
        <p className="text-sm text-on-surface-variant" role="status">
          Cargando menú…
        </p>
      )}

      {isError && (
        <div className="space-y-3 rounded-xl border border-error/30 bg-error-container/40 p-4">
          <p className="text-sm text-error" role="alert">
            No se pudo cargar el menú. Inténtalo de nuevo.
          </p>
          <Button variante="secondary" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          titulo="Aún no hay platillos publicados para hoy"
          descripcion="Vuelve más tarde; el menú del día se publicará pronto."
        />
      )}

      {items && items.length > 0 && (
        <>
          <div className="space-y-3">
            <Buscador
              etiqueta="Buscar platillo"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
            <ChipsCategoria
              categorias={categorias}
              seleccionada={categoria}
              onSeleccionar={setCategoria}
            />
          </div>

          {filtrados.length === 0 ? (
            <EmptyState
              titulo="Sin resultados"
              descripcion={`No hay platillos que coincidan con “${busqueda || categoria}”.`}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {filtrados.map((item) => (
                <PlatilloCard
                  key={item.id}
                  item={item}
                  cantidad={cantidades[item.platilloId] ?? 0}
                  onCambiar={(delta) => cambiar(item.platilloId, delta)}
                />
              ))}
            </ul>
          )}

          <BotonFlotanteCobro
            cantidad={totalCantidad}
            total={total}
            etiqueta="Ver pedido"
            to="/pedido"
            icono={<IconoCaja className="h-5 w-5" />}
          />
        </>
      )}
    </div>
  );
}
