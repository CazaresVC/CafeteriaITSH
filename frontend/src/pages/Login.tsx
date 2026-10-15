import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api, mensajeDeError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { rutaInicial, type Usuario } from '../lib/roles';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const esquema = z.object({
  correo: z.string().trim().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type Formulario = z.infer<typeof esquema>;

export function Login() {
  const { usuario, cargando, refrescar } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema) });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    try {
      const { data } = await api.post<Usuario>('/auth/login', datos);
      await refrescar();
      const desde = (ubicacion.state as { desde?: string } | null)?.desde;
      navegar(rutaInicial(data.rol, desde), { replace: true });
    } catch (e) {
      setError(mensajeDeError(e));
    }
  });

  if (!cargando && usuario) {
    const desde = (ubicacion.state as { desde?: string } | null)?.desde;
    return <Navigate to={rutaInicial(usuario.rol, desde)} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-primary" />
        <CardHeader className="bg-surface-container-low">
          <CardTitle className="text-xl">Iniciar sesión</CardTitle>
          <p className="mt-1 text-sm text-on-surface-variant">
            Cafetería ITSH — Pedidos Anticipados
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={enviar} noValidate>
            <div className="space-y-1">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" type="email" autoComplete="username" {...register('correo')} />
              {errors.correo && <p className="text-sm text-error">{errors.correo.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-error">{errors.password.message}</p>
              )}
            </div>
            {error && (
              <p
                className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container"
                role="alert"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-on-surface-variant">
            ¿No tienes cuenta?{' '}
            <Link className="font-semibold text-primary hover:underline" to="/registro">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
