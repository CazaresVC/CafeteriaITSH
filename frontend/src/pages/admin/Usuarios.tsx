import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, mensajeDeError } from '../../lib/api';
import { ETIQUETA_ROL, type Rol, type Usuario } from '../../lib/roles';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { IconoAgregar, IconoCheck, IconoDesactivar, IconoEditar, IconoUsuarios } from '../../components/iconos';

type RolOperativo = Extract<Rol, 'cajero' | 'cocinero'>;

interface FormularioOperativo {
  nombre: string;
  correo: string;
  password: string;
  rol: RolOperativo;
}

const FORMULARIO_INICIAL: FormularioOperativo = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'cajero',
};

export function Usuarios() {
  const queryClient = useQueryClient();
  const [formulario, setFormulario] = useState<FormularioOperativo>(FORMULARIO_INICIAL);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [aDeshabilitar, setADeshabilitar] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => (await api.get<Usuario[]>('/usuarios')).data,
  });

  const crear = useMutation({
    mutationFn: async (datos: FormularioOperativo) =>
      (await api.post<Usuario>('/usuarios', datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setFormulario(FORMULARIO_INICIAL);
      setError(null);
    },
    onError: (e) => setError(mensajeDeError(e)),
  });

  const actualizar = useMutation({
    mutationFn: async ({ id, datos }: { id: number; datos: Partial<FormularioOperativo> }) =>
      (await api.patch<Usuario>(`/usuarios/${id}`, datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setEditando(null);
      setFormulario(FORMULARIO_INICIAL);
      setError(null);
    },
    onError: (e) => setError(mensajeDeError(e)),
  });

  const deshabilitar = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/usuarios/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setADeshabilitar(null);
      setError(null);
    },
    onError: (e) => setError(mensajeDeError(e)),
  });

  const enviando = crear.isPending || actualizar.isPending;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    if (editando) {
      actualizar.mutate({
        id: editando.id,
        datos: { nombre: formulario.nombre, correo: formulario.correo, rol: formulario.rol },
      });
    } else {
      crear.mutate(formulario);
    }
  }

  function comenzarEdicion(usuario: Usuario) {
    setEditando(usuario);
    setError(null);
    setFormulario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol === 'cocinero' ? 'cocinero' : 'cajero',
    });
  }

  function cancelarEdicion() {
    setEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icono={<IconoUsuarios className="h-5 w-5" />}
        titulo="Usuarios operativos"
        descripcion="Da de alta cajeros y cocineros, edita sus datos o deshabilita su acceso."
      />

      <Card>
        <CardHeader>
          <CardTitle>{editando ? `Editar a ${editando.nombre}` : 'Nuevo usuario operativo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={enviar}>
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                value={formulario.correo}
                onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })}
                required
              />
            </div>
            {!editando && (
              <div className="space-y-1">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formulario.password}
                  onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="rol">Rol</Label>
              <select
                id="rol"
                value={formulario.rol}
                onChange={(e) =>
                  setFormulario({ ...formulario, rol: e.target.value as RolOperativo })
                }
                className="w-full min-h-11 rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="cajero">Cajero</option>
                <option value="cocinero">Cocinero</option>
              </select>
            </div>
            {error && (
              <p className="text-sm text-error sm:col-span-2" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={enviando}>
                {editando ? <IconoCheck className="h-4 w-4" /> : <IconoAgregar className="h-4 w-4" />}
                {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
              {editando && (
                <Button type="button" variante="secondary" onClick={cancelarEdicion}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Cargando…</p>
          ) : !usuarios || usuarios.length === 0 ? (
            <EmptyState
              titulo="Aún no hay usuarios operativos"
              descripcion="Crea el primer cajero o cocinero con el formulario de arriba."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="rounded-l-lg bg-surface-container px-4 py-3 font-semibold">
                      Nombre
                    </th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Correo</th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Rol</th>
                    <th className="bg-surface-container px-4 py-3 font-semibold">Estado</th>
                    <th className="rounded-r-lg bg-surface-container px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-surface-container-high">
                      <td className="px-4 py-3 font-medium text-on-surface">{usuario.nombre}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{usuario.correo}</td>
                      <td className="px-4 py-3">
                        <Badge tono="primary">{ETIQUETA_ROL[usuario.rol]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tono={usuario.activo ? 'success' : 'error'}>
                          {usuario.activo ? 'Activo' : 'Deshabilitado'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variante="secondary" onClick={() => comenzarEdicion(usuario)}>
                            <IconoEditar className="h-4 w-4" />
                            Editar
                          </Button>
                          {usuario.activo && (
                            <Button
                              variante="danger"
                              onClick={() => setADeshabilitar(usuario)}
                              disabled={deshabilitar.isPending}
                            >
                              <IconoDesactivar className="h-4 w-4" />
                              Deshabilitar
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

      <ConfirmDialog
        abierto={aDeshabilitar !== null}
        titulo="Deshabilitar usuario"
        mensaje={`¿Deshabilitar a ${aDeshabilitar?.nombre ?? ''}? No podrá iniciar sesión hasta que se reactive.`}
        textoConfirmar="Deshabilitar"
        variante="danger"
        onCancelar={() => setADeshabilitar(null)}
        onConfirmar={() => aDeshabilitar && deshabilitar.mutate(aDeshabilitar.id)}
      />
    </div>
  );
}
