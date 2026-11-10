import type { ModelId } from '../data/models';

export function EthMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-4 -4 264 425" aria-hidden="true">
      <polygon points="128,0 0,212 128,154" />
      <polygon points="128,0 256,212 128,154" opacity=".75" />
      <polygon points="0,212 128,288 128,154" opacity=".8" />
      <polygon points="256,212 128,288 128,154" opacity=".6" />
      <polygon points="0,237 128,417 128,312" />
      <polygon points="256,237 128,417 128,312" opacity=".75" />
    </svg>
  );
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** One glyph per model: spark (Lumen), rising line (Vector), code brackets (Forge), stacked peaks (Apex). */
export function ModelIcon({ id }: { id: ModelId }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      {id === 'lumen' && (
        <path fill="currentColor" d="M12 2c.7 5.3 4.7 9.3 10 10-5.3.7-9.3 4.7-10 10-.7-5.3-4.7-9.3-10-10 5.3-.7 9.3-4.7 10-10z" />
      )}
      {id === 'vector' && (
        <g {...stroke}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </g>
      )}
      {id === 'forge' && (
        <g {...stroke}>
          <path d="M8 6l-6 6 6 6" />
          <path d="M16 6l6 6-6 6" />
          <path d="M13.5 4l-3 16" />
        </g>
      )}
      {id === 'apex' && (
        <g {...stroke}>
          <path d="M4 13l8-8 8 8" />
          <path d="M4 20l8-8 8 8" />
        </g>
      )}
    </svg>
  );
}

export function ThemeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 1.5a7.5 7.5 0 010 15z" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="2" y="5.2" width="8" height="5.6" rx="1.6" fill="currentColor" />
      <path d="M3.8 5.2V3.9a2.2 2.2 0 014.4 0v1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
