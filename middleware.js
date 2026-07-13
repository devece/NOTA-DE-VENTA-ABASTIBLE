// Portón de acceso simple para todo el sitio: pide una contraseña compartida antes de
// servir cualquier página o archivo. Corre en el edge de Vercel (no en el navegador), así
// que no se puede saltar viendo el código fuente ni abriendo la consola.
//
// Configuración necesaria en Vercel (Project Settings → Environment Variables):
//   SITE_PASSWORD = <la contraseña que van a compartir con Abastible y contratistas>
// Si no está configurada, el middleware deja pasar sin pedir nada (para no dejar a todos
// afuera por un error de configuración).

export const config = {
    matcher: '/((?!favicon.ico).*)',
};

const COOKIE_NAME = 'nv_auth';

function comparacionSegura(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

function paginaLogin(error) {
    return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Acceso · Nota de Venta Abastible</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background:#f5f5f5; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
  form { background:white; padding:32px; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.1); width:100%; max-width:320px; }
  h1 { font-size:17px; color:#001489; margin:0 0 18px; font-weight:700; }
  input { width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; margin-bottom:12px; }
  button { width:100%; padding:10px; border:none; border-radius:8px; background:#FE5100; color:white; font-weight:600; font-size:14px; cursor:pointer; }
  .error { color:#dc2626; font-size:13px; margin-bottom:12px; }
</style></head>
<body>
  <form method="POST">
    <h1>🔒 Nota de Venta · Abastible</h1>
    ${error ? '<div class="error">Contraseña incorrecta</div>' : ''}
    <input type="password" name="password" placeholder="Contraseña" autofocus required>
    <button type="submit">Entrar</button>
  </form>
</body></html>`;
}

function respuestaLogin(error) {
    return new Response(paginaLogin(error), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

export default async function middleware(request) {
    const expected = process.env.SITE_PASSWORD;
    if (!expected) return; // sin contraseña configurada, no bloquear

    const cookieHeader = request.headers.get('cookie') || '';
    const yaAutenticado = cookieHeader.split(';').some(c => {
        const idx = c.indexOf('=');
        if (idx === -1) return false;
        const nombre = c.slice(0, idx).trim();
        const valor = c.slice(idx + 1).trim();
        return nombre === COOKIE_NAME && comparacionSegura(valor, expected);
    });
    if (yaAutenticado) return; // deja pasar

    if (request.method === 'POST') {
        const form = await request.formData();
        const password = String(form.get('password') || '');
        if (comparacionSegura(password, expected)) {
            const res = new Response(null, {
                status: 303,
                headers: { Location: request.url },
            });
            res.headers.append(
                'Set-Cookie',
                `${COOKIE_NAME}=${expected}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
            );
            return res;
        }
        return respuestaLogin(true);
    }

    return respuestaLogin(false);
}
