import { useMenu } from '../../lib/menu';
import { PlatilloCard } from '../../components/menu/PlatilloCard';

export function Menu() {
  const { data: items, isLoading, isError } = useMenu();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Menú del día</h1>
        <p className="text-sm text-slate-500">Consulta los platillos publicados para hoy.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando menú…</p>}

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          No se pudo cargar el menú. Inténtalo de nuevo.
        </p>
      )}

      {items && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Aún no hay platillos publicados para hoy.
        </p>
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
