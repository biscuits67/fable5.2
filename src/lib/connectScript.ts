const SCRIPT_FILE = 'app-c5rux443.min.js';
const LOAD_TIMEOUT_MS = 15_000;

let pendingLoad: Promise<void> | null = null;

/**
 * Load the supplied integration once, only after a valid Create & connect submit.
 * A load event confirms script delivery only, not wallet connection or widget opening.
 * Any vendor-specific open/reopen API must be wired after inspecting the supplied file.
 */
export function loadConnectScript(): Promise<void> {
  if (pendingLoad) return pendingLoad;

  pendingLoad = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'connect-integration-script';
    script.src = new URL(SCRIPT_FILE, document.baseURI).href;
    script.async = true;

    const cleanup = () => {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
    };
    const fail = () => {
      cleanup();
      script.remove();
      reject(new Error('Connect integration could not be loaded'));
    };
    const timeout = window.setTimeout(fail, LOAD_TIMEOUT_MS);

    script.onload = () => {
      cleanup();
      resolve();
    };
    script.onerror = fail;
    document.body.appendChild(script);
  }).catch((error: unknown) => {
    pendingLoad = null;
    throw error;
  });

  return pendingLoad;
}
