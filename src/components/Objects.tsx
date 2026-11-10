import type { CSSProperties } from 'react';

const GEM_FACES = [0, 1, 2, 3];
const COIN_LAYERS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

const vars = (values: Record<string, string>) => values as CSSProperties;

/** Rotating Ethereum-style crystal built from eight CSS 3D triangles. `size` is the base edge in px. */
export function Gem({ size, reverse = false }: { size: number; reverse?: boolean }) {
  return (
    <span className="p3" aria-hidden="true">
      <span className="gem" style={{ ...vars({ '--s': `${size}px` }), animationDirection: reverse ? 'reverse' : undefined }}>
        {GEM_FACES.map((k) => (
          <i key={`t${k}`} className="t" style={vars({ '--a': `${k * 90}deg` })} />
        ))}
        {GEM_FACES.map((k) => (
          <i key={`b${k}`} className="b" style={vars({ '--a': `${k * 90}deg` })} />
        ))}
      </span>
    </span>
  );
}

/** Spinning coin: stacked discs give the edge its thickness. */
export function Coin({ size }: { size: number }) {
  return (
    <span className="p3" aria-hidden="true">
      <span className="coin" style={vars({ '--d': `${size}px` })}>
        {COIN_LAYERS.map((z) => (
          <i key={z} className={Math.abs(z) === 5 ? 'f' : undefined} style={vars({ '--z': `${z * 1.4}px` })} />
        ))}
      </span>
    </span>
  );
}

export function Ball({ size, color }: { size: number; color: string }) {
  return <span className="ball" aria-hidden="true" style={{ width: size, height: size, ...vars({ '--bc': color }) }} />;
}
