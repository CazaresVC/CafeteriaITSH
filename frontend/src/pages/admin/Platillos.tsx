import { useState } from 'react';
import {
  useCrearPlatillo,
  useDesactivarPlatillo,
  useEditarPlatillo,
  usePlatillos,
  type Platillo,
  type PlatilloInput,
} from '../../lib/menu';
import { mensajeDeError } from '../../lib/api';
import { PlatilloForm } from '../../components/menu/PlatilloForm';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function Platillos() {
  const { data: platillos, isLoading } = usePlatillos();
  const crear = useCrearPlatillo();
  const editar = useEditarPlatillo();
  const desactivar = useDesactivarPlatillo();

  const [editando, setEditando] = useState<Platillo | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const enviando = crear.isPending || editar.isPending;

  function guardar(datos: PlatilloInput) {
    setError(null);
    const alGuardar = () => {
      setEditando(null);
      setVersion((v) => v + 1);
    };
    const alFallar = (e: unknown) => setError(mensajeDeError(e));

    if (editando) {
      editar.mutate({ id: editando.id, datos }, { onSuccess: alGuardar, onError: alFallar });
    } else {
      crear.mutate(datos, { onSuccess: alGuardar, onError: alFallar });
    }
  }

  function desactivarPlatillo(id: number) {
    setError(null);
    desactivar.mutate(id, { onError: (e) => setError(mensajeDeError(e)) });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editando ? 'Editar platillo' : 'Nuevo platillo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatilloForm
            key={version}
            inicial={editando}
            enviando={enviando}
            onSubmit={guardar}
            onCancelar={editando ? () => setEditando(null) : undefined}
          />
          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de platillos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : !platillos || platillos.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay platillos registrados.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Categoría</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {platillos.map((platillo) => (
                  <tr key={platillo.id} className="border-t border-slate-100">
                    <td className="py-2">{platillo.nombre}</td>
                    <td className="py-2">{platillo.categoria ?? '—'}</td>
                    <td className="py-2">{platillo.activo ? 'Activo' : 'Inactivo'}</td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <Button variante="secondary" onClick={() => setEditando(platillo)}>
                          Editar
                        </Button>
                        {platillo.activo && (
                          <Button
                            variante="danger"
                            onClick={() => desactivarPlatillo(platillo.id)}
                            disabled={desactivar.isPending}
                          >
                            Desactivar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
