export function getActiveRoute() {
  let hash = window.location.hash;

  if (!hash || hash === '#') {
    return '/';
  }

  hash = hash.replace('#', '');

  return hash || '/';
}