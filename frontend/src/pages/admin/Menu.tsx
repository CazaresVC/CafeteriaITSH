import { useState, type FormEvent } from 'react';
import {
  useActualizarMenuItem,
  useAgregarMenuItem,
  useMenu,
  usePlatillos,
  useQuitarMenuItem,
  useRepublicarMenu,
  type MenuItem,
} from '../../lib/menu';
import { mensajeDeError } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { IconoAgregar, IconoCheck, IconoMenu, IconoQuitar, IconoRepetir } from '../../components/iconos';

function hoyISO(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

function FilaMenu({ item }: { item: MenuItem }) {
  const actualizar = useActualizarMenuItem();
  const quitar = useQuitarMenuItem();
  const [precio, setPrecio] = useState(String(item.precio));

  return (
    <tr className="border-t border-surface-container-high align-middle">
      <td className="py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-on-surface">{item.nombre}</span>
          {item.especial && <Badge tono="especial">Especial</Badge>}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            className="w-24"
            type="number"
            min={0}
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            aria-label={`Precio de ${item.nombre}`}
          />
          <Button
            variante="secondary"
            onClick={() => actualizar.mutate({ id: item.id, datos: { precio: Number(precio) } })}
            disabled={actualizar.isPending}
          >
            <IconoCheck className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </td>
      <td className="px-4 py-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.disponible}
            onChange={(e) =>
              actualizar.mutate({ id: item.id, datos: { disponible: e.target.checked } })
            }
          />
          Disponible
        </label>
      </td>
      <td className="px-4 py-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.especial}
            onChange={(e) => actualizar.mutate({ id: item.id, datos: { especial: e.target.checked } })}
          />
          Especial
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <Button variante="danger" onClick={() => quitar.mutate(item.id)} disabled={quitar.isPending}>
          <IconoQuitar className="h-4 w-4" />
          Quitar
        </Button>
      </td>
    </tr>
  );
}

export function Menu() {
  const [fecha, setFecha] = useState(hoyISO());
  const { data: items, isLoading } = useMenu(fecha);
  const { data: platillos } = usePlatillos(true);
  const agregar = useAgregarMenuItem();
  const republicar = useRepublicarMenu();

  const [platilloId, setPlatilloId] = useState('');
  const [precio, setPrecio] = useState('');
  const [especial, setEspecial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    agregar.mutate(
      {
        fecha,
        platilloId: Number(platilloId),
        precio: Number(precio),
        especial,
      },
      {
        onSuccess: () => {
          setPlatilloId('');
          setPrecio('');
          setEspecial(false);
        },
        onError: (e) => setError(mensajeDeError(e)),
      },
    );
  }

  function republicarMenu() {
    setError(null);
    setAviso(null);
    republicar.mutate(fecha, {
      onSuccess: (resultado) => {
        setAviso(
          `Se copiaron ${resultado.agregados} platillo(s) del menú del ${resultado.origen}` +
            (resultado.omitidos > 0 ? ` (${resultado.omitidos} ya estaban)` : '') +
            '.',
        );
      },
      onError: (e) => setError(mensajeDeError(e)),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icono={<IconoMenu className="h-5 w-5" />}
        titulo="Menú del día"
        descripcion="Publica los platillos de una fecha, ajusta precios y disponibilidad, o copia el menú más reciente en un clic."
      />

      <Card>
        <CardHeader>
          <CardTitle>Publicar platillos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 sm:max-w-xs">
            <Label htmlFor="menu-fecha">Fecha</Label>
            <Input
              id="menu-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary-container/40 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
                <IconoRepetir className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-base font-bold tracking-tight text-on-surface">
                  Republicar menú
                </p>
                <p className="text-sm text-on-surface-variant">
                  Copia en un clic el menú del día más reciente a la fecha seleccionada.
                </p>
              </div>
            </div>
            <Button
              onClick={republicarMenu}
              disabled={republicar.isPending}
              title="Copia el menú del día más reciente a la fecha seleccionada"
            >
              <IconoRepetir className="h-4 w-4" />
              {republicar.isPending ? 'Copiando…' : 'Republicar'}
            </Button>
          </div>

          {aviso && (
            <div
              className="flex items-start gap-2 rounded-lg border border-status-delivered/30 bg-status-delivered/10 px-3 py-2 text-sm text-on-surface"
              role="status"
            >
              <IconoCheck className="mt-0.5 h-4 w-4 shrink-0 text-status-delivered" />
              <span>{aviso}</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <form className="grid items-end gap-4 sm:grid-cols-4" onSubmit={enviar}>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="menu-platillo">Platillo</Label>
              <select
                id="menu-platillo"
                value={platilloId}
                onChange={(e) => setPlatilloId(e.target.value)}
                required
                className="w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Selecciona un platillo…</option>
                {(platillos ?? []).map((platillo) => (
                  <option key={platillo.id} value={platillo.id}>
                    {platillo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="menu-precio">Precio</Label>
              <Input
                id="menu-precio"
                type="number"
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={especial}
                  onChange={(e) => setEspecial(e.target.checked)}
                />
                Especial
              </label>
              <Button type="submit" disabled={agregar.isPending}>
                <IconoAgregar className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platillos publicados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Cargando…</p>
          ) : !items || items.length === 0 ? (
            <EmptyState
              titulo="No hay platillos publicados para esta fecha"
              descripcion="Usa “Republicar” para copiar el menú más reciente o agrega platillos con el formulario de arriba."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="rounded-l-lg bg-surface-container px-4 py-3 font-semibold">
                      Nombre
                    </th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Precio</th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Disponible</th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Especial</th>
                    <th className="rounded-r-lg bg-surface-container px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <FilaMenu key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
