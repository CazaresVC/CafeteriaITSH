import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, mensajeDeError } from '../../lib/api';
import { ETIQUETA_ROL, type Rol, type Usuario } from '../../lib/roles';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface NuevoOperativo {
  nombre: string;
  correo: string;
  password: string;
  rol: Extract<Rol, 'cajero' | 'cocinero'>;
}

const FORMULARIO_INICIAL: NuevoOperativo = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'cajero',
};

export function Usuarios() {
  const queryClient = useQueryClient();
  const [formulario, setFormulario] = useState<NuevoOperativo>(FORMULARIO_INICIAL);
  const [error, setError] = useState<string | null>(null);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => (await api.get<Usuario[]>('/usuarios')).data,
  });

  const crear = useMutation({
    mutationFn: async (datos: NuevoOperativo) =>
      (await api.post<Usuario>('/usuarios', datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
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
      setError(null);
    },
    onError: (e) => setError(mensajeDeError(e)),
  });

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    crear.mutate(formulario);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario operativo</CardTitle>
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
            <div className="space-y-1">
              <Label htmlFor="rol">Rol</Label>
              <select
                id="rol"
                value={formulario.rol}
                onChange={(e) =>
                  setFormulario({ ...formulario, rol: e.target.value as 'cajero' | 'cocinero' })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="cajero">Cajero</option>
                <option value="cocinero">Cocinero</option>
              </select>
            </div>
            {error && (
              <p className="sm:col-span-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={crear.isPending}>
                {crear.isPending ? 'Creando…' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios operativos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : !usuarios || usuarios.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay usuarios operativos.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Correo</th>
                  <th className="py-2">Rol</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-t border-slate-100">
                    <td className="py-2">{usuario.nombre}</td>
                    <td className="py-2">{usuario.correo}</td>
                    <td className="py-2">{ETIQUETA_ROL[usuario.rol]}</td>
                    <td className="py-2">{usuario.activo ? 'Activo' : 'Deshabilitado'}</td>
                    <td className="py-2 text-right">
                      {usuario.activo && (
                        <Button
                          variante="danger"
                          onClick={() => deshabilitar.mutate(usuario.id)}
                          disabled={deshabilitar.isPending}
                        >
                          Deshabilitar
                        </Button>
                      )}
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
