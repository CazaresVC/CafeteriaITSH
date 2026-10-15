import { useMenu } from '../../lib/menu';
import { PlatilloCard } from '../../components/menu/PlatilloCard';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { IconoCafe } from '../../components/iconos';

export function Menu() {
  const { data: items, isLoading, isError } = useMenu();

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-low p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary-container/50 blur-2xl"
        />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
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

      <PageHeader titulo="Menú del día" descripcion="Consulta los platillos disponibles y arma tu pedido anticipado." />

      {isLoading && <p className="text-sm text-on-surface-variant">Cargando menú…</p>}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudo cargar el menú. Inténtalo de nuevo.
        </p>
      )}

      {items && items.length === 0 && (
        <EmptyState
          titulo="Aún no hay platillos publicados para hoy"
          descripcion="Vuelve más tarde; el menú del día se publicará pronto."
        />
      )}

      {items && items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <PlatilloCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
