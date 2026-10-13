import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface Platillo {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: boolean;
}

export interface MenuItem {
  id: number;
  fecha: string;
  platilloId: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
  especial: boolean;
}

export interface PlatilloInput {
  nombre: string;
  categoria?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface MenuItemInput {
  fecha: string;
  platilloId: number;
  precio: number;
  disponible?: boolean;
  especial?: boolean;
}

export interface MenuItemPatch {
  precio?: number;
  disponible?: boolean;
  especial?: boolean;
}

export function usePlatillos(activo?: boolean) {
  return useQuery({
    queryKey: ['platillos', activo ?? 'todos'],
    queryFn: async () =>
      (await api.get<Platillo[]>('/platillos', { params: activo === undefined ? {} : { activo } }))
        .data,
  });
}

export function useMenu(fecha?: string) {
  return useQuery({
    queryKey: ['menu', fecha ?? 'hoy'],
    queryFn: async () =>
      (await api.get<MenuItem[]>('/menu', { params: fecha ? { fecha } : {} })).data,
    staleTime: 30_000,
    refetchOnMount: 'always',
  });
}

export function useCrearPlatillo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (datos: PlatilloInput) => (await api.post<Platillo>('/platillos', datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platillos'] });
    },
  });
}

export function useEditarPlatillo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, datos }: { id: number; datos: Partial<PlatilloInput> }) =>
      (await api.patch<Platillo>(`/platillos/${id}`, datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platillos'] });
    },
  });
}

export function useDesactivarPlatillo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/platillos/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platillos'] });
      await queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useAgregarMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (datos: MenuItemInput) => (await api.post<MenuItem>('/menu', datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useActualizarMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, datos }: { id: number; datos: MenuItemPatch }) =>
      (await api.patch<MenuItem>(`/menu/${id}`, datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useQuitarMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/menu/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}
