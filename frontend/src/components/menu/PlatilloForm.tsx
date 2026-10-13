import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Platillo, PlatilloInput } from '../../lib/menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  categoria: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
  descripcion: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
});

type Formulario = z.infer<typeof esquema>;

interface Props {
  inicial?: Platillo | null;
  enviando?: boolean;
  onSubmit: (datos: PlatilloInput) => void;
  onCancelar?: () => void;
}

export function PlatilloForm({ inicial = null, enviando = false, onSubmit, onCancelar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: '', categoria: '', descripcion: '' },
  });

  useEffect(() => {
    reset({
      nombre: inicial?.nombre ?? '',
      categoria: inicial?.categoria ?? '',
      descripcion: inicial?.descripcion ?? '',
    });
  }, [inicial, reset]);

  const enviar = handleSubmit((datos) => {
    onSubmit({
      nombre: datos.nombre,
      categoria: datos.categoria ? datos.categoria : undefined,
      descripcion: datos.descripcion ? datos.descripcion : undefined,
    });
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={enviar} noValidate>
      <div className="space-y-1">
        <Label htmlFor="platillo-nombre">Nombre</Label>
        <Input id="platillo-nombre" {...register('nombre')} />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="platillo-categoria">Categoría</Label>
        <Input id="platillo-categoria" {...register('categoria')} />
        {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="platillo-descripcion">Descripción</Label>
        <Input id="platillo-descripcion" {...register('descripcion')} />
        {errors.descripcion && (
          <p className="text-sm text-red-600">{errors.descripcion.message}</p>
        )}
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={enviando}>
          {inicial ? 'Guardar cambios' : 'Crear platillo'}
        </Button>
        {onCancelar && (
          <Button type="button" variante="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
