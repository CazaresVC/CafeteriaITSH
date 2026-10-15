import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api, mensajeDeError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  correo: z.string().trim().email('Correo inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type Formulario = z.infer<typeof esquema>;

export function Registro() {
  const navegar = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema) });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    try {
      await api.post('/auth/register', datos);
      navegar('/login', { replace: true });
    } catch (e) {
      setError(mensajeDeError(e));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-primary" />
        <CardHeader className="bg-surface-container-low">
          <CardTitle className="text-xl">Crear cuenta de cliente</CardTitle>
          <p className="mt-1 text-sm text-on-surface-variant">Para alumnos y docentes</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={enviar} noValidate>
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" autoComplete="name" {...register('nombre')} />
              {errors.nombre && <p className="text-sm text-error">{errors.nombre.message}</p>}
            </div>
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
                autoComplete="new-password"
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
              {isSubmitting ? 'Creando…' : 'Registrarme'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{' '}
            <Link className="font-semibold text-primary hover:underline" to="/login">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
