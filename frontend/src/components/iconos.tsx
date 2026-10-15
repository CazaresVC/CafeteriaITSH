import type { SVGProps } from 'react';

type IconoProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconoCafe(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" strokeLinejoin="round" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M7 3.5c-.6.7-.6 1.4 0 2.1M11 3.5c-.6.7-.6 1.4 0 2.1" />
    </Base>
  );
}

export function IconoUsuarios(props: IconoProps) {
  return (
    <Base {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17 14.4a5.5 5.5 0 0 1 3.5 4.6" />
    </Base>
  );
}

export function IconoPlatillos(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M4 10.5h16" />
      <path d="M12 4.5c-4.4 0-8 2.7-8 6h16c0-3.3-3.6-6-8-6Z" strokeLinejoin="round" />
      <path d="M7 15h10M9 18.5h6" />
    </Base>
  );
}

export function IconoMenu(props: IconoProps) {
  return (
    <Base {...props}>
      <rect x="4.5" y="4" width="15" height="16" rx="2.5" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </Base>
  );
}

export function IconoCaja(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M4 6h2l2.2 9.5a1.5 1.5 0 0 0 1.5 1.2h7.8a1.5 1.5 0 0 0 1.5-1.2L20 9H6.4" />
      <circle cx="9.5" cy="19.5" r="1.1" />
      <circle cx="17" cy="19.5" r="1.1" />
    </Base>
  );
}

export function IconoCocina(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M7 13.5a5 5 0 0 1 10 0" />
      <path d="M5.5 13.5h13v2.2a2.3 2.3 0 0 1-2.3 2.3H7.8a2.3 2.3 0 0 1-2.3-2.3v-2.2Z" strokeLinejoin="round" />
      <path d="M12 5.5v3.2M12 8.7c-.9-.6-1.5-1.4-1.5-2.6" />
    </Base>
  );
}

export function IconoEntregas(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M4.5 8.2 12 4.5l7.5 3.7v7.6L12 19.5l-7.5-3.7V8.2Z" strokeLinejoin="round" />
      <path d="m4.5 8.2 7.5 3.8 7.5-3.8M12 12v7.5" />
    </Base>
  );
}

export function IconoBuscar(props: IconoProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m15.5 15.5 3.5 3.5" />
    </Base>
  );
}

export function IconoEditar(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M4.5 19.5h4l9.4-9.4a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0l-9.4 9.4v4Z" strokeLinejoin="round" />
      <path d="m13.2 7.3 3.5 3.5" />
    </Base>
  );
}

export function IconoCheck(props: IconoProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.9" />
    </Base>
  );
}

export function IconoInfo(props: IconoProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8h.01" />
    </Base>
  );
}

export function IconoCerrar(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Base>
  );
}

export function IconoCampana(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.2.7 4.6 1.5 5.5H5c.8-.9 1.5-2.3 1.5-5.5Z" strokeLinejoin="round" />
      <path d="M10 18.8a2 2 0 0 0 4 0" />
    </Base>
  );
}

export function IconoAgregar(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function IconoQuitar(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M5 7h14M9.8 7V5.6A1.6 1.6 0 0 1 11.4 4h1.2a1.6 1.6 0 0 1 1.6 1.6V7" />
      <path d="m6.6 7 .9 11.1A2 2 0 0 0 9.5 20h5a2 2 0 0 0 2-1.9L17.4 7" />
      <path d="M10.4 10.8v5.6M13.6 10.8v5.6" />
    </Base>
  );
}

export function IconoSalir(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M14 4h3.4A2.6 2.6 0 0 1 20 6.6v10.8A2.6 2.6 0 0 1 17.4 20H14" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </Base>
  );
}

export function IconoPago(props: IconoProps) {
  return (
    <Base {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.4" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M6.6 9.4h.01M17.4 14.6h.01" />
    </Base>
  );
}

export function IconoReloj(props: IconoProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 1.9" />
    </Base>
  );
}

export function IconoDesactivar(props: IconoProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m6.6 6.6 10.8 10.8" />
    </Base>
  );
}

export function IconoEntregar(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M4.5 8.2 12 4.5l7.5 3.7v7.6L12 19.5l-7.5-3.7V8.2Z" strokeLinejoin="round" />
      <path d="m8.9 12.1 2.1 2.1 4.1-4.3" />
    </Base>
  );
}

export function IconoRepetir(props: IconoProps) {
  return (
    <Base {...props}>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4.6V9h-4.4" />
    </Base>
  );
}
