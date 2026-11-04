const BASE_URL = process.env.API_URL ?? 'http://127.0.0.1:3000';
const ITERACIONES = Number(process.env.PERF_ITERATIONS ?? 20);
const CALENTAMIENTO = Number(process.env.PERF_WARMUP ?? 3);
const UMBRAL_P95 = Number(process.env.PERF_P95_MS ?? 500);
const COOKIE = process.env.PERF_COOKIE ?? '';

function fechaHoy() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

function percentil(valores, p) {
  if (valores.length === 0) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const indice = Math.min(ordenados.length - 1, Math.ceil((p / 100) * ordenados.length) - 1);
  return ordenados[Math.max(0, indice)];
}

async function medir(nombre, url, headers = {}) {
  const duraciones = [];
  let estado = 0;

  for (let i = 0; i < CALENTAMIENTO; i += 1) {
    await fetch(url, { headers });
  }

  for (let i = 0; i < ITERACIONES; i += 1) {
    const inicio = performance.now();
    const respuesta = await fetch(url, { headers });
    const fin = performance.now();
    estado = respuesta.status;
    if (!respuesta.ok) {
      throw new Error(`${nombre} respondió ${respuesta.status} en ${url}`);
    }
    duraciones.push(fin - inicio);
  }

  return {
    nombre,
    url,
    estado,
    p50: Number(percentil(duraciones, 50).toFixed(2)),
    p95: Number(percentil(duraciones, 95).toFixed(2)),
    max: Number(Math.max(...duraciones).toFixed(2)),
  };
}

async function main() {
  const resultados = [];
  resultados.push(await medir('health', `${BASE_URL}/api/health`));

  if (COOKIE) {
    resultados.push(
      await medir('menu', `${BASE_URL}/api/menu?fecha=${fechaHoy()}`, { cookie: COOKIE }),
    );
  } else {
    console.warn('PERF_COOKIE no está definido; se omite GET /api/menu (requiere sesión).');
  }

  const fallidos = resultados.filter((fila) => fila.p95 > UMBRAL_P95);
  console.table(resultados);

  if (fallidos.length > 0) {
    console.error(
      `p95 fuera de umbral (${UMBRAL_P95} ms): ${fallidos.map((fila) => fila.nombre).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`OK: p95 <= ${UMBRAL_P95} ms en ${resultados.length} endpoint(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
