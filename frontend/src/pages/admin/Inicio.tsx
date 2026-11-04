import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Usuario } from '../../lib/roles';
import { useMenu, usePlatillos } from '../../lib/menu';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/ui/page-header';
import {
  IconoMenu,
  IconoPlatillos,
  IconoUsuarios,
} from '../../components/iconos';

function fechaLarga(): string {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const TARJETA =
  'rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

export function Inicio() {
  const { data: usuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => (await api.get<Usuario[]>('/usuarios')).data,
  });
  const { data: platillos } = usePlatillos();
  const { data: menu } = useMenu();

  const usuariosActivos = (usuarios ?? []).filter((usuario) => usuario.activo).length;
  const publicados = menu?.length ?? 0;
  const especiales = (menu ?? []).filter((item) => item.especial).length;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Panel de administración"
        descripcion={`${fechaLarga()} · Resumen rápido de usuarios, catálogo y menú del día.`}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/usuarios" className={TARJETA}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            <IconoUsuarios className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-bold text-on-surface">Usuarios</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {usuariosActivos} activo{usuariosActivos === 1 ? '' : 's'}
          </p>
        </Link>

        <Link to="/admin/platillos" className={TARJETA}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
            <IconoPlatillos className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-bold text-on-surface">Platillos</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {platillos?.length ?? 0} en catálogo
          </p>
        </Link>

        <Link to="/admin/menu" className={TARJETA}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
            <IconoMenu className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-bold text-on-surface">Menú del día</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {publicados} publicado{publicados === 1 ? '' : 's'} hoy
            {especiales > 0 ? ` · ${especiales} especial(es)` : ''}
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-on-surface">Resumen del menú de hoy</h2>
          <Link
            to="/admin/menu"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
          >
            Administrar menú →
          </Link>
        </div>

        {!menu || menu.length === 0 ? (
          <p className="mt-3 text-sm text-on-surface-variant">
            Aún no hay platillos publicados para hoy.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-surface-container-high">
            {menu.slice(0, 6).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      item.disponible ? 'font-semibold text-on-surface' : 'text-on-surface-variant line-through'
                    }
                  >
                    {item.nombre}
                  </span>
                  {item.especial && <Badge tono="especial">Especial</Badge>}
                  {!item.disponible && <Badge tono="error">No disponible</Badge>}
                </div>
                <span className="font-heading text-sm font-bold text-primary">
                  ${item.precio.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
