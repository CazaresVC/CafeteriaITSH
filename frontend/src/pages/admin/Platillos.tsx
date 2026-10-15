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
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { IconoDesactivar, IconoEditar, IconoPlatillos } from '../../components/iconos';

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
      <PageHeader
        icono={<IconoPlatillos className="h-5 w-5" />}
        titulo="Catálogo de platillos"
        descripcion="Registra platillos y controla cuáles están activos para ofrecerse en el menú."
      />

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
            <p className="mt-3 text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platillos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Cargando…</p>
          ) : !platillos || platillos.length === 0 ? (
            <EmptyState
              titulo="El catálogo está vacío"
              descripcion="Agrega tu primer platillo con el formulario de arriba."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="rounded-l-lg bg-surface-container px-4 py-3 font-semibold">
                      Nombre
                    </th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Categoría</th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Estado</th>
                    <th className="rounded-r-lg bg-surface-container px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {platillos.map((platillo) => (
                    <tr key={platillo.id} className="border-b border-surface-container-high">
                      <td className="px-4 py-3 font-medium text-on-surface">{platillo.nombre}</td>
                      <td className="px-4 py-3">
                        {platillo.categoria ? (
                          <Badge tono="neutral">{platillo.categoria}</Badge>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tono={platillo.activo ? 'success' : 'error'}>
                          {platillo.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variante="secondary" onClick={() => setEditando(platillo)}>
                            <IconoEditar className="h-4 w-4" />
                            Editar
                          </Button>
                          {platillo.activo && (
                            <Button
                              variante="danger"
                              onClick={() => desactivarPlatillo(platillo.id)}
                              disabled={desactivar.isPending}
                            >
                              <IconoDesactivar className="h-4 w-4" />
                              Desactivar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
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
