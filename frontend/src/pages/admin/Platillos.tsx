import { useMemo, useState } from 'react';
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
import { Buscador } from '../../components/ui/buscador';
import { ChipsCategoria } from '../../components/ui/chips-categoria';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { IconoDesactivar, IconoEditar, IconoPlatillos } from '../../components/iconos';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function Platillos() {
  const { data: platillos, isLoading } = usePlatillos();
  const crear = useCrearPlatillo();
  const editar = useEditarPlatillo();
  const desactivar = useDesactivarPlatillo();

  const [editando, setEditando] = useState<Platillo | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);

  const enviando = crear.isPending || editar.isPending;

  const categorias = useMemo(() => {
    const unicas = new Set<string>();
    for (const platillo of platillos ?? []) {
      if (platillo.categoria) {
        unicas.add(platillo.categoria);
      }
    }
    return [...unicas].sort((a, b) => a.localeCompare(b, 'es'));
  }, [platillos]);

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return (platillos ?? []).filter((platillo) => {
      if (categoria !== null && platillo.categoria !== categoria) {
        return false;
      }
      if (!termino) {
        return true;
      }
      return (
        normalizar(platillo.nombre).includes(termino) ||
        normalizar(platillo.descripcion ?? '').includes(termino)
      );
    });
  }, [busqueda, categoria, platillos]);

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
        <CardContent className="space-y-4">
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

          {isLoading ? (
            <p className="text-sm text-on-surface-variant" role="status">
              Cargando…
            </p>
          ) : !platillos || platillos.length === 0 ? (
            <EmptyState
              titulo="El catálogo está vacío"
              descripcion="Agrega tu primer platillo con el formulario de arriba."
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              titulo="Sin resultados"
              descripcion={`No hay platillos que coincidan con “${busqueda || categoria}”.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Catálogo de platillos registrados</caption>
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-on-surface-variant">
                    <th scope="col" className="rounded-l-lg bg-surface-container px-4 py-3 font-semibold">
                      Nombre
                    </th>
                    <th scope="col" className="bg-surface-container px-4 py-3 font-semibold">
                      Categoría
                    </th>
                    <th scope="col" className="bg-surface-container px-4 py-3 font-semibold">
                      Estado
                    </th>
                    <th scope="col" className="rounded-r-lg bg-surface-container px-4 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((platillo) => (
                    <tr
                      key={platillo.id}
                      className="border-b border-surface-container-high odd:bg-surface-container-low/40"
                    >
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
