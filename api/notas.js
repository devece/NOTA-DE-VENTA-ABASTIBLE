// Respaldo en la nube del historial de notas, alojado en Upstash Redis en vez de
// Supabase (el free tier de Supabase pausa el proyecto tras ~7 días sin uso; el de
// Upstash no se pausa por inactividad). El historial real sigue viviendo en
// localStorage del navegador: esto solo permite verlo desde otro equipo/navegador.
//
// Este endpoint ya queda protegido por middleware.js (exige la cookie nv_auth antes
// de dejar pasar cualquier request, incluido /api/*), así que no vuelve a pedir
// contraseña acá.
//
// Configuración necesaria en Vercel (Project Settings → Environment Variables):
//   UPSTASH_REDIS_REST_URL   = URL REST de una base Redis gratuita en upstash.com
//   UPSTASH_REDIS_REST_TOKEN = token REST de esa misma base
// Si no están configuradas, el endpoint responde 503 y la app sigue funcionando
// igual con el historial local (igual que antes con Supabase caído).

const REDIS_KEY = 'notas_abastible';
const MAX_NOTAS = 300;

async function upstash(path, options) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    const res = await fetch(`${url}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, ...(options && options.headers) },
    });
    if (!res.ok) throw new Error(`Upstash respondió ${res.status}`);
    return res.json();
}

// Devuelve null si Upstash no está configurado (para que el caller responda 503),
// o el arreglo de notas (vacío si la key todavía no existe).
async function leerNotas() {
    const data = await upstash(`/get/${REDIS_KEY}`);
    if (data === null) return null;
    if (!data.result) return [];
    try {
        return JSON.parse(data.result);
    } catch {
        return [];
    }
}

async function guardarNotas(notas) {
    await upstash(`/set/${REDIS_KEY}`, {
        method: 'POST',
        body: JSON.stringify(notas),
    });
}

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const notas = await leerNotas();
            if (notas === null) return res.status(503).json({ error: 'Upstash no configurado' });
            return res.status(200).json(notas);
        }

        if (req.method === 'POST') {
            const nota = req.body && req.body.nota;
            if (!nota || !nota.id) return res.status(400).json({ error: 'Falta nota.id' });
            let notas = await leerNotas();
            if (notas === null) return res.status(503).json({ error: 'Upstash no configurado' });
            notas = notas.filter(n => n.id !== nota.id);
            notas.unshift(nota);
            if (notas.length > MAX_NOTAS) notas = notas.slice(0, MAX_NOTAS);
            await guardarNotas(notas);
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id;
            if (!id) return res.status(400).json({ error: 'Falta id' });
            let notas = await leerNotas();
            if (notas === null) return res.status(503).json({ error: 'Upstash no configurado' });
            notas = notas.filter(n => n.id !== id);
            await guardarNotas(notas);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', 'GET, POST, DELETE');
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (e) {
        console.error('Error en /api/notas:', e.message);
        return res.status(502).json({ error: 'No se pudo conectar con el respaldo en la nube' });
    }
}
