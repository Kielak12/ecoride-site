export function requireBasicAuth(request, env) {
  const h = request.headers.get('authorization') || '';
  if (!h.startsWith('Basic ')) return false;
  const token = atob(h.slice(6));
  const [u, p] = token.split(':', 2);
  return u === (env.ADMIN_USER || '123') && p === (env.ADMIN_PASS || '123');
}