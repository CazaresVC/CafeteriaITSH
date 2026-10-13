import { useState, type FormEvent } from 'react';
import {
  useActualizarMenuItem,
  useAgregarMenuItem,
  useMenu,
  usePlatillos,
  useQuitarMenuItem,
  type MenuItem,
} from '../../lib/menu';
import { mensajeDeError } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

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
    <tr className="border-t border-slate-100 align-middle">
      <td className="py-2">{item.nombre}</td>
      <td className="py-2">
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
            Guardar
          </Button>
        </div>
      </td>
      <td className="py-2">
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
      <td className="py-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.especial}
            onChange={(e) => actualizar.mutate({ id: item.id, datos: { especial: e.target.checked } })}
          />
          Especial
        </label>
      </td>
      <td className="py-2 text-right">
        <Button variante="danger" onClick={() => quitar.mutate(item.id)} disabled={quitar.isPending}>
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

  const [platilloId, setPlatilloId] = useState('');
  const [precio, setPrecio] = useState('');
  const [especial, setEspecial] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menú del día</CardTitle>
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

          <form className="grid items-end gap-4 sm:grid-cols-4" onSubmit={enviar}>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="menu-platillo">Platillo</Label>
              <select
                id="menu-platillo"
                value={platilloId}
                onChange={(e) => setPlatilloId(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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
                Agregar
              </Button>
            </div>
          </form>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platillos publicados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : !items || items.length === 0 ? (
            <p className="text-sm text-slate-500">No hay platillos publicados para esta fecha.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Precio</th>
                    <th className="py-2">Disponible</th>
                    <th className="py-2">Especial</th>
                    <th className="py-2" />
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
