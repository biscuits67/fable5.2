import { useSyncExternalStore } from 'react';

export type Route = 'home' | 'app';
export const APP_HASH = '#/app';
export const HOME_HASH = '#/';

const readRoute = (): Route => (window.location.hash.startsWith(APP_HASH) ? 'app' : 'home');

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** Hash routing keeps the static build host-agnostic: no server rewrites are needed. */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, readRoute);
}

export function navigate(hash: string): void {
  window.location.hash = hash;
}
