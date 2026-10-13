export class ErrorDeDominio extends Error {
  constructor(
    public readonly codigo: string,
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorDeDominio';
  }
}

export class ErrorValidacion extends ErrorDeDominio {
  constructor(mensaje = 'Datos inválidos') {
    super('DATOS_INVALIDOS', 400, mensaje);
  }
}

export class ErrorCredenciales extends ErrorDeDominio {
  constructor() {
    super('CREDENCIALES_INVALIDAS', 401, 'Correo o contraseña incorrectos');
  }
}

export class ErrorNoAutorizado extends ErrorDeDominio {
  constructor(mensaje = 'Sesión ausente o inválida') {
    super('NO_AUTORIZADO', 401, mensaje);
  }
}

export class ErrorProhibido extends ErrorDeDominio {
  constructor(mensaje = 'No tienes permiso para esta operación') {
    super('PROHIBIDO', 403, mensaje);
  }
}

export class ErrorNoEncontrado extends ErrorDeDominio {
  constructor(mensaje = 'Recurso no encontrado') {
    super('NO_ENCONTRADO', 404, mensaje);
  }
}

export class ErrorConflicto extends ErrorDeDominio {
  constructor(mensaje = 'El recurso ya existe') {
    super('CONFLICTO', 409, mensaje);
  }
}

export class ErrorSolicitud extends ErrorDeDominio {
  constructor(codigo: string, mensaje: string) {
    super(codigo, 422, mensaje);
  }
}

export class ErrorFueraDeVentana extends ErrorSolicitud {
  constructor(mensaje = 'Está fuera del horario permitido para pedidos anticipados') {
    super('FUERA_DE_VENTANA', mensaje);
  }
}

export class ErrorPlatilloNoDisponible extends ErrorSolicitud {
  constructor(mensaje = 'Uno de los platillos no está disponible en el menú de hoy') {
    super('PLATILLO_NO_DISPONIBLE', mensaje);
  }
}

export class ErrorPagoRechazado extends ErrorSolicitud {
  constructor(mensaje = 'El pago fue rechazado por la pasarela') {
    super('PAGO_RECHAZADO', mensaje);
  }
}
